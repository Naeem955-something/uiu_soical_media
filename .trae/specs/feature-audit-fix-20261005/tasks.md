# Tasks: UniConnect Feature Consistency Audit & Fix

Project Root: `.../web_project (2)/web_project_fixed/`
Spec: `.trae/specs/feature-audit-fix-20261005/spec.md`

---

## Task 1: Community Join → Group Chat Creation & Creator Chat

**AC Covered**: AC1, FR1
**Priority**: high
**Depends on**: —
**Status**: pending

### Scope
- Frontend `CommunitiesView.handleToggleJoin`: after optimistic join, call new AppContext action `ensureCommunityChat(community, creator)` which either finds an existing community chat or creates one via `api.createConversation` and adds to `conversations` state.
- Frontend `handleCommunityCreated` callback → trigger same `ensureCommunityChat` for the newly made community with creator as Admin.
- Backend `routes/communities.js` → POST `/join` (after save) optionally auto-creates ChatConversation for community if not exists, and returns embedded info. Alternatively handle entirely on frontend with existing `api.createConversation`.
- Add "Open Community Chat" button in community view (right sidebar or next to Join button) that navigates to `/chat` and sets `activeChatId` to the community conversation.

### Test Requirements
- **rule TR1.1**: After fresh login, join "AI Research Lab" (not already joined), go to Chat → a new group "AI Research Lab [Community]" exists with "Student User" listed as Admin.
- **rule TR1.2**: Create new community "My Test Club" via CreateCommunityModal → within 2s a new group chat appears in Chat sidebar with matching name.
- **rule TR1.3**: Click "Open Community Chat" (if implemented) switches activeView to 'chat' and selects the matching conversation.
- **rubric TR1.4**: No duplicate group chat created when repeatedly joining/leaving/joining same community (0-2 scale; pass=2).

### Completion Evidence
Link(s) to changed files, screenshot or command output showing chat count increment after join.

---

## Task 2: Resources Module — Real File Picker + Real Download

**AC Covered**: AC2, FR2, FR3, FR13 (Resources slot)
**Priority**: high
**Depends on**: —
**Status**: pending

### Scope
- **Backend** `server/models/ResourceItem.js`: Add fields `fileName`, `mimeType`, `fileSize` (string), optional `fileData` (String, base64, optional, only for small payloads).
- **Backend** `server/routes/resources.js`: Accept new fields on POST; on PUT `/bookmark` keep working; optionally add a PUT `/download` that increments `downloads` and returns metadata. Or just handle increment in the GET path when a download marker query param is present.
- **Frontend `ResourcesView` Upload Modal**:
  - Replace typed-in `fileFormat` dropdown priority with an actual `<input type="file" accept="*" id="resource-file-picker">`.
  - On file select: populate `fileName`, `fileSize`, derive `fileFormat` / category from file extension, and optionally read first 64KB as base64 via `FileReader`.
  - UI shows file preview row: icon, name, size, and "remove" (x) button.
  - Pass these fields to `addResource` + API.
- **Frontend `ResourcesView` Download Button**:
  - Implement `downloadResourceFile(res)` helper:
    - If `res.fileData` base64 present → convert to Blob → download.
    - Else generate a placeholder `.txt` / `.md` / `.pdf` file with title, course code, author, description as its textual content (with a PDF-esque header if extension claims .pdf, but use .txt actual MIME for simplicity/safety).
    - Increment local `downloads` count optimistically and optionally call backend endpoint to persist increment.

### Test Requirements
- **rule TR2.1**: Upload modal contains visible "Choose File" input or equivalent dropzone button; selecting a file shows its name and size.
- **rule TR2.2**: Submit upload → new resource card appears with correct file size/format from the real selected file.
- **rule TR2.3**: Click download → browser shows downloaded file in recent downloads; file non-empty bytes; name matches resource title + correct extension.
- **rule TR2.4**: Card downloads count increments after click.

### Completion Evidence
Lint/build pass, screenshot of Downloads folder with downloaded file, or acceptance test run output.

---

## Task 3: Post Attachments — Real Upload Picker in CreatePostModal + Real Download

**AC Covered**: AC3, AC6, FR5, FR13 (post slot), FR14 (post slot)
**Priority**: high
**Depends on**: —
**Status**: pending

### Scope
- **CreatePostModal.tsx**: Add an actual `<input type="file">` area with two slots or a single multi-accept:
  - Image attachment: `accept="image/*"` → render `<img>` preview when chosen.
  - File attachment: `accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.txt"` → show file metadata row.
  - Clear/remove each separately.
- Persist metadata through `createPost` in AppContext and the API call.
- **HomeView file attachment "Download" button**: Replace just-toast with actual Blob download (similar helper to Task 2). Prefer shared util `utils/fileDownload.ts downloadFile({name, mimeType?, content?, base64?})`.

### Test Requirements
- **rule TR3.1**: CreatePostModal has visible image and file file picker buttons; preview renders when chosen.
- **rule TR3.2**: Published post renders the attached image inline OR the file attachment box with correct metadata.
- **rule TR3.3**: Click Download on attached file → real download received, non-empty.

### Completion Evidence
Changed files list, test run output.

---

## Task 4: Chat — Real File Upload Picker & Attachment Downloads

**AC Covered**: AC4, FR6, FR13 (chat + shared-files slots), FR14 (chat slot)
**Priority**: high
**Depends on**: —
**Status**: pending

### Scope
- **ChatView `+` button**: Instead of `handleAttachMockPdf` creating a hardcoded "Document.pdf", open actual `<input type="file">` picker (hidden; trigger via `.click()`). Use `FileReader` to grab size/name/type. Call `sendMessage` with real attachment metadata.
- **Chat attachment download button**: Implement real download (shared util).
- **Chat right panel "Shared Files" list item**: Make each clickable → triggers download too (toast + Blob download).
- **Backend route `chat/:id/messages`**: Continue accepting `attachment` object; add `mimeType` field support in schema/message format.

### Test Requirements
- **rule TR4.1**: Click `+` in chat → OS file picker opens; selecting a file sends a message with real attachment name+size.
- **rule TR4.2**: Click Download on that attachment → file received in browser downloads.
- **rule TR4.3**: Clicking a "Shared Files" list entry in right panel downloads the file.

### Completion Evidence
Screenshot of chat with real attachment metadata; downloaded file present.

---

## Task 5: SellItemModal (Marketplace) — Real Image Picker + Preview

**AC Covered**: AC5, FR4, FR14 (marketplace slot)
**Priority**: medium
**Depends on**: —
**Status**: pending

### Scope
- `components/modals/SellItemModal.tsx`: Add real `<input type="file" accept="image/*">`. On file select, read via FileReader → show image preview thumbnail in the modal (replace default placeholder or overlay). Pass selected `image` (object URL or base64 preview URL) to the marketplace item data. Backend persists image URL string as before (now it matches chosen image for the session).

### Test Requirements
- **rule TR5.1**: Sell Item modal has "Upload Photo" file picker; selecting an image shows its preview in modal before submit.
- **rule TR5.2**: New marketplace card shows the uploaded image (not the default placeholder).
- **rubric TR5.3**: Preview quality — clear thumbnail, aspect ratio preserved, option to re-upload. (0-2; pass=2)

### Completion Evidence
Changed files.

---

## Task 6: LostAndFound — Real Image Picker (Frontend Add Flow)

**AC Covered**: FR7, FR14 (lostfound slot)
**Priority**: medium
**Depends on**: —
**Status**: pending

### Scope
- Check `LostAndFoundView.tsx` for how users report items. If no modal exists, add or inspect existing UI. Add an image file picker with preview in the "Report Lost" / "Report Found" form. The view may add via AppContext `addLostFoundItem` — make sure image field is populated from the chosen file.

### Test Requirements
- **rule TR6.1**: "Report Lost" / "Report Found" workflow includes image picker; shows preview.
- **rule TR6.2**: Submitted card uses chosen image (not default placeholder) in the list.

### Completion Evidence
Changed files.

---

## Task 7: Admin Access Guard

**AC Covered**: AC7, FR8
**Priority**: medium
**Depends on**: —
**Status**: pending

### Scope
- `AppLayout` or `AdminView`: check `user.role`. If non-ADMIN, render an "Access Denied" panel with icon, message "Admin access restricted to authorized staff only.", and a button back to Home.
- Also block client-side navigation route in `AppContext.setActiveView` fallback when user tries `/admin` manually without role.

### Test Requirements
- **rule TR7.1**: Login with `student@university.edu` → navigate to admin → see Access Denied card (not admin tabs).
- **rule TR7.2**: After changing role to ADMIN (manually via test data or a faculty alt), Admin view shows its tabs.
  (If no ADMIN demo user exists in seed, update `seed.js` to make one faculty or a 3rd user Admin.)

### Completion Evidence
Screenshot or component code render output showing Access Denied.

---

## Task 8: Profile — Avatar Upload & Persistent PUT /auth/me

**AC Covered**: FR10
**Priority**: medium
**Depends on**: —
**Status**: pending

### Scope
- `ProfileView` / `SettingsView`: Add avatar change file picker (accept image). Show preview; call `updateUser` with new avatar data URL or base64.
- Verify backend `PUT /api/auth/me` actually updates User doc for the fields Profile edits (name, bio, department, etc.). If any field isn't being applied to `$set` in the route, fix it.

### Test Requirements
- **rule TR8.1**: Avatar picker works → preview changes → after save, reload page and avatar remains (via API roundtrip).
- **rule TR8.2**: Edit bio → save → GET `/auth/me` returns updated bio.

### Completion Evidence
Diff of auth.js route and profile/settings view, plus evidence data.

---

## Task 9: Event RSVP Attendees Set + Ticket Download

**AC Covered**: FR11, FR13 (event ticket slot)
**Priority**: medium
**Depends on**: —
**Status**: pending

### Scope
- Backend `Event` model: add `registeredUsers: [ObjectId]` set (or names). PUT `/register` toggles inclusion and increments/decrements `registeredCount` from the actual set length (prevent double-count).
- `EventTicketModal.tsx`: Add a "Download Event Ticket" button that downloads an `.vcs` (iCalendar) OR a `.txt` file with event title, date, time, location, attendee name, ticket ID (random).

### Test Requirements
- **rule TR9.1**: RSVP twice in a row → second click de-registers; count correct; no duplicates in DB array.
- **rule TR9.2**: Ticket modal has download button → produces a file with actual event details inside.

### Completion Evidence
Changed files, downloaded ticket content sample.

---

## Task 10: Notification Action Button Navigation + Mark Read

**AC Covered**: FR9
**Priority**: low
**Depends on**: —
**Status**: pending

### Scope
- `NotificationsView`: Each notification card with `actionButton` → clicking button navigates via `setActiveView(actionButton.viewTarget)` AND marks it read. Clicking notification body also marks as read.

### Test Requirements
- **rule TR10.1**: Clicking action button "Open Community" on a community notification navigates to `/communities`.
- **rule TR10.2**: Marked-as-read state persists locally (count decreases).

### Completion Evidence
Changed view file.

---

## Task 11: Shared Utilities & Robustness

**AC Covered**: Part of all tasks / NFR build-lint pass
**Priority**: high
**Depends on**: Tasks 2-5, 9
**Status**: pending

### Scope
- Create `src/utils/fileUtils.ts` (or similar) exposing:
  - `readFileAsDataURL(file, maxBytes?): Promise<{name, size, type, dataUrl?}>` — safe FileReader, truncates big files to metadata only.
  - `triggerDownload(fileName: string, contents: string | BlobPart[], mimeType?: string, { asBase64?: boolean } = {})` — central helper for downloads.
  - `inferFormatFromFileName(name: string): string` — "PDF", "DOCX", "ZIP", "PPTX" etc.
- Apply shared helpers consistently in Tasks 2, 3, 4, and 9 so every download and upload uses the same utilities.
- Add CSS styles for file-picker preview rows and dropzone-like buttons if needed (append to `views.css` or inline scoped classnames; avoid breaking existing design).

### Test Requirements
- **rule TR11.1**: `npm run lint` → 0 errors.
- **rule TR11.2**: `npm run build` → exit code 0; TS typecheck passes.
- **rule TR11.3**: `utils` module is imported by at least 3 consumer components (Resources, Post, Chat, Ticket, any 3).

### Completion Evidence
Build log and lint output.

---

## Task 12: Community Discussion Attachments (Paperclip/Image buttons)

**AC Covered**: FR12, FR14 (community slot)
**Priority**: medium
**Depends on**: Task 11 (utils)
**Status**: pending

### Scope
- `CommunitiesView` discussion composer: Image button and Paperclip buttons currently only toasts. Add real `<input type="file">` triggers and attach metadata (image src preview or file attachment info) to discussion state & API payload.

### Test Requirements
- **rule TR12.1**: Attach image shows preview; attach doc shows file name toast.
- **rule TR12.2**: Newly created discussion preserves the file metadata shown in UI.

### Completion Evidence
Changed view + backend route.

---
End of Tasks.
