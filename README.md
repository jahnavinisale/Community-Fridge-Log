# Community Fridge Log

A shared food inventory, distribution tracking, and waste audit web application built for community fridges.

**Audience:** Authorised volunteers who inspect donations and manage fridge stock (internal operational tool, not public-facing).  
**Purpose:** Ensure donated food is distributed safely before its use-by date, and record all food collections and disposals with mandatory safety reasons.

---

## Key Differentiating Features

1. **Use-By Date Urgency Highlighting:**
   - Every food item's safe consumption timeline is tracked and categorized:
     - `Expired` (past use-by date; red warning; immediate inspection or disposal required).
     - `Use Today` (expires today; amber alert; highest collection priority).
     - `Soon (1-2 Days)` (expiring in 1 to 2 days; highlighted for prompt distribution).
     - `Adequate Shelf Life` (safe stock with 3+ days remaining).
   - The dashboard surfaces an **"Act Now"** section first so volunteers arriving at the fridge immediately see what needs attention.
   - Statuses are indicated using explicit text badges, icons, and high-contrast color palettes (never color alone), adhering to WCAG 2.1 AA standards.

2. **Mandatory Disposal Reasons with Waste Auditing:**
   - Disposals cannot be logged without an audited reason (`expired`, `spoiled`, `damaged_packaging`, `contamination_suspected`, `recalled`, `other`).
   - If reason `other` is selected, a descriptive note (minimum 3 characters) is strictly enforced by both client and server validation schemas.
   - Volunteers and coordinators can review the disposal audit log to uncover root causes of food waste (for example packaging damage during transit or repeated spoilage of specific items).

3. **Responsive Mobile-First Interface with Stacked Cards:**
   - On desktop and tablet viewports, records are displayed in sortable data tables.
   - On mobile screens (360px+), tables automatically convert into touch-friendly stacked cards, preventing horizontal clipping.

4. **CSV Data Export:**
   - One-click RFC-4180 compliant CSV export for both Collection and Disposal logs with UTF-8 BOM encoding for Excel compatibility.

---

## Technical Stack

- **Client:** React 18, Vite, React Router v6, Tailwind CSS, Lucide icons.
- **Server:** Node.js, Express REST API, Mongoose, Zod schema validation, Helmet, express-rate-limit, CORS.
- **Database:** MongoDB with Mongoose ODM (supports MongoDB Atlas and automatic embedded in-memory MongoDB fallback).
- **Typography:** IBM Plex Sans (neutral, highly legible grotesk typeface designed for data-dense screens).
- **Design Palette:** Restrained warm off-white base (`#FAF8F4`), near-black body text (`#1C1B19`), and deep forest green accent (`#1F5E43`).
- **Tests:** Vitest and Supertest unit and integration test suites.

---

## Quickstart & Installation

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 2. Install All Dependencies
From the repository root, run:
```bash
npm run install:all
```
*(Or run `npm install` in the root, `/server`, and `/client` directories separately).*

### 3. Environment Configuration
The server configuration resides in `server/.env`. A template is provided in `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/community_fridge
JWT_SECRET=super_secure_community_fridge_jwt_secret_key_2026_demo
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
*Note: If no external MongoDB instance is running, the server automatically starts an embedded in-memory MongoDB runner so the project can be tested immediately with zero database installation.*

### 4. Seed Realistic Sample Data
Populate demo accounts, fridge locations, and sample food items across all 4 use-by categories:
```bash
npm run seed
```

### 5. Start the Application
To run both backend API server and frontend React client concurrently:
```bash
npm run dev
```
- Frontend client will be running at: `http://localhost:5173`
- Backend API server will be running at: `http://localhost:5000`
- API health check: `http://localhost:5000/api/health`

---

## Demo Accounts for Evaluation

Quick one-click login buttons are provided on the login page for evaluator convenience:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@communityfridge.org` | `AdminPass123!` | Full access + Volunteer user management |
| **Volunteer** | `sarah.volunteer@communityfridge.org` | `Volunteer123!` | Stock viewing, intake, collections & disposals |
| **Volunteer** | `marcus.volunteer@communityfridge.org` | `Volunteer123!` | Stock viewing, intake, collections & disposals |

*Public registration is deliberately disabled: only administrators can create and deactivate volunteer accounts.*

---

## Running Automated Tests

Run the complete test suite:

```bash
# Run server API and date logic tests
npm run test

# Run client date logic unit tests
cd client && npm test

# Run production client build
cd client && npm run build
```

---

## Deployment Guide

This application is ready for production deployment with a decoupled architecture:
- **Database:** MongoDB Atlas (Cloud Database)
- **Backend API:** Render (Node.js Web Service)
- **Frontend Client:** Vercel (Static Site with SPA Routing)

### 1. MongoDB Atlas Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Deploy a new shared cluster (e.g. M0 Free Tier in your preferred region).
3. Under **Security > Database Access**, create a database user:
   - Authentication Method: Password
   - Database User Privileges: Read and write to any database
4. Under **Security > Network Access**, click **Add IP Address**:
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Render instances can connect dynamically.
5. In your cluster dashboard, click **Connect > Drivers > Node.js**:
   - Copy the connection URI:
     `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/community_fridge_log?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password.

### 2. Backend Deployment on Render
1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name:** `community-fridge-log-api`
   - **Region:** Closest to your users
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add the following **Environment Variables** in Render:
   | Variable | Value / Description | Example |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | `production` |
   | `PORT` | `10000` (or leave default, Render sets `PORT`) | `10000` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.mongodb.net/community_fridge_log` |
   | `JWT_SECRET` | Strong random secret (at least 32 characters) | `e2a7f5b8c9d1e3f4a6b8c0d2e4f6a8b0` |
   | `JWT_EXPIRES_IN` | Session token lifetime | `7d` |
   | `CLIENT_ORIGIN` | Your deployed frontend URL on Vercel | `https://community-fridge-log.vercel.app` |
   | `ADMIN_NAME` | Initial administrator name | `Elena Rostova` |
   | `ADMIN_EMAIL` | Initial administrator login email | `admin@communityfridge.org` |
   | `ADMIN_PASSWORD` | Initial administrator secure password | `AdminPass123!` |
6. Click **Create Web Service**. Once deployed, copy your Render service URL (e.g. `https://community-fridge-log-api.onrender.com`).
7. Test the health endpoint: `https://community-fridge-log-api.onrender.com/api/health`.

### 3. Frontend Deployment on Vercel
1. Log into [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import the same GitHub repository.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click edit and select `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the following **Environment Variable** in Vercel:
   | Variable | Value / Description | Example |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | Your Render API base URL with `/api` path | `https://community-fridge-log-api.onrender.com/api` |
5. Note: SPA routing is pre-configured via [`client/vercel.json`](file:///d:/Projects/Community%20Fridge%20Log/client/vercel.json) using rewrites to prevent 404 errors on page reload.
6. Click **Deploy**. Once finished, copy your Vercel production domain (e.g. `https://community-fridge-log.vercel.app`).
7. Update `CLIENT_ORIGIN` in your Render Web Service environment variables to match your exact Vercel domain so CORS requests are permitted.

---

## Documentation

- [`/docs/ASSUMPTIONS.md`](file:///d:/Projects/Community%20Fridge%20Log/docs/ASSUMPTIONS.md): Domain, UX, accessibility, and architectural assumptions.
- [`/docs/API.md`](file:///d:/Projects/Community%20Fridge%20Log/docs/API.md): Comprehensive REST API endpoint reference and JSON schemas.
- [`/docs/REVIEW.md`](file:///d:/Projects/Community%20Fridge%20Log/docs/REVIEW.md): Item-by-item verification against all project specifications and design rules.
