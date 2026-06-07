# PMS Frontend

React (Vite) + Redux Toolkit + Tailwind CSS client for the Project Management System.

## Setup
```bash
cp .env.example .env   # optional
npm install
npm run dev            # http://localhost:5173
```

The dev server proxies `/api` and `/uploads` to `http://localhost:5000`.
For a deployed backend, set `VITE_API_URL` in `.env`.

## Scripts
| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

## Pages
Login, Signup, Dashboard, Projects (list + search/filter/paginate), Create/Edit
Project, Project Details, User Management, Profile, Activity Log — plus a
light/dark theme toggle and real-time toast notifications via Socket.io.

Full feature mapping is in the [root README](../README.md).
