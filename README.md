# ReadMe 📚

**ReadMe** is a beautiful, modern web application designed for book lovers to track their reading journeys, manage their personal libraries, and share reviews with a global community of readers.

---

## 🚀 Features

*   **📖 Personal Library**: Add and organize books into categories: *Want to Read*, *Currently Reading*, and *Read*.
*   **📈 Progress Tracking**: Update your reading progress (pages read) and mark books as completed.
*   **🌟 Global Reviews & Ratings**: Write, edit, and delete reviews. Reviews are shared globally across all users who have the same book (linked by Google Book ID or Title + Author).
*   **🔍 Book Search**: Search the Google Books API to discover new titles, view their global ratings/reviews, and add them directly to your library.
*   **🎨 Premium Aesthetics**: A fully responsive, dark green and cream literary-themed interface with smooth micro-animations and a custom "Lost in the Stacks" 404 page.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), React Router DOM, Axios, Lucide React, Vanilla CSS.
*   **Backend**: Node.js, Express, MySQL (`mysql2` connection pool).
*   **Deployment**: Vercel (Monorepo configuration).

---

## 💻 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [MySQL Server](https://www.mysql.com/)

### 1. Database Setup
Create a MySQL database and run your schema migrations to set up the `users`, `books`, and `reviews` tables.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=3001
   DB_HOST=your-database-host
   DB_PORT=your-database-port
   DB_USER=your-database-username
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   JWT_SECRET=your-jwt-secret-key
   GOOGLE_BOOKS_API_KEY=your-google-books-api-key (optional)
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment on Vercel

The project is configured for Vercel using a single-service monorepo deployment defined in the root [vercel.json](vercel.json):
*   Vercel builds the React frontend and copies the build output into `backend/dist`.
*   All incoming traffic is routed to the Express backend (`server.js`).
*   The backend serves the API routes under `/api/*` and uses its static file server to serve the React SPA and handle client-side routing.
