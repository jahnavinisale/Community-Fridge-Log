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

## Deployment Guide (Vercel Monorepo - Single Project)

This application is architected to deploy to **Vercel as ONE single full-stack project** from the repository root:
- **Frontend:** Static React single-page application served from `client/dist` with automatic edge caching.
- **Backend API:** Express REST API served as a Vercel Serverless Function via [`api/index.js`](file:///d:/Projects/Community%20Fridge%20Log/api/index.js).
- **Database:** MongoDB Atlas (M0 Free Tier or higher).
- **Routing:** Orchestrated via root [`vercel.json`](file:///d:/Projects/Community%20Fridge%20Log/vercel.json) (routes `/api/*` to the function, and all client routes to `/index.html`).

### 1. MongoDB Atlas Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Deploy a new shared cluster (e.g. M0 Free Tier in your preferred region).
3. Under **Security > Database Access**, create a database user:
   - Authentication Method: Password
   - Database User Privileges: Read and write to any database
4. Under **Security > Network Access**, click **Add IP Address**:
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel dynamic serverless instances can connect.
5. In your cluster dashboard, click **Connect > Drivers > Node.js**:
   - Copy the connection URI:
     `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/community_fridge_log?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password.

### 2. Deploy to Vercel (Root Monorepo)
1. Push your repository to GitHub.
2. Log into the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
3. Import your `Community-Fridge-Log` repository.
4. Keep the **Root Directory** as `./` (the repository root).
5. Vercel will automatically detect `vercel.json` and use:
   - **Build Command:** `npm run build`
   - **Output Directory:** `client/dist`
6. Under **Environment Variables**, add the following:
   | Variable Name | Required | Example / Recommended Value | Description |
   | :--- | :---: | :--- | :--- |
   | `MONGODB_URI` | **Yes** | `mongodb+srv://user:pass@cluster0.mongodb.net/community_fridge_log` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | **Yes** | `e2a7f5b8c9d1e3f4a6b8c0d2e4f6a8b0c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1` | Random string for signing auth tokens (min 32 chars) |
   | `NODE_ENV` | **Yes** | `production` | Enables production optimizations and security |
   | `JWT_EXPIRES_IN` | Optional | `7d` | Token session lifetime (defaults to 7d) |
   | `ADMIN_NAME` | Optional | `Elena Rostova` | Initial admin account name (auto-created on first request) |
   | `ADMIN_EMAIL` | Optional | `admin@communityfridge.org` | Initial admin login email |
   | `ADMIN_PASSWORD` | Optional | `AdminPass123!` | Initial admin secure password |
7. Click **Deploy**.
8. Once deployment finishes, your community fridge app is live at `https://<your-project>.vercel.app`!
   - On the very first request, the database connection is cached and the admin account and sample inventory items are automatically seeded.
   - Login at `https://<your-project>.vercel.app/login` with your admin email and password.

---

## Documentation

- [`/docs/ASSUMPTIONS.md`](file:///d:/Projects/Community%20Fridge%20Log/docs/ASSUMPTIONS.md): Domain, UX, accessibility, and architectural assumptions.
- [`/docs/API.md`](file:///d:/Projects/Community%20Fridge%20Log/docs/API.md): Comprehensive REST API endpoint reference and JSON schemas.
- [`/docs/REVIEW.md`](file:///d:/Projects/Community%20Fridge%20Log/docs/REVIEW.md): Item-by-item verification against all project specifications and design rules.
