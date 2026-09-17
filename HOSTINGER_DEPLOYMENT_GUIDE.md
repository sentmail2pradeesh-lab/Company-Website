# 🚀 Production Deployment Guide for `vistaeditz.com` (Hostinger)

This guide provides explicit, step-by-step instructions to deploy the **Vistaeditz / ASZEN Platform** (Vite React Frontend + Python Flask Backend + MySQL Database) to your live domain **`vistaeditz.com`** on **Hostinger**.

---

## 🧹 Pre-Deployment System Cleaning Complete
All test data has been removed from the system:
- **0 Test Users**: Only Master Admin (`arun@aszen.com`) exists in the database.
- **0 Test Clients**: Database `clients` table is clean.
- **0 Test Jobs & Stages**: Database `jobs` and `job_stages` tables are clean.
- **0 Test Production Sheets**: Database `production_sheets` table is clean.
- **0 Test Attendance Logs**: Database `work_sessions` table is clean.
- **Fresh Production Frontend Bundle**: Created at `frontend/dist/`.

---

## 📋 Required Deployment Files Overview

| Target Folder / File | Location in Repository | Purpose on Hostinger |
|---|---|---|
| **Frontend Bundle** | `frontend/dist/` | Files to upload to Hostinger `public_html/` |
| **Backend Code** | `backend/` | Python Flask application files |
| **Database Schema** | `database.sql` | Clean MySQL database import script for phpMyAdmin |
| **SPA Router Config** | `.htaccess` (detailed below) | Ensures clean React URL routing & API proxying |

---

## 🛠️ STEP 1: Set Up MySQL Database on Hostinger

1. Log into your **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Go to **Databases** $\rightarrow$ **Management**.
3. Create a new MySQL database for `vistaeditz.com`:
   - **Database Name**: e.g., `u123456789_vistaeditz` (Hostinger auto-prefixes your user ID)
   - **Database Username**: e.g., `u123456789_admin`
   - **Password**: *Create a strong password and save it securely*.
4. Next to your new database, click **Enter phpMyAdmin**.
5. In phpMyAdmin:
   - Click the **Import** tab in the top navigation.
   - Choose the file [`database.sql`](file:///d:/Company-Website/database.sql) from your workspace.
   - Click **Go** at the bottom.
   - *Result: All 8 production tables will be created cleanly with Master Admin `arun@aszen.com` (Password: `Aszen@123`).*

---

## 🌐 STEP 2: Deploy React Frontend (`public_html/`)

1. In Hostinger hPanel, go to **Websites** $\rightarrow$ Click **Dashboard** next to `vistaeditz.com`.
2. Open **File Manager** $\rightarrow$ Navigate to `public_html/`.
3. If there are default Hostinger files (e.g. `default.php` or `index.php`), **delete them**.
4. Upload all files from your local [`frontend/dist/`](file:///d:/Company-Website/frontend/dist) folder into `public_html/` (choose **Overwrite** when prompted):
   ```text
   public_html/
   ├── index.html
   ├── hero-reel.mp4
   ├── vistaeditz_logo.svg
   ├── visteditz_logo.svg
   ├── .htaccess
   ├── gallery/
   └── assets/
       ├── index-4bkBvzW1.css
       └── index-CRNVyga4.js
   ```
5. Create an `.htaccess` file inside `public_html/` to support React single-page routing without 404 errors:

   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /

     # Handle API requests proxy or passthrough if backend runs on subdomain/port
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## 🐍 STEP 3: Deploy Python Flask Backend App

1. In Hostinger hPanel left menu, go to **Advanced** $\rightarrow$ **Setup Python App** (or **Web Apps**).
2. Click **Create Application**:
   - **Python Version**: Select `3.10` or `3.11`.
   - **Application Root**: `backend` (or `public_html/api` if using subfolder).
   - **Application URL**: `vistaeditz.com` (or `api.vistaeditz.com`).
   - **Application Startup File**: `app.py`
   - **Application Entry Point**: `app`
3. Upload the contents of your local [`backend/`](file:///d:/Company-Website/backend) folder to the server.
4. Create a `.env` file inside `backend/` on Hostinger with your live database configuration:
   ```env
   FLASK_ENV=production
   SECRET_KEY=vistaeditz-production-super-secret-key-2026!
   JWT_SECRET_KEY=vistaeditz-jwt-secret-key-998877!
   DATABASE_URL=mysql+pymysql://u123456789_admin:YOUR_MYSQL_PASSWORD@localhost/u123456789_vistaeditz
   ```
5. In the Hostinger Python app manager or SSH Terminal, install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Click **Restart Application**.

---

## 🔒 STEP 4: SSL & Domain Verification

1. In Hostinger hPanel, go to **Security** $\rightarrow$ **SSL**.
2. Ensure **Free SSL Certificate** is active for `vistaeditz.com` and `www.vistaeditz.com` (forces `https://`).

---

## 🔐 STEP 5: First Login & Admin Verification

1. Open your browser and navigate to `https://vistaeditz.com/`.
2. Click **Login** / **Admin Panel**.
3. Sign in with Master Admin Credentials:
   - **Email**: `arun@aszen.com`
   - **Password**: `Aszen@123`
4. In the **Admin Control Panel**:
   - Change your default admin password via **Change Password**.
   - Add your actual employee personnel (e.g. Editors, Managers, QC Leads).
   - Add your registered client accounts.

---

### 🎉 Your clean, production-ready system is now deployed on `vistaeditz.com`!
