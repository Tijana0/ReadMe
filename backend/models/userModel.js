const { executeQuery } = require("../services/database")

class User {
    constructor(data) {
        this.id = data.id
        this.name = data.name
        this.surname = data.surname
        this.email = data.email
        this.password_hash = data.password_hash
        this.description = data.description
        this.profilePicture = data.profilePicture
        this.role = data.role // Add role field
    }

    static async create(userData) {
        const { name, surname, email, password_hash, description = null, profilePicture = null, role = "user" } = userData
        const query =
            "INSERT INTO readers (name, surname, email, password_hash, description, profilePicture, role) VALUES (?, ?, ?, ?, ?, ?, ?)"
        const result = await executeQuery(query, [name, surname, email, password_hash, description, profilePicture, role])
        return result.insertId
    }

    static async findByEmail(email) {
        const query = "SELECT * FROM readers WHERE email = ?"
        const rows = await executeQuery(query, [email])
        return rows.length > 0 ? new User(rows[0]) : null
    }

    static async findByUsername(name) {
        const query = "SELECT * FROM readers WHERE name = ?"
        const rows = await executeQuery(query, [name])
        return rows.length > 0 ? new User(rows[0]) : null
    }

    static async findById(id) {
        const query = "SELECT * FROM readers WHERE id = ?"
        const rows = await executeQuery(query, [id])
        return rows.length > 0 ? new User(rows[0]) : null
    }

    static async update(id, updateData) {
        const fields = []
        const values = []
        if (updateData.name) {
            fields.push("name = ?")
            values.push(updateData.name)
        }
        if (updateData.surname) {
            fields.push("surname = ?")
            values.push(updateData.surname)
        }
        if (updateData.email) {
            fields.push("email = ?")
            values.push(updateData.email)
        }
        if (updateData.password_hash) {
            fields.push("password_hash = ?")
            values.push(updateData.password_hash)
        }
        if (updateData.description !== undefined) {
            fields.push("description = ?")
            values.push(updateData.description)
        }
        if (updateData.profilePicture !== undefined) {
            fields.push("profilePicture = ?")
            values.push(updateData.profilePicture)
        }
        if (updateData.role) {
            fields.push("role = ?")
            values.push(updateData.role)
        }
        if (fields.length === 0) return false
        const query = `UPDATE readers SET ${fields.join(", ")} WHERE id = ?`

        console.log(query)
        values.push(id)
        await executeQuery(query, values)
        return true
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            surname: this.surname,
            email: this.email,
            description: this.description,
            profilePicture: this.profilePicture,
            role: this.role, // Include role in JSON output
            created_at: this.created_at,
        }
    }
}

module.exports = User