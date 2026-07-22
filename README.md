# ASZEN Technologies Website

A modern website for ASZEN Technologies with photo editing, video editing, and blog pages — matching the reference design with animations, background video hero, and a right-side login drawer.

## Project Structure

```
Aszen/
├── frontend/     React + Vite
├── backend/      Flask API
└── database.sql  MySQL schema
```

## Features

- **Navbar** — Photo editing, Video editing, Blogs + Login button
- **Login popup** — Slides in from the right with email/password and forgot password
- **Hero section** — Full-screen background video (upload your own)
- **Animations** — Framer Motion for page transitions, scroll reveals, and hover effects
- **Backend** — JWT auth, forgot password, blogs API

## Getting Started

### 1. Database

```bash
mysql -u root -p < database.sql
```

Update `backend/config.py` or set `DATABASE_URL`:

```
mysql+pymysql://root:YOUR_PASSWORD@localhost/aszen_db
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Site runs at `http://localhost:5173`

### 4. Background Video

Place your video at:

```
frontend/public/videos/hero-video.mp4
```

Until you add it, the hero shows a fallback poster image.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/me` | Current user (JWT) |
| POST | `/api/auth/forgot-password` | Send reset link |
| GET | `/api/blogs` | List blogs |
| POST | `/api/blogs` | Create blog (JWT) |

## Environment Variables (optional)

```
SECRET_KEY=
JWT_SECRET=
DATABASE_URL=
MAIL_USERNAME=
MAIL_PASSWORD=
FRONTEND_URL=http://localhost:5173
```
