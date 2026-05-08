# Assignify

Assignify is a full-stack assignment portal for students and teachers.

Students can:
- sign up, log in, and finish profile setup
- join courses from shareable links
- submit, re-submit, download, and delete assignment files
- track progress across dashboard, courses, calendar, and progress pages

Teachers can:
- sign up and log in with teacher accounts
- manage course cards, join visibility, and shareable join links
- review enrolled students by course
- post assignments with deadlines, file-type expectations, and visibility
- review active submissions and past assignment history

## Stack

- Frontend: React + Vite + React Router
- Backend: Express + MongoDB + Mongoose
- Auth: JWT

## Local setup

### 1. Frontend

```bash
cd "/Users/abhinav/Github/Assignment Portal/Assignify"
cp .env.example .env
npm install
npm run dev
```

### 2. Backend

```bash
cd "/Users/abhinav/Github/Assignment Portal/Assignify/server"
cp .env.example .env
npm install
npm run start
```

Default local URLs:
- frontend: `http://localhost:5173`
- backend: `http://localhost:8000`

## Environment variables

### Frontend

`VITE_API_URL`
- Example: `http://localhost:8000`

### Backend

`PORT`
- Example: `8000`

`MONGODB_URI`
- Example: `mongodb://127.0.0.1:27017/assignify`

`JWT_SECRET`
- Use a long random secret in production

`CLIENT_ORIGIN`
- Comma-separated allowed frontend origins
- Example: `http://localhost:5173,https://assignify-web.onrender.com`

## Teacher accounts

Teacher accounts are created through the teacher signup flow in the app.

## Production notes

- The backend exposes a health endpoint at `/health`
- CORS accepts multiple origins through `CLIENT_ORIGIN`
- Frontend routing needs SPA rewrites enabled
- The included [render.yaml](/Users/abhinav/Github/Assignment%20Portal/Assignify/render.yaml) is set up for deploying the frontend and backend on Render

## Build checks

```bash
cd "/Users/abhinav/Github/Assignment Portal/Assignify"
npm run lint
npm run build
node --check server/server.js
```
