require("dotenv").config()
const mysql = require("mysql2/promise")

const config = {
    host: "atp.fhstp.ac.at",
    port: 8007,
    user: "cc241005",
    password: "Vf5!Aq1-Rw2-",
    database: "cc241005",
}

// Create connection pool
const pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
})

// Execute query function with enhanced error handling
async function executeQuery(query, params = []) {
    let connection
    try {
        console.log("=== DATABASE QUERY START ===")
        console.log("Executing query:", query)
        console.log("With params:", params)

        connection = await pool.getConnection()
        console.log("Database connection acquired successfully")

        const [rows] = await connection.execute(query, params)

        console.log("Query executed successfully")
        console.log("Rows affected/returned:", Array.isArray(rows) ? rows.length : "N/A")
        console.log("=== DATABASE QUERY END ===")

        return rows
    } catch (error) {
        console.error("=== DATABASE QUERY ERROR ===")
        console.error("Query failed:", {
            query,
            params,
            error: error.message,
            code: error.code,
            sqlState: error.sqlState,
            errno: error.errno,
        })
        console.error("Full error object:", error)
        console.error("=== DATABASE QUERY ERROR END ===")

        // Re-throw with more context
        const enhancedError = new Error(`Database query failed: ${error.message}`)
        enhancedError.originalError = error
        enhancedError.query = query
        enhancedError.params = params
        throw enhancedError
    } finally {
        if (connection) {
            connection.release()
            console.log("Database connection released")
        }
    }
}

// Test connection function with better diagnostics
const testConnection = async () => {
    try {
        console.log("=== DATABASE CONNECTION TEST START ===")
        console.log("Testing database connection with config:", {
            host: config.host,
            port: config.port,
            user: config.user,
            database: config.database,
            // Don't log password for security
        })

        const connection = await pool.getConnection()
        console.log("✅ Database connection successful")

        // Test basic query
        try {
            const [result] = await connection.execute("SELECT 1 as test")
            console.log("✅ Basic query test successful:", result)
        } catch (queryError) {
            console.error("❌ Basic query test failed:", queryError.message)
        }

        // Test if books table exists and get its structure
        try {
            console.log("Checking books table structure...")
            const [columns] = await connection.execute("DESCRIBE books")
            console.log("✅ Books table exists with structure:")
            columns.forEach((col) => {
                console.log(
                    `  ${col.Field}: ${col.Type} ${col.Null === "YES" ? "NULL" : "NOT NULL"} ${
                        col.Default !== null ? `DEFAULT ${col.Default}` : ""
                    } ${col.Key ? `KEY: ${col.Key}` : ""}`,
                )
            })

            // Test if there are any books in the table
            const [bookCount] = await connection.execute("SELECT COUNT(*) as count FROM books")
            console.log(`Books table contains ${bookCount[0].count} records`)
        } catch (tableError) {
            console.error("❌ Books table issue:", tableError.message)
            console.error("This might be why the dashboard is failing!")

            if (tableError.code === "ER_NO_SUCH_TABLE") {
                console.error("CRITICAL: Books table does not exist!")
                console.error("Please run the database migration scripts to create the books table.")
            } else if (tableError.code === "ER_BAD_FIELD_ERROR") {
                console.error("CRITICAL: Books table has missing or incorrect columns!")
                console.error("Please run the database migration scripts to update the table structure.")
            }
        }

        connection.release()
        console.log("=== DATABASE CONNECTION TEST END ===")
        return true
    } catch (error) {
        console.error("=== DATABASE CONNECTION TEST FAILED ===")
        console.error("❌ Database connection failed:", error.message)
        console.error("Error code:", error.code)
        console.error("Error details:", {
            host: config.host,
            port: config.port,
            user: config.user,
            database: config.database,
        })
        console.error("=== DATABASE CONNECTION TEST END ===")
        return false
    }
}

// Enhanced connection monitoring
pool.on("connection", (connection) => {
    console.log("New database connection established as id " + connection.threadId)
})

pool.on("error", (err) => {
    console.error("Database pool error:", err)
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("Database connection was closed.")
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
        console.error("Database has too many connections.")
    }
    if (err.code === "ECONNREFUSED") {
        console.error("Database connection was refused.")
    }
})

// Test the connection on startup
console.log("🚀 Starting database service...")
testConnection().then((success) => {
    if (success) {
        console.log("✅ Database service initialized successfully")
    } else {
        console.error("❌ Database service initialization failed")
    }
})

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("Shutting down database service...")
    try {
        await pool.end()
        console.log("✅ Database connections closed gracefully")
    } catch (error) {
        console.error("❌ Error closing database connections:", error)
    }
    process.exit(0)
})

process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, shutting down database service...")
    try {
        await pool.end()
        console.log("✅ Database connections closed gracefully")
    } catch (error) {
        console.error("❌ Error closing database connections:", error)
    }
    process.exit(0)
})

module.exports = {
    pool,
    executeQuery,
    testConnection,
}