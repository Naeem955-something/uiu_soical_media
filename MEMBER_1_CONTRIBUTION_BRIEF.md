# MEMBER 1 — CONTRIBUTION BRIEF

> **Project:** UniConnect — Campus Academic & Community Portal  
> **Role:** Lead Developer (Member 1)  
> **Modules Delivered:**
> - **Feature 1** — Authentication & Multi-Role Access Control
> - **Feature 10** — Academic Digital Twin & Profile Showcase
> - **Feature 13** — Central Administrator Management Console (9 Modules)

---

## TABLE OF CONTENTS

1. [Feature 1 — Authentication & Multi-Role Access Control](#feature-1--authentication--multi-role-access-control)
2. [Feature 10 — Academic Digital Twin & Profile Showcase](#feature-10--academic-digital-twin--profile-showcase)
3. [Feature 13 — Central Administrator Management Console](#feature-13--central-administrator-management-console)
4. [Technical Architecture Decisions](#technical-architecture-decisions)
5. [Potential Teacher Questions & Model Answers](#potential-teacher-questions--model-answers)

---

# FEATURE 1 — AUTHENTICATION & MULTI-ROLE ACCESS CONTROL

## 1.1 Overview

Member 1 designed and implemented a **stateless, token-based authentication system** with role-based access control (RBAC) supporting three distinct user tiers: **STUDENT**, **FACULTY**, and **ADMIN**. The architecture uses JSON Web Tokens (JWT) for session persistence, bcryptjs for cryptographic password hashing, and dedicated Express middleware functions for authorization gating.

## 1.2 Step-by-Step Working Process

### Step 1 — Database Layer: User Model Schema

**File:** [User.js](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/server/models/User.js)

1.  A Mongoose schema defines the `User` collection with **25 structured fields**, including:
    - Identity: `name`, `email` (unique index), `password`, `avatar`
    - Role enforcement: `role` field restricted to enum `['STUDENT', 'FACULTY', 'ADMIN']` (default: `STUDENT`)
    - Governance: `verified` flag, `isBlocked` suspension flag
    - Academic fields: `department`, `semester`, `studentId`, `cgpa`, `creditsCompleted`, `reputationScore`
    - Extended profile: `bio`, `skills[]`, `tags[]`, `featuredProject` sub-doc, `researchInterests[]`, `achievements[]`

2.  Two **Mongoose middleware hooks** are attached:
    - `pre('save')` — Automatically detects plain-text passwords and hashes them using **bcryptjs with 10 salt rounds** *only* when the password field has been modified (idempotent protection against double-hashing).
    - `matchPassword()` instance method — Returns a Promise comparing a candidate password against the stored bcrypt hash.

### Step 2 — Middleware Layer: Authorization Pipeline

**File:** [auth.js](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/server/middleware/auth.js)

Three Express middlewares are exported:

1.  **`protect`** — Enforced authentication:
    1.  Extracts the **Bearer token** from the `Authorization` request header.
    2.  Verifies the JWT signature using `process.env.JWT_SECRET` (30-day expiry set at issuance).
    3.  Hydrates `req.user` with the full user document (excluding `password`) via `User.findById(decoded.id)`.
    4.  **Suspension check:** If `req.user.isBlocked === true`, returns HTTP 403 `Account suspended by campus administration`.
    5.  **Graceful fallback:** For development/demo, if no token is present, middleware transparently authenticates as the first STUDENT in the database.

2.  **`optionalAuth`** — Used on public profile routes:
    1.  Attempts the same Bearer verification as `protect`, but **suppresses errors** on invalid/expired tokens.
    2.  If no user is attached, falls back to a demo student. Always calls `next()`.

3.  **`adminOnly`** — RBAC gating for Feature 13:
    1.  Checks `req.user.role === 'ADMIN'`.
    2.  Returns HTTP 403 `Administrator clearance required` on failure.

### Step 3 — Backend API Routes

**File:** [auth.js](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/server/routes/auth.js)

Five RESTful endpoints are exposed:

| Method | Endpoint | Middleware | Workflow Summary |
|---|---|---|---|
| `POST` | `/api/auth/register` | *(public)* | 1. Validates email uniqueness via `User.findOne({ email })`. 2. Creates record with role defaulted to STUDENT (or FACULTY if provided). 3. bcrypt hashing runs automatically via `pre('save')`. 4. Generates JWT via `generateToken()`. 5. Returns `{ token, user }` shaped by the **`formatUser()` projection helper** (strips password, adds sensible defaults for Digital Twin fields). |
| `POST` | `/api/auth/login` | *(public)* | 1. Normalizes email (trim + lowercase). 2. Case-insensitive regex lookup. 3. **Admin auto-provisioning:** If login matches `admin@university.edu` and the user doesn't exist, an ADMIN account is created on the fly. 4. Calls `user.matchPassword(password)`. 5. Issues JWT. 6. Post-login routing: frontend inspects `user.role` and redirects ADMIN → admin panel, others → home. |
| `GET` | `/api/auth/me` | `protect` | Re-fetches the current user from the DB (password stripped via `.select('-password')`) and projects through `formatUser()`. |
| `PUT` | `/api/auth/me` | `protect` | 1. White-list of 18 updateable fields (name, bio, cgpa, skills, featuredProject, etc.). 2. Supports password rotation via separate bcrypt path. 3. Persists via `user.save()` so the `pre('save')` hook re-hashes new passwords. |
| `GET` | `/api/auth/users` | `protect` | Returns all campus users (excludes current user, excludes password) — used by community and chat add-member modals. |
| `GET` | `/api/auth/profile/:idOrName` | `optionalAuth` | Dual-resolution lookup: first by MongoDB 24-hex ObjectId, second by case-insensitive name regex. **Fallback synthesizer:** if neither matches, a fully structured Academic Digital Twin is generated procedurally (with appropriate role inference from name keywords like "Dr." / "Prof" / "Club") so every campus author is clickable. |

The **`formatUser()` function** (lines 12–48) is a critical piece of shared logic: it projects 29 fields from the raw Mongoose document into the TypeScript `User` contract consumed by React, providing graceful defaults for every Digital Twin field. This guarantees the UI never renders empty states even for legacy or partially filled records.

### Step 4 — Frontend State Layer

**File:** [AppContext.tsx](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/src/context/AppContext.tsx)

The global context manager provides:

1.  **Auth bootstrap (`useEffect` init)** — On first app load:
    1.  Reads `localStorage.getItem('uniconnect_token')`.
    2.  Calls `api.getMe()` to validate; if invalid, clears token from storage.
    3.  If still no token, **automatically authenticates as `student@university.edu / password123`** — guarantees the demo boots without manual login.
    4.  Calls `Promise.all([loadAllData(), loadAuthData()])` in parallel after session is confirmed.

2.  **`login(email, password)`** — Calls `api.login()`, writes token to `localStorage`, sets `isAuthenticated=true`, refreshes all data views, emits success toast.
3.  **`registerUser(data)`** — Calls `api.register()`, issues JWT immediately (no email confirmation flow).
4.  **`logout()`** — Removes token, resets user to `initialUser`, navigates to `/login`, wipes conversations/notifications/admin queue.
5.  **`updateUser(fields)`** — Calls `PUT /api/auth/me`, merges returned fields into context state. Falls back to optimistic local update if API fails.
6.  **`openUserProfile(authorOrUser)`** — Used on post/feed author clicks. Calls `api.getUserProfile(lookup)` (Feature 10's profile lookup endpoint). Falls back to a procedurally generated Digital Twin if the API returns empty.

### Step 5 — Frontend Presentation: Login View

**File:** [LoginView.tsx](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/src/views/LoginView.tsx)

The UI implements a **dual-portal split-screen** with:

1.  **Left brand side:** Marketing hero with 200+ communities stat and security statement.
2.  **Right form side:** Two top-level modes:
    - **Campus Portal** — segmented control switches between `Student Access` and `Faculty Access` (sets `role` sent to `/register`). Contains both `Sign In` and `Create Account` sub-forms, password visibility toggle (Eye/EyeOff), "Forgot password?" stub, and "Remember me" checkbox.
    - **Admin Portal** — dark-themed, with an explicit *"Audited Session"* notice informing that all admin actions and logins are logged. Disables the registration tab (admins are created via backend).

3.  **Post-auth routing logic:**
    - If `portalMode === 'admin'` → `setActiveView('admin')`
    - If regular login and `loggedUser.role === 'ADMIN'` → also routes to admin (so an admin accidentally using campus form still ends up in the correct console)
    - Else → `setActiveView('home')`

### Step 6 — Role-Based View Guard

The route gating is enforced on the `AdminView.tsx` component itself: if `user?.role !== 'ADMIN'`, the component renders an **"Access Restricted"** card with a "Switch to Admin Account" button that programmatically authenticates `admin@university.edu` (so teachers/demos can jump directly without navigating away).

---

# FEATURE 10 — ACADEMIC DIGITAL TWIN & PROFILE SHOWCASE

## 2.1 Overview

Member 1 built a comprehensive **Academic Digital Twin (ADT)**: a layered, editable profile representation that synthesizes identity, academic standing, skills, featured research, project showcase, and verified achievements into a single public profile card. The design goal is that **any student or faculty member has a complete, recruiter-ready academic portfolio** without manual data entry (the system provides intelligent defaults for every field).

## 2.2 Data Model

The Digital Twin lives inside the `User` schema (see Feature 1) and extends across these dimensions:

| Dimension | Fields |
|---|---|
| Identity | `name`, `email`, `avatar`, `studentId`, `department`, `semester`, `major`, `bio`, `verified` |
| Academic Standing | `cgpa`, `hideCgpa` (privacy toggle), `creditsCompleted`, `totalCredits` |
| Reputation | `reputationScore` (0–1000 scale) |
| Expertise | `skills[]`, `tags[]` |
| Portfolio | `featuredProject` { title, description, image, githubUrl, stars } |
| Research | `researchInterests[]` { title, subtitle } |
| Honors | `achievements[]` { title, subtitle, date } |

## 2.3 Step-by-Step Working Process

### Step 1 — Profile Data Rendering

**File:** [ProfileView.tsx](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/src/views/ProfileView.tsx)

The page is rendered in **6 structured sections**:

1.  **Profile Hero Card** (`.profile-hero-card`):
    - Large circular avatar with an inline `Pencil` overlay button → opens the edit modal directly to the Identity tab.
    - Identity text: full name, major/department, semester, student ID, and bio paragraph.
    - **Reputation Score box** — Displays score in format `{n} / 1000` (represents campus contributions like resources uploaded, posts, peer reviews).
    - Action buttons: `Send Message` → opens compose modal; `Edit Profile` → opens edit modal.

2.  **Academic Standing & Expertise Row** (`.profile-twin-grid`):
    - Left — Academic Standing Card: CGPA pill (either the numeric value or "CGPA Hidden" with an EyeOff icon). A **1-click CGPA privacy toggle** (`handleToggleCgpaPrivacy`) calls `updateUser({ hideCgpa })` and shows an explanatory toast. Degree progress shows `completed / total credits` with a visual percent progress bar, calculated as `Math.round((creditsCompleted / totalCredits) * 100)`.
    - Right — Skills Card: 3 color-coded skill pill variants (amber for technical, blue for academic, green for soft skills) with category prefix glyphs (`<>`, `⤢`, `🔍`, `✦`).

3.  **Featured Project & Research Row** (`.profile-twin-grid`):
    - Left — Featured Project Card: Thumbnail image, "FEATURED PROJECT" badge, title, description, and GitHub link with star count display.
    - Right — Research Interests: Each interest is a row with an icon circle (Cpu for tech topics, Sparkles for interdisciplinary) + title + subtitle.

4.  **Achievements & Honors Card:** 3-column grid of achievement cards, each with: colored icon circle (Award / Trophy / CheckCircle2 variants), title (e.g. "Dean's List 2025"), subtitle (awarding org), and date.

5.  **Public Message & Inquiry CTA:** A gradient-banner card with `Compose Message` button that opens the same contact modal used in Send Message — this lets external visitors / recruiters initiate messages without needing to navigate to the chat page first.

6.  **Comprehensive Edit Modal** (covered in Step 2).

### Step 2 — Full Edit Modal (6-Tab Workflow)

The `handleOpenEdit(tab)` function hydrates all 18 form fields from current `user` state (with default fallbacks if empty) and opens a tabbed modal:

**Tab 1 — Identity:**
- Full Name, Student ID (required)
- Avatar URL + 4 clickable preset thumbnails
- Department, Major/Track, Semester, Reputation Score (min=0, max=1000)
- Multi-line Biography

**Tab 2 — Academic & CGPA Privacy:**
- Explicit opt-in toggle: "Hide CGPA from Public Profile" with explanation
- CGPA input (min=0, max=4, step=0.01, required)
- Credits Completed / Total Degree Credits → both feed the progress bar

**Tab 3 — Skills:**
- Free-text skill input with Enter-key binding and `+ Add` button
- Live skill chips with inline `X` delete buttons; uniqueness is enforced client-side

**Tab 4 — Featured Project:**
- Title, Description, Thumbnail URL
- GitHub Repository URL + Stars count

**Tab 5 — Research Interests:**
- Dynamic list with `+ Add Interest` button
- Each entry: editable Title + Subtitle fields + Delete (Trash2) button

**Tab 6 — Achievements & Honors:**
- Dynamic list with `+ Add Honor` button
- 3-column grid per row: Award Title / Organization / Date
- Save action submits the form via `handleSaveProfile()` which calls `updateUser()`.

### Step 3 — Profile Contact & Messaging Integration

The `isMessageModalOpen` flow:
1.  User fills Name, Email (optional), Topic dropdown, and Message body.
2.  `handleSendMessageSubmit` → calls `startConversationAndSendMessage()` from AppContext, which:
    - Creates a new DIRECT conversation via `api.createConversation()`
    - Appends it to the conversations list
    - Sets `activeChatId` to the newly created conversation (so clicking "Open in Chat" shows the thread)
3.  Success state renders a confirmation screen with checkmark + "Open in Chat" CTA.

### Step 4 — Export & Share Utilities

- **`handleExportCV()`** — Emits a success toast "Academic Digital Twin CV exported as PDF!" (extensibility hook for jsPDF / html2canvas integration).
- **`handleShareProfile()`** — Writes the current URL to `navigator.clipboard` for sharing a verified profile link.

### Step 5 — Procedural Fallback Profiles (Key Differentiator)

As mentioned in Feature 1, `GET /api/auth/profile/:idOrName` includes a **procedural generator** (lines 190–225 of the auth routes). When a profile lookup fails (e.g., a post was authored by a campus club name that has no dedicated user account), the system still returns a fully-populated Digital Twin:

- Name, email, avatar
- Role inference: `CLUB` if name contains "club"; `FACULTY` if contains "Dr." / "Prof"; else `STUDENT`
- Random student ID in format `UNI-{XXXX}`
- Reputation score: 910, CGPA: 3.88, 98/120 credits
- Verified tag + 5 default skills (Python, System Architecture, etc.)
- Default featured project, 2 research interests, 2 achievements

This means **every author name clicked anywhere in the app resolves to a valid profile view** — no 404 states, no empty profiles.

---

# FEATURE 13 — CENTRAL ADMINISTRATOR MANAGEMENT CONSOLE (9 MODULES)

## 3.1 Overview

Member 1 implemented a comprehensive **9-module administrative console** restricted via the `protect + adminOnly` middleware stack (HTTP 403 on any non-ADMIN attempt). The console covers user governance, content moderation, event lifecycle, community/club oversight, campus announcements, notification broadcasting, and platform settings.

## 3.2 Architecture Overview

**Backend Router:** [admin.js](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/server/routes/admin.js)

- Line 13 applies global gating: `router.use(protect, adminOnly)` — every endpoint below requires both a valid JWT and an `ADMIN` role.
- 26 RESTful endpoints grouped into 9 modules.
- Platform settings are stored in-memory (`let platformSettings = {...}`) for zero-setup deployment (easily swappable to a `PlatformSettings` collection if persistence is needed).

**Frontend Shell:** [AdminView.tsx](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/src/views/AdminView.tsx)

- **Topbar:** University Administration badge (Shield icon) + "Campus Operations & Control Center" title + "Exit to Student View" button with ExternalLink icon.
- **Horizontal Tab Navigation (9 tabs):** Dashboard · Users · Posts · Reports · Events · Community & Clubs · Announcements · Notifications · Settings. Each tab has a Lucide icon; the Reports tab displays a live pending badge.
- **Main viewport:** Renders one of the 9 imported sub-components (lines 232–242) based on `activeTab` state.

## 3.3 Step-by-Step: Each of the 9 Admin Modules

### Module 1 — Admin Dashboard (Analytics)

**Component:** [AdminDashboardTab.tsx](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/src/views/admin/AdminDashboardTab.tsx)  
**API:** `GET /api/admin/stats`

**Workflow:**
1.  On mount + on dependency change, `loadStats()` calls `api.getAdminStats()`.
2.  Backend runs 8 parallel MongoDB `countDocuments()` queries:
    - Total Students · Total Faculty · Total Users · Total Posts · Total Events · Pending Reports · Total Communities · Total Announcements
3.  Calculates `activeUsers = round(totalUsers * 0.45)` (45% daily active model).
4.  Frontend renders 8 KPI stat cards, a reports queue widget (top 4 pending by recency), a quick-actions grid (Add User / Broadcast / Approve Event), and navigation links to deep-link into other modules via `onNavigateTab()` callback.

### Module 2 — User Management

**Component:** [AdminUsersTab.tsx](file:///c:/Users/fomal/OneDrive/Documents/New%20folder/Web/web_project%20(2)/web_project_fixed/src/views/admin/AdminUsersTab.tsx)  
**APIs:** `GET|POST|PUT|DELETE /api/admin/users` + `PUT /api/admin/users/:id/block`

**Workflow (CRUD + Suspension):**
1.  **List:** `loadUsers()` fetches all users (password excluded) sorted by creation date descending. Supports:
    - Live text search (name/email contains)
    - Role filter (ALL / STUDENT / FACULTY / ADMIN)
    - Status filter (ALL / Active / Blocked)
2.  **Create:** "+ Add User" modal → Name, Email, Password (required), Role dropdown, Department, Student ID. Backend validates email uniqueness before writing.
3.  **Edit:** Pencil icon → pre-fills the same modal; submits via `PUT /api/admin/users/:id`. Supports role promotion/demotion.
4.  **Block / Unblock:** Ban icon toggles `user.isBlocked` via the dedicated `/block` endpoint. The `protect` middleware then rejects this user's tokens on next request with "Account suspended…".
5.  **Delete:** Trash icon permanently removes user (GDPR / account removal compliance).

### Module 3 — Post Management

**Component:** AdminPostsTab.tsx  
**APIs:** `GET /api/admin/posts`, `DELETE /api/admin/posts/:id`, `DELETE /api/admin/posts/:postId/comments/:commentId`

**Workflow:**
1.  Fetches all posts with `.populate('author', 'name avatar department role')` so each post card shows the full author profile, tags, like count, comment count, and creation time.
2.  Per-post actions:
    - `Delete Post` → hard-deletes the post (used for spam / policy violations)
    - `Delete Comment` → per-comment moderation filter, updates `commentsCount` on the parent post
3.  Supports inline content preview for images and file attachments.

### Module 4 — Moderation Reports

**Component:** AdminReportsTab.tsx  
**APIs:** `GET|POST|PUT|DELETE /api/admin/reports`

**Workflow:**
1.  Report queue displays all records sorted by newest first. Each report card shows:
    - Reporter initials circle + name + role (STUDENT/FACULTY)
    - Location Context (which view the report came from: Campus Feed, Marketplace, etc.)
    - Reason text + Priority badge (Normal / High / Critical)
    - Status pill: Pending · Reviewed · Dismissed
2.  Actions on each report:
    - **Mark Reviewed** → `PUT status: 'Reviewed'`
    - **Dismiss** → `PUT status: 'Dismissed'`
    - **Delete** → Permanently removes resolved items
3.  New reports submitted by students via `POST /api/admin/reports` auto-set status to `Pending` and capture reporter identity from `req.user`.
4.  **Top-nav badge integration:** The Reports tab's unread count is driven by a live `.filter(r => r.status !== 'Reviewed').length` computation in AdminView line 107.

### Module 5 — Event Management

**Component:** AdminEventsTab.tsx  
**APIs:** `GET|POST|PUT|DELETE /api/admin/events`

**Workflow:**
1.  Lists all campus events: title, type badge (WORKSHOP / HACKATHON / CAREER_FAIR / SEMINAR), date, time, location, registered / max capacity ratio, thumbnail.
2.  **Create:** "+ New Event" modal with Title, Type, Date, Time, Venue, Description, Max Capacity, Thumbnail URL.
3.  **Edit:** Update event details (e.g., reschedule venue, adjust capacity).
4.  **Delete / Cancel:** Remove cancelled events.
5.  Capacity is enforced on the student-facing registration flow (`registerForEvent` checks `registeredUsers.length < maxCapacity`).

### Module 6 — Community & Club Management

**Component:** AdminCommunitiesTab.tsx  
**APIs:** `GET|POST|PUT|DELETE /api/admin/communities`

**Workflow:**
1.  Lists every registered club: Name, Category (Technology / Cultural / Academic / Sports), Leader Name & Contact Email, Members Count, and Approval Status.
2.  If the Community collection is empty at first fetch, the backend seeds 3 default clubs (ML Club, Robotics Society, Debating Club) so the view is never empty.
3.  **Create new club** with name, description, category, leader assignment.
4.  **Update status** to Approve / Suspend a club (enforces official student organization governance).
5.  Delete disbanded or inactive organizations.

### Module 7 — Campus Announcements

**Component:** AdminAnnouncementsTab.tsx  
**APIs:** `GET|POST|PUT|DELETE /api/admin/announcements`

**Workflow:**
1.  Displays all official notices sorted newest first. Each card shows: Title, Content preview, Category (Academic / General / IT / Events), Target Audience, Priority badge, and Authoring Office (e.g. "Office of the Registrar").
2.  **Create Announcement:**
    - Title + Body (required)
    - Category, Target Audience (All / Students / Faculty)
    - Priority (Normal / High / Urgent)
    - **`sendNotificationToStudents` checkbox** — If ticked, the backend iterates the User table and inserts a Notification record per user (lines 614–628 of admin routes), so the announcement appears simultaneously in: (a) Announcements feed, (b) individual student Notifications bell.
3.  **Edit** to correct published notices, **Delete** to remove expired ones.
4.  Default seeding: if collection is empty, creates "Final Examination Schedule Published" and "Campus IT Maintenance" canonical notices.

### Module 8 — Notification Broadcast Center

**Component:** AdminNotificationsTab.tsx  
**APIs:** `GET|POST /api/admin/notifications`

**Workflow:**
1.  **Broadcast form:** Admin composes a title + description + category (academic / social / general), and selects a target role (ALL / STUDENT only / FACULTY only / ADMIN only).
2.  On submit, the backend runs `User.find({ role: targetRole })` → maps to Notification documents → bulk `insertMany`.
3.  **Recent broadcast log:** Shows last 30 dispatched notifications with timestamps and categories — audit trail for mass-communications.
4.  Response includes `recipientsCount` so admins can confirm the blast reached the expected audience size.

### Module 9 — Platform Settings & Configuration

**Component:** AdminSettingsTab.tsx  
**APIs:** `GET|PUT /api/admin/settings`

**Workflow:**
1.  Displays and edits 8 platform-wide configuration fields:
    - University Name · Campus Location · Academic Session · Contact Email
    - Boolean toggles: Allow Student Posts · Moderation Enabled · Allow Student Registration
    - System Notice (banner text displayed on the login page)
2.  **Save** persists via `PUT /api/admin/settings` → backend merges the payload into the in-memory `platformSettings` object, returning the canonical new settings.
3.  This module serves as the operational **control plane** — administrators can disable new student registration during exam windows, turn on stricter moderation during orientation week, update branding for a new campus, etc.

---

# TECHNICAL ARCHITECTURE DECISIONS

## 4.1 Why JWT and not Server-Side Sessions?
- UniConnect is a single-page app (Vite + React), so stateless tokens are more scalable than Redis-backed session stores.
- JWTs are stored in `localStorage` and sent as `Authorization: Bearer <token>` on every `api.*` call via the shared axios instance in `services/api.ts`.
- 30-day expiry balances security (short enough) and UX (students aren't re-logging in daily).

## 4.2 Why bcrypt with 10 Rounds?
- OWASP recommended work factor as of 2024 for Node.js servers; provides ~100ms per hash (safe against offline GPU attacks without blocking the event loop).
- `pre('save')` hook idempotency check (`!password.startsWith('$2a$')`) prevents double-hashing when a record is re-saved without password changes.

## 4.3 Why `formatUser()` Projection?
- Decouples the Mongoose document schema from the TypeScript `User` interface consumed by React.
- Ensures every profile field has a non-null default, so the UI's 6-card layout never collapses or shows "undefined" even with partial data.

## 4.4 Admin RBAC via Middleware Composition
- `router.use(protect, adminOnly)` in admin.js means **every admin endpoint** is double-gated at the router level. This is a more robust pattern than checking role inside every handler.
- Client-side gating (the `AdminView.tsx` access-restricted card) is UX-only; real enforcement lives server-side.

## 4.5 In-Memory vs Persisted Settings
- Platform Settings uses an in-memory object so the project works 100% out-of-the-box without a separate settings collection setup.
- Migrating to MongoDB is a trivial 5-line refactor: replace `let platformSettings` with a Mongoose `.findOne().lean()` + `.findOneAndUpdate()` pattern.

---

# POTENTIAL TEACHER QUESTIONS & MODEL ANSWERS

## Q1 — "Describe how you implemented authentication end-to-end."

> I implemented stateless JWT authentication. On the backend, I created a `User` Mongoose model with a `pre('save')` hook that hashes passwords with bcryptjs (10 rounds) only when the password field changes. I built a `protect` middleware that extracts the Bearer token from the Authorization header, verifies the JWT signature against `JWT_SECRET`, fetches the user, checks the `isBlocked` suspension flag, and attaches the hydrated user to `req.user`. The `login` route normalizes the email (trim + lowercase), does a case-insensitive lookup, compares the password via `matchPassword()`, and issues a 30-day JWT. On the frontend, the token is stored in `localStorage`, validated on app boot via `GET /api/auth/me`, and used on every subsequent API call. If no token exists on first visit, the app does an automatic demo-login as `student@university.edu` so the UX never hits a login wall in demo mode.

## Q2 — "How does role-based access control (RBAC) work for the admin panel?"

> There are two layers. First, server-side: the admin router applies `router.use(protect, adminOnly)` globally. The `adminOnly` middleware checks `req.user.role === 'ADMIN'` and returns 403 otherwise. This guarantees zero exposure regardless of what the client does. Second, client-side UX: the `AdminView` React component inspects `user?.role !== 'ADMIN'` and renders an "Access Restricted" card instead of the actual console, with a convenient programmatic "Switch to Admin Account" button that authenticates `admin@university.edu` for demos. Additionally, the `LoginView` has a separate "Admin Portal" mode (dark theme, audit notice) that disables registration (admins are auto-provisioned by the backend) and routes directly to `/admin` after login.

## Q3 — "What is the 'Academic Digital Twin' and why did you design it that way?"

> The Academic Digital Twin is a structured, fully-populated profile representation that covers 7 dimensions of a student or faculty member: identity, academic standing (CGPA + credits progress bar + 1-click privacy toggle), reputation score, skills cluster, featured project showcase, research interests, and verified achievements/honors. I designed it so that every user has a complete, recruiter-ready profile by default — even users who never log in. This is achieved through: (1) the `formatUser()` projection helper that provides sensible defaults for all 29 output fields, and (2) a procedural fallback generator in `GET /api/auth/profile/:idOrName` that synthesizes a valid Digital Twin for any author name or club clicked in the feed that doesn't have a real user account. So the system has zero empty-profile 404s. Users can then customize each section via a 6-tab edit modal.

## Q4 — "How does CGPA privacy work?"

> The `User` model has a boolean `hideCgpa` field. On the profile hero, there's a dedicated 1-click CGPA toggle button (`Eye` / `EyeOff` icon + Show/Hide label) that calls `updateUser({ hideCgpa })` and shows an explanatory toast. When `hideCgpa` is true, the Academic Standing card displays a "CGPA Hidden 🔒" pill in muted styling instead of the numeric value. The same privacy flag propagates through `formatUser()`, so even direct API consumers can't see the CGPA of a user who opted out — it's a server-side projection, not just a CSS display trick.

## Q5 — "Walk through the lifecycle of an admin moderation report."

> First, a student reports content via `POST /api/admin/reports` with the reported snippet, location context (which view it came from), and violation reason. The backend captures reporter identity from `req.user` (name initials, role, name), sets status to `Pending`, and persists it. In the admin console, the Reports module lists all items sorted newest-first, with a badge on the nav tab counting items where `status !== 'Reviewed'`. An admin then has three actions: (1) "Mark Reviewed" — PUT status to `Reviewed` (acknowledges and closes), (2) "Dismiss" — PUT status to `Dismissed` (flags report as false positive), or (3) "Delete" — permanently removes the item from the queue after resolution. The admin can then also use Module 3 (Posts) to hard-delete the actual offending post or comment if warranted.

## Q6 — "What are the 9 admin modules and what does each do?"

> 1. **Dashboard:** Live KPI aggregation (students, faculty, posts, events, pending reports) via 8 parallel `countDocuments()` queries, plus quick-action buttons. 2. **User Management:** Full CRUD + account suspension (`isBlocked` toggle enforced by the `protect` middleware). 3. **Post Management:** Full campus feed moderation with post and per-comment delete. 4. **Moderation Reports:** Inbox for policy-violation flags submitted by students with 3 resolution states. 5. **Event Management:** CRUD for hackathons, workshops, career fairs with capacity enforcement. 6. **Community & Clubs:** Official student organization governance with approval statuses and default club seeding. 7. **Announcements:** Registrar/IT notices with optional push-notification broadcasting that inserts a Notification per user. 8. **Notification Broadcast Center:** Mass targeted notifications by role (ALL / STUDENTS / FACULTY) with bulk insertMany and recipient audit counts. 9. **Platform Settings:** University name, campus location, academic session, and 3 operational booleans (allow posts, enable moderation, allow registration) plus the system notice banner.

## Q7 — "How do you prevent plaintext password leaks?"

> Two complementary defenses. First, password hashing at write time: a Mongoose `pre('save')` hook runs bcrypt.genSalt(10) + bcrypt.hash() whenever the password field is modified, and the double-hash guard (`!startsWith('$2a$')`) ensures idempotency. Second, projection at read time: every API path that returns user data (login, register, me, user list, profile) either uses `.select('-password')` on the query or passes through the `formatUser()` helper which never reads the password field. So plaintext passwords are never written to the database, and bcrypt hashes are never returned over the API.

## Q8 — "How does the announcement broadcast feature trigger notifications?"

> It's a two-phase atomic operation in `POST /api/admin/announcements`. Phase 1: the Announcement document is persisted with `sentNotification: true`. Phase 2 (lines 614–628 of admin.js): if `sendNotificationToStudents` was checked, the backend queries `User.find().select('_id')` to get every account, maps them into Notification documents (with the announcement title prefixed by 📢, a 100-character content snippet, category `academic`, and an action button pointing to Communities view), and does `Notification.insertMany(notifs)`. So the broadcast appears in both the Announcements feed AND each individual's notification bell in the TopNav, with no extra client-side work needed.

## Q9 — "What happens if a blocked user tries to make an API call?"

> The `protect` middleware (line 17–19 of auth.js) explicitly checks `if (req.user.isBlocked)` after successfully validating the JWT and returns HTTP 403 `Account suspended by campus administration.`. The user's token is still cryptographically valid, but the RBAC pipeline short-circuits before `next()` is called. This design is intentional: if the ban is lifted, the same session token works again without requiring a password reset or re-login. Administrators toggle suspension via the 1-click Ban button in Admin Users → `PUT /api/admin/users/:id/block`.

## Q10 — "How does the profile lookup work for names that aren't real user accounts?"

> The dual-resolution lookup in `GET /api/auth/profile/:idOrName` first tries to match by ObjectId regex (^[0-9a-fA-F]{24}$). If that fails or returns null, it does a case-insensitive name match via `new RegExp('^' + idOrName + '$', 'i')`. If both fail — which is common when clicking a post author like "Robotics Club" or "Dr. Smith" who authored content but doesn't have a dedicated login — the endpoint synthesizes and returns a fully valid Academic Digital Twin procedurally. Role is inferred from the name (Dr/Prof → FACULTY, Club → CLUB, else STUDENT), student ID is randomized, and all 29 fields are populated with plausible defaults. This is a deliberate UX decision: every clickable author name anywhere in the app always resolves to a profile card without errors.
