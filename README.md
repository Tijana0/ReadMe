# ReadMe

ReadMe is a full-stack reading tracker for managing a personal library, tracking reading progress, discovering books, and sharing reviews.

The project combines a React frontend with an Express REST API and a MySQL database. It also integrates the Google Books API for book discovery and metadata.

## Features

- Organize books into **Want to Read**, **Currently Reading**, and **Read**
- Track reading progress by page count
- Mark favorite books
- Search for books through the Google Books API
- Add books from search results to a personal library
- Write, edit, and delete reviews
- View ratings and reviews associated with the same book
- Use protected user accounts with token-based authentication
- Explore dashboard and reading progress views
- Responsive interface with a custom 404 page

## Tech stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Vanilla CSS
- Lucide React

### Backend

- Node.js
- Express
- MySQL with `mysql2`
- JSON Web Tokens
- bcrypt
- Google Books API

## Architecture

```text
React frontend
      |
      | HTTP / JSON
      v
Express REST API
      |
      +------> Google Books API
      |
      v
MySQL database
```

The frontend communicates with API routes for authentication, books, users, and reviews. Protected backend routes validate bearer tokens before accessing user-specific data.

Passwords are hashed with bcrypt, and authenticated sessions use JSON Web Tokens.

## Project structure

```text
.
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── styles/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── server.js
└── vercel.json
```

## Local setup

### Prerequisites

- Node.js
- MySQL

### 1. Clone the repository

```bash
git clone https://github.com/Tijana0/ReadMe.git
cd ReadMe
```

### 2. Configure the backend

Create `backend/.env`:

```env
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
GOOGLE_BOOKS_API_KEY=optional-google-books-api-key
PORT=3001
```

The `.env` file is ignored by Git and should never be committed.

The project expects a compatible MySQL schema for its users, books, reviews, and reading data. SQL migration files are not currently included in this repository, so a local database must be prepared separately.

### 3. Install and start the backend

```bash
cd backend
npm install
node server.js
```

### 4. Install and start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will print the local frontend address in the terminal.

## API overview

The backend is organized around these route groups:

- `/api/auth` for registration, login, and token validation
- `/api/books` for library management, search, favorites, and dashboard data
- `/api/users` for user-related data
- `/api/reviews` for reviews and ratings

## Security notes

- Passwords are hashed with bcrypt.
- Protected routes require a bearer token.
- Database credentials and authentication secrets are loaded from environment variables.
- Environment files are excluded through `.gitignore`.

## Status

This project is part of my software development portfolio and remains a useful example of full-stack application structure, API integration, authentication, and relational data handling.
