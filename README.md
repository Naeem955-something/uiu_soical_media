# UniConnect - Campus Academic & Community Portal

A unified full-stack academic web application for university students and faculty members.

---

## 🏗️ Architecture Overview

- **Frontend**: React 19 + TypeScript + Vite + Lucide Icons + Custom Modern CSS
- **Backend**: Node.js + Express.js + Mongoose + JWT + bcryptjs
- **Database**: MongoDB (supports external MongoDB instance / MongoDB Atlas or auto-starts embedded MongoDB via `mongodb-memory-server` if local MongoDB is not running)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)
- *(Optional)* **MongoDB** (if you have MongoDB running locally or on MongoDB Atlas; if not, an embedded MongoDB will start automatically with zero extra setup)

---

### 2. Backend Setup (`/server`)

1. Open a terminal and navigate to the project root:
   ```bash
   cd server
   npm install
   ```
2. Configuration is located in `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/uniconnect
   JWT_SECRET=uniconnect_jwt_secret_key_2024
   ```
   > **Note**: If `MONGODB_URI` cannot connect (e.g. MongoDB service is not started), the server automatically starts an embedded MongoDB instance and seeds it with complete mock data.

3. To seed the database manually at any time:
   ```bash
   npm run seed
   ```

4. Start the backend server:
   ```bash
   npm start
   # Or for auto-reload during development:
   npm run dev
   ```
   The backend will be running at `http://localhost:5000`.

---

### 3. Frontend Setup

1. From the project root directory, install dependencies (if not already installed):
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.
   Vite includes a proxy configuration that forwards `/api` requests to `http://localhost:5000`.

3. Alternatively, run both from the root:
   - Terminal 1: `npm run server`
   - Terminal 2: `npm run dev`

---

## 🔑 Demo Accounts

The database comes pre-seeded with two active accounts:

| Role | Email | Password |
|---|---|---|
| **Student** | `student@university.edu` | `password123` |
| **Faculty** | `faculty@university.edu` | `password123` |

You can also use the one-click **Demo Student** and **Demo Faculty** buttons on the Login page or register a new user.

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student or faculty member
- `POST /api/auth/login` — Sign in with email and password (returns JWT)
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/me` — Update user profile details

### 📝 Campus Feed & Posts (`/api/posts`)
- `GET /api/posts` — Get all campus posts (with computed `timeAgo` and populated author)
- `POST /api/posts` — Create a new post (supports attachments and polls)
- `PUT /api/posts/:id/like` — Toggle like on a post
- `POST /api/posts/:id/comments` — Add a comment to a post
- `PUT /api/posts/:id/vote` — Vote on a poll option

### 🎪 Events (`/api/events`)
- `GET /api/events` — Get all campus events
- `POST /api/events` — Create a new campus event
- `PUT /api/events/:id/register` — Toggle RSVP / registration for an event

### 🛒 Marketplace (`/api/marketplace`)
- `GET /api/marketplace` — Get all marketplace listings
- `POST /api/marketplace` — Post a new item for sale
- `PUT /api/marketplace/:id/bookmark` — Toggle bookmarking an item

### 🔍 Lost & Found (`/api/lostfound`)
- `GET /api/lostfound` — Get all reported lost and found items
- `POST /api/lostfound` — Report a lost or found item

### 📚 Academic Resources (`/api/resources`)
- `GET /api/resources` — Get lecture notes, cheat sheets, lab templates
- `POST /api/resources` — Upload a new academic resource
- `PUT /api/resources/:id/bookmark` — Bookmark a resource

### 💬 Chat & Messaging (`/api/chat`)
- `GET /api/chat` — Get user conversation channels
- `GET /api/chat/:id` — Get full message thread for a conversation
- `POST /api/chat/:id/messages` — Send message with attachments

### 🔔 Notifications (`/api/notifications`)
- `GET /api/notifications` — Get user notifications
- `PUT /api/notifications/read-all` — Mark all notifications as read
- `PUT /api/notifications/:id/read` — Mark specific notification as read

### 🛡️ Admin Moderation (`/api/admin`)
- `GET /api/admin/reports` — Get moderation queue reports
- `PUT /api/admin/reports/:id` — Update report status (`Reviewed`, `Dismissed`)
- `DELETE /api/admin/reports/:id` — Remove resolved report
