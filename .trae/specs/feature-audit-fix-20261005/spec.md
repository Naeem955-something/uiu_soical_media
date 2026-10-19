# Spec: UniConnect Feature Consistency Audit & Fix

## Problem

UniConnect is a 13-module full-stack campus portal. Several features are partially implemented, show only placeholder/toast messages instead of real behavior, or lack end-to-end consistency between frontend UI interactions and backend API effects. Users reported specific gaps: joining a community does not create an associated group chat, file "Upload" forms have no actual file picker, and "Download" buttons only show a toast without downloading anything.

## Users

- Students and faculty using the web portal daily.
- Admin/moderators.

## Goals

1. Audit **every feature end-to-end** (13 views + modals) and identify any inconsistency.
2. Fix every identified issue so that:
   - Frontend actions trigger real backend API calls where appropriate.
   - "Upload" workflows include an actual file input (with base64 or filename+metadata storage in DB).
   - "Download" workflows produce a real browser download (Blob / data URL / generated file).
   - State changes in one module propagate to dependent modules (e.g., community join → chat creation).
3. Preserve graceful API-failure fallbacks already in place (mock data patterns).

## Non-Goals

- No rewrite of state management architecture (keep AppContext).
- No introduction of external file storage services (S3, etc.). Simulated file uploads/downloads only — store metadata + small payload in DB via base64 or generate sample contents on download.
- No change of auth stack (JWT stays).
- No new features beyond what the UI advertises.

## Constraints

- Work inside the copied project folder: `.../web_project_fixed/`.
- Keep the existing frontend tech (React 19, Vite, TS, custom CSS) and backend (Express 4, Mongoose, MongoMemoryServer).
- Must still `npm run dev` and `npm run server` from project root without additional setup steps.
- UI appearance must not regress (same layout, styles, icons).

## Assumptions

- Simulated file content is acceptable:
  - Upload → read file via `<input type="file">`, store `fileName`, `fileSize`, `mimeType`, and (optionally) a truncated base64 data URL in the DB doc.
  - Download → generate a Blob using placeholder text (or the stored base64 if available) and trigger `URL.createObjectURL` + `<a download>`.
- Community ↔ Chat consistency: when a user joins a community, if no conversation for that community exists, create a GROUP chat named after the community and add the user as member.

## Functional Requirements (FR)

### FR1 — Community Join → Community Chat Creation (user-reported)
- **rule** On frontend, after "Join Community" succeeds (optimistic state AND/OR API response), a new GROUP-type chat conversation must appear in the Chat sidebar with name `"<Community Name> [Community]"`, the user as Admin member, a system welcome message, and auto-navigate optional but toast confirmation.
- **rule** If the user "Leaves" a community, the chat remains (non-destructive) but user role note changes or toast says "Community chat retained in Chat."
- **rule** Creating a new community via CreateCommunityModal also creates the matching GROUP chat with creator as Admin.

### FR2 — Resources: Real Upload Picker & Metadata
- **rule** The "Upload Resource" modal in `ResourcesView` must include a visible `<input type="file">` (or clickable dropzone). Picking a file must populate `fileName`, `fileSize`, and `fileFormat` from actual file metadata (not user-typed dropdown alone).
- **rule** The form metadata from file picker takes precedence (but still can be edited by user for `courseCode`, `category`, `description`).
- **rule** Submitting the upload calls the backend API with file metadata fields: `fileName`, `fileSize`, `fileFormat`, `mimeType`, and a `fileData` base64 snippet (first 128KB max or just a marker; small files fully stored).

### FR3 — Resources: Real Download Trigger
- **rule** Clicking the download icon on a Resource card must trigger an actual browser file download (Blob + `<a download>`) not just a toast.
- **rule** If the resource has stored `fileData` base64, decode and serve it. Otherwise generate a realistic placeholder (e.g., `/* ${title} */ placeholder contents for ${courseCode}...` in a .txt/.pdf-styled text) and download that using the stored file name.
- **rule** Download count increments in backend + frontend state after a successful download (optimistic + persisted).

### FR4 — Marketplace: Real Image Upload
- **rule** The "Sell Item" modal must include a file picker for an item image; preview the selected image in the modal before submit.

### FR5 — Create Post: Real File/Image Attachments
- **rule** CreatePostModal includes a real file input for image and/or document. Previews attachment before submit and sends metadata to backend.
- **rule** The post "Download" button on an attached file (HomeView) triggers an actual browser download, not only a toast.

### FR6 — Chat Attachments: Real File Upload + Download
- **rule** Chat "+" attach button opens a file picker; sends message with real file metadata (name, size, type) from the picked file.
- **rule** Download button on chat attachment triggers actual browser download with placeholder contents if no stored data.

### FR7 — Lost & Found: Real Image Upload
- **rule** Report Lost/Found modal/flow has a file picker for item photo. Previews before submit.

### FR8 — Admin: Admin-only Guard
- **rule** If a `user.role !== 'ADMIN'` navigates directly to `/admin`, redirect or show "Access Denied" panel instead of the full admin tabs; admin tabs otherwise work normally.

### FR9 — Notifications: Mark-as-read triggers navigation (if action button)
- **rule** Clicking an actionable notification that has `actionButton.viewTarget` navigates to that view; otherwise just marks as read.

### FR10 — Profile Updates Persist (PUT /api/auth/me)
- **rule** Any field edited in ProfileView or SettingsView must call `PUT /api/auth/me` and actually update the backend User doc.
- **rule** Avatar change allows uploading a picture via file picker → preview → persist as avatar URL/data URL.

### FR11 — Events: RSVP persists + Ticket Download
- **rule** Registering for an event actually updates the Event document's registered attendees set (not just counter).
- **rule** Ticket button/modal has an actual "Download Ticket" action that downloads an event pass .txt/.vcs file with event details.

### FR12 — Community Discussion Attachments
- **rule** Discussion composer in CommunitiesView "Attach Image" / "Attach Document" opens file picker, shows toast of attachment, includes metadata in persisted discussion.

### FR13 — Download Consistency (rubric)
- **rubric** Quality dimension: Download realism across all 5 locations:
  - Resource card download (ResourcesView)
  - Post attachment download (HomeView)
  - Chat attachment download (ChatView)
  - Shared files download (ChatView sidebar)
  - Event ticket download (EventTicketModal)
  - Scale 0-5: each location triggers a real Blob download with a correct file name and non-empty contents → pass threshold 5/5.

### FR14 — Upload Picker Consistency (rubric)
- **rubric** Quality dimension: Upload picker realism across 5 locations:
  - Resource upload modal
  - Sell item modal
  - Create post modal
  - Chat + attach
  - Lost & found report
  - Scale 0-5: each has `<input type="file">`, shows name/size preview, metadata passed to backend → pass threshold 5/5.

## Non-Functional Requirements (NFR)

- **rule** No linting errors (`npm run lint` exits 0). Minor warnings allowed but count toward quality.
- **rule** `npm run build` (TypeScript compile + Vite build) succeeds with exit code 0.
- **rule** Backend seeding still creates demo data; no schema change breaks existing seed.
- **rule** Both servers start cleanly as documented in README.

## Acceptance Criteria

**rule AC1**: After joining a community from CommunitiesView, navigating to ChatView shows a new group chat named after the community.

**rule AC2**: On ResourcesView, pick a file → upload → new card appears → click download → browser Downloads panel receives a file.

**rule AC3**: On HomeView, a post with a file attachment shows Download → user gets a file in Downloads.

**rule AC4**: Chat "+" button opens file picker; selected file appears as attachment in a new message; attachment download works.

**rule AC5**: SellItemModal has image preview from picked file before submit; Marketplace card shows submitted image.

**rule AC6**: CreatePostModal has image/file preview from picked files before submit.

**rule AC7**: Non-admin user sees Access Denied when opening admin view; admin user sees all admin tabs.

**rubric AC8**: Overall consistency experience. Scale 0-10:
- 10: All FRs implemented, no regressions, interactions feel cohesive.
- 8: 1-2 minor visual regressions, all critical FRs pass.
- 5: Critical FRs (community chat, upload, download) work but edge cases missing.
- Pass threshold: ≥8.

---
End of Spec.
