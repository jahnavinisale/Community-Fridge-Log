# Assumptions and Technical Decisions

This document logs all architectural, domain, UX, design, and operational decisions made during the development of the Community Fridge Log system.

---

## 1. Domain and Target Audience Assumptions
1. **Audience and Access Model:**
   - The system is an internal operational tool for authorised fridge volunteers and administrators, not public-facing anonymous donors or beneficiaries.
   - Public access to the inventory is intentionally excluded to safeguard volunteer management, prevent hoarding, protect donor privacy, and allow volunteers to safely inspect and log donations before distribution.
   - No public signup exists. Authorised administrators create and manage volunteer accounts.
   - There are two primary roles:
     - `volunteer`: Can record incoming donations, view stock, see expiring alerts, log collections, and log disposals with reasons.
     - `admin`: Has all volunteer privileges plus volunteer user management (creating and deactivating volunteer accounts, viewing all logs, managing fridge metadata).

2. **Community Fridge Scope:**
   - Designed primarily for community fridge locations. A default fridge location (Main Community Fridge, 104 High Street) is pre-configured and attached to all records.
   - Storage locations within the fridge include `fridge` (chilled 1 to 4 C), `freezer` (-18 C), and `pantry` / `ambient shelf` (dry goods at room temperature).

---

## 2. Inventory and Use-By Logic Assumptions
1. **Use-By Status Thresholds:**
   - Calculated relative to the current calendar day (midnight-to-midnight boundary in local time).
   - **`expired`**: `useByDate < today` (strictly past use-by date; critical safety alert; requires disposal or safe immediate review).
   - **`use_today`**: `useByDate == today` (must be taken/distributed today).
   - **`soon`**: `today < useByDate <= today + 2 days` (1 to 2 days remaining; highlighted for immediate distribution).
   - **`ok`**: `useByDate > today + 2 days` (adequate shelf life remaining, 3+ days).
   - The calculation logic is implemented in a single shared function on both client (`client/src/utils/dateStatus.js`) and server (`server/src/utils/dateStatus.js`) and covered by automated unit tests.

2. **Food Safety and Disposal Rules:**
   - Food past its legal use-by date cannot be logged as normal collection; if a volunteer disposes of it, a mandatory disposal reason must be supplied.
   - Standard disposal reasons:
     - `expired` (past use-by / safe consumption date)
     - `spoiled` (mold, off-smell, texture degradation)
     - `damaged_packaging` (broken seals, swollen cans, torn packaging)
     - `contamination_suspected` (cross-contamination, foreign objects, pest contact)
     - `recalled` (official safety recall)
     - `other` (requires free-text note explaining why)
   - Every disposal action records the quantity disposed, reason, timestamp, and the identity of the volunteer who authorized the disposal.
   - Disposal requests without a valid reason or with reason "other" and missing notes are rejected with HTTP 400.

3. **Collection vs. Disposal:**
   - **Collection (`collection`)**: Food picked up by community members, charities, or outreach workers for actual consumption.
   - **Disposal (`disposal`)**: Food discarded to avoid foodborne illness, with strict auditing of why it was wasted.
   - Partial collections and partial disposals are supported (for example 3 of 5 items taken, 2 remain in stock). When the remaining quantity reaches 0, the item status transitions from `in_stock` to `collected` or `disposed`.
   - Cannot collect or dispose more than the remaining quantity.

---

## 3. Design and Accessibility Decisions
1. **Restrained Color Palette:**
   - Base background: warm off-white (`#FAF8F4`) to avoid harsh pure white glare while remaining bright and clean.
   - Body text: near-black (`#1C1B19`) providing a high contrast ratio exceeding 14:1 against the background (surpasses WCAG AAA).
   - Primary brand accent: deep green (`#1F5E43`) representing fresh food and community stewardship.
   - Status indicators:
     - Expired: red (`#991B1B` on `#FEF2F2`) with alert octagon icon.
     - Use today: amber (`#78350F` on `#FEF3C7`) with warning triangle icon.
     - Soon: amber/gold (`#92400E` on `#FFFBEB`) with clock icon.
     - Ok: deep green (`#064E3B` on `#ECFDF5`) with checkmark icon.
   - Status is always conveyed with both text labels and icons, never color alone.

2. **Typography Choice (IBM Plex Sans):**
   - IBM Plex Sans is selected for its neutral, highly legible grotesk design created specifically for functional and data-dense interfaces.
   - Generous x-height and open apertures make item details and expiration dates legible on mobile screens under direct sunlight outside community centers.
   - Weights used: Regular (400) for body copy, Semi-bold (600) for section headings.

3. **Accessibility and Touch Targets:**
   - Mobile-first approach: volunteers primarily inspect and log food on mobile devices while standing in front of the fridge.
   - All interactive controls have minimum 44px by 44px tap targets.
   - Visible focus indicators for keyboard navigation.
   - Screen reader live regions (`aria-live="polite"`) for status toasts.
   - Fully accessible modals with keyboard escape key dismissal and focus management.
   - Form fields have explicit `<label>` bindings and `aria-describedby` error announcements.

4. **Strict Restraint Rules:**
   - No purple or blue-to-purple gradients.
   - No glowing or neon buttons.
   - No emoji used as icons (Lucide icons used exclusively).
   - No em dashes anywhere in copy, comments, or documentation.
   - No scroll-jacking, parallax, or unnecessary animations. Respects `prefers-reduced-motion`.
   - No fake reviews, testimonials, logos, user counts, or hype text.

---

## 4. Technical and Architectural Assumptions
1. **Monorepo Structure:**
   - `/server`: Express REST API, Mongoose models, Zod validation, JWT authentication, helmet, rate limiting.
   - `/client`: Vite with React, React Router v6, Tailwind CSS, and Lucide icons.
   - Standardized npm scripts in root `package.json` for running both tiers concurrently, building, seeding, and running tests.

2. **Security and Protection:**
   - Passwords hashed using `bcryptjs` with 10 salt rounds.
   - Stateless JWT tokens passed via `Authorization: Bearer <token>`.
   - HTTP security headers provided by `helmet`.
   - Rate limiting on authentication routes via `express-rate-limit` (prevents brute-force credential stuffing).
   - CORS restricted by `CLIENT_URL` environment variable.

3. **Database Resilience:**
   - Standard MongoDB connection via `MONGODB_URI`.
   - In-memory fallback (`mongodb-memory-server`) enables immediate local evaluation without external setup if a remote or local mongod service is not supplied.

---

*Last Updated: 17 November 2026*
