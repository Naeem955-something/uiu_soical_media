import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer, Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TabStopType,
  TextRun,
  WidthType
} from 'docx';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ACCENT = 'D97706';
const ACCENT_BG = 'FFFBEB';
const HEADER_BG = 'D97706';
const DARK = '0F172A';
const MUTED = '475569';

const p = (children, opts = {}) => new Paragraph({ children: Array.isArray(children) ? children : [tr(children)], ...opts });
const tr = (t, o = {}) => new TextRun({ text: t, size: 21, color: DARK, font: 'Calibri', ...o });
const bold = (t) => tr(t, { bold: true });
const muted = (t) => tr(t, { color: MUTED, size: 19, italics: true });
const italic = (t) => tr(t, { italics: true });
const accent = (t) => tr(t, { bold: true, color: ACCENT });

const h1 = (t) => new Paragraph({
  text: t, heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 180 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 8 } }
});
const h2 = (t) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } });
const h3 = (t) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 80 } });
const bl = (children, level = 0) => new Paragraph({
  children: Array.isArray(children) ? children : [tr(children)],
  bullet: { level },
  spacing: { after: 40 }
});
const pb = () => new Paragraph({ children: [], pageBreakBefore: true });

const hdr = (t) => new TableCell({
  children: [new Paragraph({ children: [tr(t, { bold: true, color: 'FFFFFF', size: 20 })], spacing: { after: 0 } })],
  shading: { type: ShadingType.SOLID, color: HEADER_BG, fill: HEADER_BG },
  margins: { top: 60, bottom: 60, left: 80, right: 80 },
  verticalAlign: 'center'
});

const cell = (t, opts = {}) => {
  const c = Array.isArray(t) ? t.map(x => new Paragraph({ children: [tr(x, { size: 19 })], spacing: { after: 20 } })) : [new Paragraph({ children: [tr(t, { size: 19 })], spacing: { after: 20 } })];
  return new TableCell({ children: c, margins: { top: 50, bottom: 50, left: 80, right: 80 }, ...opts });
};

const children = [];

// ========= TITLE =========
children.push(new Paragraph({ spacing: { before: 1800 } }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [tr('MEMBER 1', { bold: true, size: 72, color: ACCENT })], spacing: { after: 80 } }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [tr('CONTRIBUTION BRIEF', { bold: true, size: 52, color: DARK })], spacing: { after: 600 } }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [bold('Project: '), tr('UniConnect — Campus Academic & Community Portal')], spacing: { after: 80 } }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [bold('Role: '), tr('Lead Developer')], spacing: { after: 200 } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  border: { top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 10 }, bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 10 } },
  spacing: { before: 100, after: 100, line: 360 },
  children: [accent('▸  Feature 1 — Auth & RBAC     ▸  Feature 10 — Digital Twin Profile     ▸  Feature 13 — Admin Console (9 Modules)')]
}));

children.push(pb());

// ========= TOC =========
h1('TABLE OF CONTENTS');
children.push(new Paragraph({
  spacing: { after: 80 }, tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
  children: [tr('1.  Member 1 Contributions Summary', { size: 24 }), tr('\t3', { italics: true, color: MUTED, size: 22 })]
}));
children.push(new Paragraph({
  spacing: { after: 80 }, tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
  children: [tr('2.  Feature 1 — Authentication & RBAC', { size: 24 }), tr('\t3', { italics: true, color: MUTED, size: 22 })]
}));
children.push(new Paragraph({
  spacing: { after: 80 }, tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
  children: [tr('3.  Feature 10 — Academic Digital Twin', { size: 24 }), tr('\t5', { italics: true, color: MUTED, size: 22 })]
}));
children.push(new Paragraph({
  spacing: { after: 80 }, tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
  children: [tr('4.  Feature 13 — Admin Console (9 Modules)', { size: 24 }), tr('\t6', { italics: true, color: MUTED, size: 22 })]
}));
children.push(new Paragraph({
  spacing: { after: 80 }, tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
  children: [tr('5.  Architecture Decisions', { size: 24 }), tr('\t9', { italics: true, color: MUTED, size: 22 })]
}));
children.push(new Paragraph({
  spacing: { after: 80 }, tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
  children: [tr('6.  Full Database Schema (11 Collections)', { size: 24 }), tr('\t10', { italics: true, color: MUTED, size: 22 })]
}));
children.push(new Paragraph({
  spacing: { after: 80 }, tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
  children: [tr('7.  Teacher Q&A (10 Questions)', { size: 24 }), tr('\t17', { italics: true, color: MUTED, size: 22 })]
}));

children.push(pb());

// ========= SECTION 1: MEMBER 1 SUMMARY =========
children.push(h1('1. MEMBER 1 CONTRIBUTIONS — QUICK SUMMARY'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Feature #'), hdr('Title'), hdr('Key Deliverables')] }),
    new TableRow({ children: [
      cell('F1'),
      cell('Authentication & Multi-Role Access Control'),
      cell([
        '• JWT + bcryptjs auth system (30-day tokens)',
        '• 3 RBAC roles: STUDENT / FACULTY / ADMIN',
        '• 3 auth middlewares: protect, optionalAuth, adminOnly',
        '• 6 auth REST endpoints + auto-admin provisioning',
        '• Dual-portal Login UI (Campus + dark Admin mode)',
        '• Account suspension (isBlocked) enforcement'
      ])
    ]}),
    new TableRow({ children: [
      cell('F10'),
      cell('Academic Digital Twin & Profile Showcase'),
      cell([
        '• 7-dimension profile model (identity + academics + skills)',
        '• 6-profile-section layout + 6-tab edit modal',
        '• CGPA privacy toggle (1-click, server-side projected)',
        '• Featured project, research interests, honors cards',
        '• Procedural fallback generator → zero empty-profile 404s',
        '• Inline contact modal → chat integration'
      ])
    ]}),
    new TableRow({ children: [
      cell('F13'),
      cell('Admin Management Console (9 Modules)'),
      cell([
        '• Router-level protect+adminOnly gating (all 26 endpoints)',
        '1. Analytics Dashboard  2. User Mgmt  3. Post Mgmt',
        '4. Reports Queue  5. Event Mgmt  6. Communities/Clubs',
        '7. Announcements + broadcast  8. Notification Broadcast',
        '9. Platform Settings (branding + operational toggles)',
        '• AdminView access-denied guard with one-click admin switch'
      ])
    ]})
  ]
}));

children.push(pb());

// ========= SECTION 2: FEATURE 1 =========
children.push(h1('2. FEATURE 1 — AUTHENTICATION & RBAC'));

children.push(h2('2.1 Core Components'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Layer'), hdr('Component / File'), hdr('Purpose')] }),
    new TableRow({ children: [cell('DB'), cell('models/User.js'), cell('25-field schema, role enum, verified + isBlocked flags, pre(save) bcrypt hook, matchPassword() method')] }),
    new TableRow({ children: [cell('Middleware'), cell('middleware/auth.js'), cell('protect (token+block check), optionalAuth (public routes), adminOnly (RBAC)')] }),
    new TableRow({ children: [cell('API'), cell('routes/auth.js'), cell('register, login, me, update me, /users list, /profile/:id (with procedural fallback)')] }),
    new TableRow({ children: [cell('State'), cell('context/AppContext.tsx'), cell('login, register, logout, updateUser, openUserProfile, auto-login demo fallback')] }),
    new TableRow({ children: [cell('UI'), cell('views/LoginView.tsx'), cell('Dual Campus/Admin portal, Student/Faculty segmented picker, password toggle, role-aware post-login routing')] })
  ]
}));

children.push(h2('2.2 Workflow (Step-by-Step)'));
children.push(bl([bold('1. Registration: '), tr('Email uniqueness check → User.create() → bcrypt 10-salt hash → JWT issuance → { token, user }')]));
children.push(bl([bold('2. Login: '), tr('Email normalize (trim+lowercase) → case-insensitive find → matchPassword → JWT. If admin@university.edu doesn\'t exist, ADMIN is auto-provisioned.')]));
children.push(bl([bold('3. Token storage: '), tr('localStorage key = uniconnect_token; Authorization: Bearer <token> on every API call.')]));
children.push(bl([bold('4. Request pipeline: '), tr('protect → verify JWT → hydrate req.user (select -password) → check isBlocked → route handler.')]));
children.push(bl([bold('5. Role gating: '), tr('adminOnly checks req.user.role === ADMIN → 403 otherwise. Applied globally on admin router (line 13).')]));
children.push(bl([bold('6. UI routing: '), tr('Admin portal login → /admin. Student/Faculty login → /home. Hidden safety: if student login returns role=ADMIN → redirects to /admin.')]));

children.push(pb());

// ========= SECTION 3: FEATURE 10 =========
children.push(h1('3. FEATURE 10 — ACADEMIC DIGITAL TWIN'));

children.push(h2('3.1 Profile Dimensions (7)'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('#'), hdr('Dimension'), hdr('Fields'), hdr('Key Feature')] }),
    new TableRow({ children: [cell('1'), cell('Identity'), cell('name, email, avatar, studentId, dept, semester, major, bio, verified'), cell('Avatar presets (4) + quick pencil edit')] }),
    new TableRow({ children: [cell('2'), cell('Academic Standing'), cell('cgpa, hideCgpa, creditsCompleted, totalCredits'), cell('1-click CGPA hide toggle; progress % bar')] }),
    new TableRow({ children: [cell('3'), cell('Reputation'), cell('reputationScore (0–1000)'), cell('Hero card score box')] }),
    new TableRow({ children: [cell('4'), cell('Expertise'), cell('skills[], tags[]'), cell('3-color coded skill pills')] }),
    new TableRow({ children: [cell('5'), cell('Portfolio'), cell('featuredProject {title, desc, image, githubUrl, stars}'), cell('Thumbnail + GitHub link with stars')] }),
    new TableRow({ children: [cell('6'), cell('Research'), cell('researchInterests[] {title, subtitle}'), cell('Icon rows (Cpu / Sparkles)')] }),
    new TableRow({ children: [cell('7'), cell('Honors'), cell('achievements[] {title, subtitle, date}'), cell('3-column colored achievement cards')] })
  ]
}));

children.push(h2('3.2 Workflow'));
children.push(bl([bold('1. Render: '), tr('6 sections — Hero card → Academic/Skills row → Project/Research row → Honors → Contact CTA → 6-tab Edit Modal')]));
children.push(bl([bold('2. 6-Tab Edit Modal: '), tr('Identity · Academic & CGPA · Skills · Project · Research · Honors — all fields persisted via PUT /api/auth/me')]));
children.push(bl([bold('3. CGPA privacy: '), tr('hideCgpa boolean → server-side in formatUser() projection. Never sent hidden value to API consumers.')]));
children.push(bl([bold('4. Fallback generator (critical): '), tr('GET /profile/:idOrName → ObjectId lookup → name regex lookup → if both fail, synthesize valid Digital Twin. Role inference: Club→CLUB, Dr/Prof→FACULTY, else→STUDENT. All 29 fields get sensible defaults. Result: ZERO empty profiles.')]));
children.push(bl([bold('5. Messaging: '), tr('Inline contact modal → startConversationAndSendMessage → direct chat + navigation to inbox.')]));

children.push(pb());

// ========= SECTION 4: FEATURE 13 =========
children.push(h1('4. FEATURE 13 — ADMIN CONSOLE (9 MODULES)'));
children.push(p([bold('Architecture: '), tr('router.use(protect, adminOnly) on admin sub-router → every endpoint double-gated before any handler runs. 26 total endpoints.')]));

children.push(h2('4.1 All 9 Modules — At a Glance'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('#'), hdr('Module'), hdr('APIs'), hdr('Core Actions')] }),
    new TableRow({ children: [cell('1'), cell('Dashboard'), cell('GET /stats'), cell('8 parallel countDocuments → 8 KPIs + top-4 pending reports + quick actions')] }),
    new TableRow({ children: [cell('2'), cell('User Management'), cell('GET|POST|PUT|DELETE /users, PUT /users/:id/block'), cell('Search + role/status filters, CRUD, 1-click Block/Unblock (enforced by protect middleware)')] }),
    new TableRow({ children: [cell('3'), cell('Post Management'), cell('GET /posts, DELETE /posts/:id, DELETE /posts/:pid/comments/:cid'), cell('Populated author info, per-post and per-comment delete')] }),
    new TableRow({ children: [cell('4'), cell('Reports'), cell('GET|POST|PUT|DELETE /reports'), cell('Pending/Reviewed/Dismissed pipeline; nav badge shows live pending count')] }),
    new TableRow({ children: [cell('5'), cell('Event Management'), cell('GET|POST|PUT|DELETE /events'), cell('Type badges (SEMINAR/WORKSHOP/HACKATHON), capacity enforcement, CRUD')] }),
    new TableRow({ children: [cell('6'), cell('Communities & Clubs'), cell('GET|POST|PUT|DELETE /communities'), cell('Approval/Pending/Suspended status, auto-seed 3 defaults if empty')] }),
    new TableRow({ children: [cell('7'), cell('Announcements'), cell('GET|POST|PUT|DELETE /announcements'), cell('Audience + priority. CHECKBOX: broadcast → inserts 1 Notification per user via insertMany')] }),
    new TableRow({ children: [cell('8'), cell('Notification Broadcast'), cell('GET|POST /notifications'), cell('Targeted by role (ALL/STUDENT/FACULTY), bulk insertMany, recipientsCount audit')] }),
    new TableRow({ children: [cell('9'), cell('Platform Settings'), cell('GET|PUT /settings'), cell('Branding (name, location, session) + 3 toggles (posts, moderation, registration) + system notice')] })
  ]
}));

children.push(h2('4.2 AdminView Guard'));
children.push(bl([bold('Client-side UX guard: '), tr('AdminView renders "Access Restricted" card if user.role ≠ ADMIN. Buttons: Return to Student View · Switch to Admin Account (auto-login as admin@university.edu for demos).')]));
children.push(bl([bold('Server-side enforcement: '), tr('router.use(protect, adminOnly) runs for every /api/admin/* request. Even with direct curl, 403 without ADMIN token.')]));

children.push(pb());

// ========= SECTION 5: ARCHITECTURE =========
children.push(h1('5. ARCHITECTURE DECISIONS'));
children.push(bl([bold('JWT vs sessions: '), tr('Stateless tokens scale better; no Redis session store. localStorage + Bearer header on every axios call. 30-day expiry.')]));
children.push(bl([bold('bcrypt 10 rounds: '), tr('OWASP 2024 recommendation for Node. ~100ms/hash. $2a$ prefix guard prevents double-hash on re-save.')]));
children.push(bl([bold('formatUser() projection layer: '), tr('Decouples Mongoose doc shape from TS User contract. Every ADT field has a default — no empty UI.')]));
children.push(bl([bold('Middleware-composed RBAC: '), tr('Router-level gating is less error-prone than per-handler role checks. Client guard is UX only.')]));
children.push(bl([bold('In-memory platform settings: '), tr('Zero-setup for demos; trivially swappable to Mongoose collection.')]));

children.push(pb());

// ========= SECTION 6: DATABASE SCHEMA =========
children.push(h1('6. FULL DATABASE SCHEMA (11 Collections)'));
children.push(p([italic('All schemas use mongoose with { timestamps: true } → auto createdAt + updatedAt fields on every record.')]));

// --- 1. User ---
children.push(h2('6.1 User (authentication + Digital Twin)'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Constraints / Default')] }),
    new TableRow({ children: [cell('_id'), cell('ObjectId'), cell('Primary key (auto)')] }),
    new TableRow({ children: [cell('name'), cell('String'), cell('required')] }),
    new TableRow({ children: [cell('email'), cell('String'), cell('required, unique index')] }),
    new TableRow({ children: [cell('password'), cell('String'), cell('required (hashed via pre-save bcrypt)')] }),
    new TableRow({ children: [cell('avatar'), cell('String'), cell("''")] }),
    new TableRow({ children: [cell('role'), cell('String enum'), cell('[STUDENT | FACULTY | ADMIN], default: STUDENT')] }),
    new TableRow({ children: [cell('department, semester, studentId, major, expectedGraduation'), cell('String'), cell("defaults ''")] }),
    new TableRow({ children: [cell('reputationScore'), cell('Number'), cell('0')] }),
    new TableRow({ children: [cell('cgpa, creditsCompleted, totalCredits'), cell('Number'), cell('0')] }),
    new TableRow({ children: [cell('hideCgpa, verified, isBlocked'), cell('Boolean'), cell('false')] }),
    new TableRow({ children: [cell('bio'), cell('String'), cell("''")] }),
    new TableRow({ children: [cell('skills, tags'), cell('[String]'), cell('[]')] }),
    new TableRow({ children: [cell('featuredProject'), cell('Sub-doc'), cell('{ title, description, image, githubUrl, stars }')] }),
    new TableRow({ children: [cell('researchInterests'), cell('[{ title, subtitle }]'), cell('[]')] }),
    new TableRow({ children: [cell('achievements'), cell('[{ title, subtitle, date }]'), cell('[]')] })
  ]
}));

// --- 2. Post ---
children.push(h2('6.2 Post (Campus Feed + Polls + Comments)'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('author'), cell('ObjectId → User'), cell('ref: User')] }),
    new TableRow({ children: [cell('authorName, authorAvatar, authorDepartment'), cell('String'), cell('Denormalized for fast feed render')] }),
    new TableRow({ children: [cell('authorBadge'), cell('String enum'), cell('[FACULTY | CLUB | STUDENT | ""]')] }),
    new TableRow({ children: [cell('title, content'), cell('String'), cell('content required')] }),
    new TableRow({ children: [cell('image, imageDataUrl'), cell('String'), cell("''")] }),
    new TableRow({ children: [cell('fileAttachment'), cell('Sub-doc'), cell('{ name, size, url, mimeType, extension, fileData }')] }),
    new TableRow({ children: [cell('tags'), cell('[String]'), cell('[]')] }),
    new TableRow({ children: [cell('likes, commentsCount'), cell('Number'), cell('0')] }),
    new TableRow({ children: [cell('likedBy'), cell('[ObjectId → User]'), cell('Ref users who liked')] }),
    new TableRow({ children: [cell('comments'), cell('[{ author:{name,avatar}, text, createdAt }]'), cell('Embedded')] }),
    new TableRow({ children: [cell('poll'), cell('Sub-doc'), cell('{ question, options:[{label,votes}], totalVotes, endsIn }')] }),
    new TableRow({ children: [cell('actionButton'), cell('Sub-doc'), cell('{ label, actionType }')] })
  ]
}));

// --- 3. Event ---
children.push(h2('6.3 Event'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('title, date, time, location, description'), cell('String'), cell('all required')] }),
    new TableRow({ children: [cell('typeBadge'), cell('String enum'), cell('[SEMINAR | WORKSHOP | HACKATHON]')] }),
    new TableRow({ children: [cell('image'), cell('String'), cell("''")] }),
    new TableRow({ children: [cell('registeredCount, maxCapacity'), cell('Number'), cell('0 / 100')] }),
    new TableRow({ children: [cell('isFeatured'), cell('Boolean'), cell('false')] }),
    new TableRow({ children: [cell('registeredUsers'), cell('[ObjectId → User]'), cell('Refs')] }),
    new TableRow({ children: [cell('countdownTarget'), cell('Date'), cell('Optional countdown date')] })
  ]
}));

// --- 4. Community ---
children.push(h2('6.4 Community / Club'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('name, description'), cell('String'), cell('name required')] }),
    new TableRow({ children: [cell('category'), cell('String'), cell("'Academic' default")] }),
    new TableRow({ children: [cell('leaderName, leaderEmail'), cell('String'), cell("'Campus Coordinator' / ''")] }),
    new TableRow({ children: [cell('membersCount'), cell('Number'), cell('1')] }),
    new TableRow({ children: [cell('status'), cell('String enum'), cell('[Approved | Pending | Suspended]')] }),
    new TableRow({ children: [cell('bannerImage, meetingInfo, iconColor'), cell('String'), cell('iconColor default #2563EB')] }),
    new TableRow({ children: [cell('tags'), cell('[String]'), cell('[]')] }),
    new TableRow({ children: [cell('discussions'), cell('Embedded list'), cell('Each: { author, avatar, category, content, likes, likedBy, comments[], createdAt }')] })
  ]
}));

// --- 5. MarketplaceItem ---
children.push(h2('6.5 MarketplaceItem (Student Peer-to-Peer)'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('title'), cell('String'), cell('required')] }),
    new TableRow({ children: [cell('price'), cell('Number'), cell('required')] }),
    new TableRow({ children: [cell('location, condition, category, image, description'), cell('String'), cell('condition: USED-GOOD default; category: Other')] }),
    new TableRow({ children: [cell('seller'), cell('ObjectId → User'), cell('Ref')] }),
    new TableRow({ children: [cell('sellerName, sellerAvatar'), cell('String'), cell('Denormalized for listings')] }),
    new TableRow({ children: [cell('bookmarkedBy'), cell('[ObjectId → User]'), cell('Users who saved the listing')] })
  ]
}));

// --- 6. LostFoundItem ---
children.push(h2('6.6 LostFoundItem'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('title'), cell('String'), cell('required')] }),
    new TableRow({ children: [cell('statusType'), cell('String enum'), cell('[Lost | Found] required')] }),
    new TableRow({ children: [cell('category, location, image, details, finderName'), cell('String'), cell("category default 'Other'")] }),
    new TableRow({ children: [cell('reporter'), cell('ObjectId → User'), cell('Ref')] }),
    new TableRow({ children: [cell('bookmarkedBy'), cell('[ObjectId → User]'), cell('Saved items')] })
  ]
}));

// --- 7. ResourceItem ---
children.push(h2('6.7 ResourceItem (Academic Library)'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('title'), cell('String'), cell('required')] }),
    new TableRow({ children: [cell('courseCode, category'), cell('String'), cell("category default 'Lecture Notes'")] }),
    new TableRow({ children: [cell('author'), cell('ObjectId → User'), cell('Ref')] }),
    new TableRow({ children: [cell('authorName, authorAvatar, fileSize, fileFormat, fileName, mimeType, extension, fileData, description'), cell('String'), cell('fileFormat PDF default')] }),
    new TableRow({ children: [cell('downloads, rating'), cell('Number'), cell('0')] }),
    new TableRow({ children: [cell('bookmarkedBy'), cell('[ObjectId → User]'), cell('Saved resources')] })
  ]
}));

// --- 8. ChatConversation ---
children.push(h2('6.8 ChatConversation (Direct + Group)'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('name, lastMessage, lastMessageTime, topic, aboutText'), cell('String'), cell("''")] }),
    new TableRow({ children: [cell('type'), cell('String enum'), cell('[GROUP | DIRECT]')] }),
    new TableRow({ children: [cell('unreadCount, membersOnline'), cell('Number'), cell('0')] }),
    new TableRow({ children: [cell('avatarText, avatarColor, avatarImage'), cell('String'), cell('Letter avatar + color')] }),
    new TableRow({ children: [cell('onlineStatus'), cell('Boolean'), cell('false')] }),
    new TableRow({ children: [cell('membersList, sharedFiles'), cell('[Mixed]'), cell('Flexible schema (name/avatar/role)')] }),
    new TableRow({ children: [cell('recentMedia'), cell('[String]'), cell('Image URLs')] }),
    new TableRow({ children: [cell('messages[]'), cell('Embedded'), cell('{ senderId, senderName, senderAvatar, content, timestamp, isCurrentUser, reactions [Mixed], attachment [Mixed], seenBy }')] })
  ]
}));

// --- 9. Notification ---
children.push(h2('6.9 Notification (Per-User)'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('userId'), cell('ObjectId → User'), cell('required, ref: User')] }),
    new TableRow({ children: [cell('title, description, category, type'), cell('String'), cell('all required')] }),
    new TableRow({ children: [cell('isRead'), cell('Boolean'), cell('false default')] }),
    new TableRow({ children: [cell('actionButton'), cell('Sub-doc'), cell('{ label, viewTarget }')] }),
    new TableRow({ children: [cell('secondaryButton'), cell('Sub-doc'), cell('{ label }')] })
  ]
}));

// --- 10. Announcement ---
children.push(h2('6.10 Announcement (Official Campus)'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('title, content'), cell('String'), cell('both required')] }),
    new TableRow({ children: [cell('category, targetAudience'), cell('String'), cell("'General' / 'All' default")] }),
    new TableRow({ children: [cell('priority'), cell('String enum'), cell('[Low | Normal | High | Urgent]')] }),
    new TableRow({ children: [cell('authorName'), cell('String'), cell("'University Administration' default")] }),
    new TableRow({ children: [cell('status'), cell('String enum'), cell('[Published | Draft]')] }),
    new TableRow({ children: [cell('sentNotification'), cell('Boolean'), cell('false (was this broadcast via Notifications?)')] })
  ]
}));

// --- 11. AdminReport ---
children.push(h2('6.11 AdminReport (Moderation Queue)'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Field'), hdr('Type'), hdr('Notes')] }),
    new TableRow({ children: [cell('reporterName, reporterInitials, reporterRole'), cell('String'), cell('all required')] }),
    new TableRow({ children: [cell('reportedContent, locationContext, reason'), cell('String'), cell('all required')] }),
    new TableRow({ children: [cell('priority'), cell('String enum'), cell('[High | Medium | Low] required')] }),
    new TableRow({ children: [cell('status'), cell('String enum'), cell('[Pending | Reviewed | Dismissed] · Pending default')] })
  ]
}));

// Schema Relationships Diagram (text)
children.push(h2('6.12 Relationships Summary'));
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: [hdr('Relationship'), hdr('Type'), hdr('Fields')] }),
    new TableRow({ children: [cell('User → Post (1:N)'), cell('Reference + Denorm'), cell('Post.author → User._id; Post.authorName/avatar/dept denormalized for read speed')] }),
    new TableRow({ children: [cell('User → Post.likes (N:M)'), cell('Reference list'), cell('Post.likedBy[] → User._id')] }),
    new TableRow({ children: [cell('User → Marketplace (1:N)'), cell('Reference + Denorm'), cell('MarketplaceItem.seller → User; sellerName/avatar denormalized')] }),
    new TableRow({ children: [cell('User → Resource (1:N)'), cell('Reference + Denorm'), cell('ResourceItem.author → User; authorName/avatar denormalized')] }),
    new TableRow({ children: [cell('User → Event (N:M register)'), cell('Reference list'), cell('Event.registeredUsers[] → User._id')] }),
    new TableRow({ children: [cell('User → Notification (1:N)'), cell('Reference'), cell('Notification.userId → User._id')] }),
    new TableRow({ children: [cell('User → LostFound (1:N reporter)'), cell('Reference'), cell('LostFoundItem.reporter → User._id')] }),
    new TableRow({ children: [cell('Many → Bookmarked By'), cell('Reference lists'), cell('Marketplace.bookmarkedBy, LostFound.bookmarkedBy, Resource.bookmarkedBy → User._id[]')] })
  ]
}));

children.push(pb());

// ========= SECTION 7: Q&A =========
children.push(h1('7. TEACHER Q&A — TEN MODEL ANSWERS'));

const qa = [
  ['Q1 — End-to-end authentication walkthrough',
    'Stateless JWT system. Backend: User model with pre(\'save\') bcrypt 10-round hash (only on password change). protect middleware extracts Bearer token → verifies JWT → hydrates req.user (select -password) → blocks isBlocked users (403) → next(). /login normalizes email, does case-insensitive lookup, admin auto-provision, matchPassword → issue 30-day JWT. Frontend: token in localStorage, validated on boot via GET /auth/me; in demo mode, auto-login as student@university.edu so UX never stalls.'
  ],
  ['Q2 — Admin RBAC enforcement',
    'Two layers. Server: router.use(protect, adminOnly) on the admin sub-router — every /api/admin/* endpoint is double-gated at router level. adminOnly returns 403 if req.user.role !== ADMIN. Client: AdminView renders "Access Restricted" card + programmatic "Switch to Admin Account" demo button. LoginView has a dedicated dark Admin portal that disables registration and routes straight to /admin. Client-side gating is UX-only; real enforcement is server-side.'
  ],
  ['Q3 — What is the Academic Digital Twin?',
    'A 7-dimension structured profile: Identity, Academic Standing (CGPA, credits progress, 1-click hide toggle), Reputation 0–1000, Skills cluster, Featured Project showcase, Research Interests, Honors/Achievements. Two design innovations: (1) formatUser() projection provides defaults for all 29 output fields so no collapsed UI. (2) Procedural fallback generator in GET /profile/:idOrName — any post author or club name (Dr, Prof, Club) that isn\'t a real account gets a fully valid synthesized Digital Twin. Result: zero 404s, every name click resolves. Customization via 6-tab Identity/Academic/Skills/Project/Research/Honors edit modal.'
  ],
  ['Q4 — CGPA privacy implementation',
    'Boolean hideCgpa in User schema. In the UI: 1-click Eye/EyeOff toggle calls updateUser({ hideCgpa }) with explanatory toast. When true, Academic Standing card renders "CGPA Hidden" instead of the numeric value. Critically, this is not a CSS trick — formatUser() on the server skips the real CGPA value and returns the hidden flag, so direct API consumers also cannot read a hidden CGPA.'
  ],
  ['Q5 — Admin moderation report lifecycle',
    '1. Student submits POST /reports — reporter identity captured from req.user, status = Pending. 2. Admin nav tab shows live badge via .filter(r => status != Reviewed).length. 3. Three actions: Mark Reviewed (PUT status Reviewed · acknowledged), Dismiss (PUT Dismissed · false positive), Delete (hard remove after resolution). 4. Mod admin then optionally uses Module 3 (Post Mgmt) to delete offending post/comment if warranted.'
  ],
  ['Q6 — List the 9 admin modules',
    '1. Analytics Dashboard — 8 parallel DB counts → 8 KPI cards + top-4 pending reports + quick actions. 2. User Management — CRUD + search/filters + 1-click Block/Unblock. 3. Post Management — feed moderation with per-post + per-comment delete. 4. Reports — Pending/Reviewed/Dismissed moderation queue. 5. Events — CRUD with type badges (SEMINAR/WORKSHOP/HACKATHON) and max-capacity enforcement. 6. Communities & Clubs — Approval status + auto-seed 3 defaults when collection empty. 7. Announcements — Registrar notices with optional broadcast (inserts 1 Notification per user via insertMany). 8. Notification Broadcast — targeted by role (ALL/STUDENTS/FACULTY), bulk insertMany with recipient count audit. 9. Platform Settings — branding (name, location, session) + 3 operational toggles (posts, moderation, registration) + system notice banner.'
  ],
  ['Q7 — Plaintext password leak prevention',
    'Two complementary defenses. Write-time: Mongoose pre(\'save\') hook bcrypt-hashes with 10 salt rounds, plus $2a$/$2b$ prefix guard prevents double-hash on re-save (idempotency). Read-time: every API that returns user data either uses .select(\'-password\') on the query, or passes through formatUser() which never reads the password field. So: plaintext never persisted; bcrypt hashes never serialized to the client.'
  ],
  ['Q8 — How Announcements trigger per-user Notifications',
    'Two-phase atomic in POST /announcements. Phase 1: save the Announcement doc with sentNotification=true. Phase 2 (only if checkbox checked): backend queries User.find().select(\'_id\') → maps recipients to Notification documents (title prefixed 📢, 100-char content snippet, category academic, actionButton {label, viewTarget}) → bulk Notification.insertMany(). Same content now lives simultaneously in: (a) Announcements feed, (b) every recipient user\'s TopNav notification bell.'
  ],
  ['Q9 — What happens when a blocked user makes API calls?',
    'In the protect middleware (after successful JWT validation, line 17–19 auth.js) there is an explicit if(req.user.isBlocked) → returns HTTP 403 "Account suspended by campus administration." The JWT itself remains cryptographically valid so if the ban is lifted, the same session token works without password reset. Admins toggle via User Management → "Ban" button → PUT /admin/users/:id/block → flips isBlocked boolean.'
  ],
  ['Q10 — Profile lookup for non-existent author names',
    'Dual-resolution in GET /auth/profile/:idOrName. Pass 1: if param matches 24-hex regex → findById. Pass 2: findOne by name with case-insensitive regex. Pass 3 (both fail): procedurally synthesize a complete Digital Twin with role inference from name tokens (contains "Club"→CLUB role; "Dr."/"Prof"→FACULTY; else STUDENT), verified=true, reputation=910, cgpa=3.88, 98/120 credits, 5 skills, 1 featured project, 2 research interests, 2 achievements. Outcome: every clickable author name anywhere in the app (posts, marketplace sellers, resource uploaders) always shows a valid profile page — never a 404 or empty screen.'
  ]
];

for (const [q, a] of qa) {
  children.push(p([bold(q)]));
  children.push(p([tr(a)], { spacing: { before: 40, after: 180, line: 320 } }));
}

// ========= BUILD =========
const doc = new Document({
  creator: 'UniConnect — Member 1',
  title: 'Member 1 Brief + DB Schema',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 21 } } },
    heading1: { run: { color: ACCENT, bold: true, size: 36, font: 'Calibri' } },
    heading2: { run: { color: DARK, bold: true, size: 28, font: 'Calibri' } },
    heading3: { run: { color: ACCENT, bold: true, size: 24, font: 'Calibri' } }
  },
  numbering: {
    config: [
      { levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 200 } } } }] },
      { levels: [{ level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 200 } } } }] }
    ]
  },
  sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }]
});

const buffer = await Packer.toBuffer(doc);
const outPath = join(__dirname, 'MEMBER_1_CONTRIBUTION_BRIEF.docx');
writeFileSync(outPath, buffer);
console.log('✅ Done:', outPath);
console.log('   Size:', (buffer.length / 1024).toFixed(1), 'KB');
console.log('   Inclusions: Condensed F1/F10/F13 + Architecture + 11 Schema Tables + Q&A');
