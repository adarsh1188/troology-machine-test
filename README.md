# Project Management System (MERN — Advanced Machine Test)

A production-style **Project Management System** built with the MERN stack
(MongoDB, Express, React, Node.js).

- **Admins** manage users and projects.
- **Users** view projects assigned to them and update their progress.

> Backend and frontend live in separate folders (`/backend`, `/frontend`) and run independently.

---

## ✨ Features (mapped to the assessment)

| Requirement | Status | Where |
|---|---|---|
| JWT login & signup | ✅ | `backend/src/controllers/auth.controller.js` |
| Password hashing (bcrypt) | ✅ | `backend/src/models/User.js` (pre-save hook) |
| Role-based access (Admin / User) | ✅ | `backend/src/middleware/{auth,roles}.js` |
| Only Admin creates users | ✅ | `POST /api/users` (admin-guarded) |
| Admin create/update/delete projects | ✅ | `backend/src/controllers/project.controller.js` |
| Users update **status only** | ✅ | `PATCH /api/projects/:id/status` |
| Project fields (title, description, dates, status, assignedUsers, attachments) | ✅ | `backend/src/models/Project.js` |
| File upload via **Multer**, max 3, local/Cloudinary | ✅ | `backend/src/middleware/upload.js`, `services/storage.service.js` |
| Dashboard analytics | ✅ | `GET /api/dashboard` |
| User module (CRUD, change roles, self-profile) | ✅ | `backend/src/controllers/user.controller.js` |
| Frontend: Login, Dashboard, Project List/Create/Details, Status update, User Mgmt | ✅ | `frontend/src/pages` |
| Axios, React Router, Redux Toolkit, Tailwind | ✅ | `frontend/` |
| **Bonus:** Theme toggle | ✅ | `frontend/src/store/themeSlice.js` |
| **Bonus:** Real-time notifications (Socket.io) | ✅ | `backend/src/config/socket.js`, `frontend/src/api/socket.js` |
| **Bonus:** Activity logs | ✅ | `GET /api/activity` |
| **Bonus:** Search, filter, pagination | ✅ | Projects & Users lists |
| Postman collection | ✅ | `postman_collection.json` |

---

## 🧱 Tech Stack

**Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs, Multer, Socket.io, express-rate-limit
**Frontend:** React 18 (Vite), Redux Toolkit, React Router v6, Axios, Tailwind CSS, react-toastify, socket.io-client

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas connection string

### 1. Backend

```bash
cd backend
cp .env.example .env        # then edit values (MONGO_URI, JWT_SECRET, ...)
npm install
npm run seed                # creates demo admin + users + projects (optional)
npm run dev                 # http://localhost:5000
```

Seeded demo accounts:
- **Admin** — `admin@pms.com` / `Admin@123`
- **User** — `alice@pms.com` / `User@123`

### 2. Frontend

```bash
cd frontend
cp .env.example .env        # optional; defaults work with the dev proxy
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`,
so no CORS setup is needed in development.

---

## 📡 API Overview

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register (role forced to `user`) |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Auth | Current user |

### Users (Admin unless noted)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List (`?search=&role=&page=&limit=`) |
| POST | `/users` | Admin | Create user |
| GET | `/users/:id` | Admin | Get user |
| PUT | `/users/:id` | Admin | Update user |
| PATCH | `/users/:id/role` | Admin | Change role |
| DELETE | `/users/:id` | Admin | Delete user |
| PUT | `/users/me/profile` | Auth | Update own profile |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/projects` | Auth | List (`?search=&status=&page=&limit=&sort=`). Users see only assigned |
| GET | `/projects/:id` | Auth | Details (assigned/admin only) |
| POST | `/projects` | Admin | Create (multipart, up to 3 `attachments`) |
| PUT | `/projects/:id` | Admin | Update (+ append attachments) |
| PATCH | `/projects/:id/status` | Admin or assigned user | Update status only |
| DELETE | `/projects/:id` | Admin | Delete |
| DELETE | `/projects/:id/attachments/:attachmentId` | Admin | Remove attachment |

### Dashboard & Activity
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard` | Auth | totalUsers, totalProjects, projectsByStatus, projectsEndingWithin7Days |
| GET | `/activity` | Admin | Paginated activity log |

A ready-to-import **Postman collection** is in [`postman_collection.json`](./postman_collection.json).
It captures the JWT automatically after login/signup via a test script.

---

## 📁 Project Structure

```
Machine-Test/
├── backend/
│   ├── src/
│   │   ├── config/        # env, db, socket
│   │   ├── controllers/   # auth, user, project, dashboard, activity
│   │   ├── middleware/    # auth, roles, upload, error
│   │   ├── models/        # User, Project, ActivityLog
│   │   ├── routes/        # route definitions
│   │   ├── services/      # storage (local/Cloudinary)
│   │   ├── utils/         # token, asyncHandler, ApiError, activity, seed
│   │   ├── app.js         # Express app
│   │   └── server.js      # HTTP + Socket.io bootstrap
├── frontend/
│   └── src/
│       ├── api/           # axios instance, socket client
│       ├── components/    # Layout, ProtectedRoute, StatusBadge, ...
│       ├── pages/         # Login, Dashboard, Projects, ...
│       └── store/         # Redux Toolkit slices
├── postman_collection.json
└── README.md
```

---

## 🔐 Security Notes
- Passwords hashed with bcrypt (salt rounds 10); never returned in responses.
- JWT in `Authorization: Bearer <token>` header; verified per request against the live user.
- Role guards on every privileged route.
- Rate limiting on the `/api/auth` surface.
- File-type allow-list and 5 MB/file size limit on uploads.

## ☁️ Deployment
- **Backend:** Render / Railway / any Node host. Set env vars from `.env.example`; use MongoDB Atlas for `MONGO_URI`.
- **Frontend:** `npm run build` → deploy `dist/` to Vercel / Netlify. Set `VITE_API_URL` to the deployed backend URL.
