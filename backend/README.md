# PMS Backend

Express + MongoDB REST API for the Project Management System.

## Setup
```bash
cp .env.example .env
npm install
npm run seed   # optional: demo admin/users/projects
npm run dev    # http://localhost:5000
```

## Scripts
| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start production server |
| `npm run seed` | Seed demo data |

## Environment
See [`.env.example`](./.env.example). Key vars: `MONGO_URI`, `JWT_SECRET`,
`STORAGE_DRIVER` (`local`|`cloudinary`), `CLIENT_URL`.

Full API reference and feature mapping are in the [root README](../README.md).
