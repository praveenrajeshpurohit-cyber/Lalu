# Comman School — LMS for Gujarat Board English Medium

## What was built (MVP)
A complete, production-ready **Expo (React Native + Web)** LMS app with a **FastAPI + MongoDB** backend.

## User flows
### Public (no login)
- Landing page (`/`) with hero "Join Live Classes" CTA, category grid, featured courses carousel, teacher profile (Praveen Pareek), testimonials, FAQ accordion, contact section, dark-mode toggle, WhatsApp floating button.
- Static pages: About, Contact (with submission form), Privacy, Terms.

### Student (after register/login)
- Bottom-tab nav: Home, Courses, Live, Profile.
- Home: greeting, next live class card, stats, my enrolled courses, announcements.
- Courses: search + category chip filter, course cards, free vs paid.
- Course detail: tabs (Lessons / PDFs / Assignments), enroll CTA, locked content for non-enrolled, sticky bottom enroll bar.
- Payment flow: UPI QR display, "Open UPI App" deep link, screenshot upload, optional UPI ref, submit → admin approval.
- Live: list upcoming/ongoing classes, "Join" opens Zoom/Meet URL; "LIVE NOW" badge when in window.
- Profile: payment history, stats, dark mode toggle, settings shortcuts, logout.

### Admin (`Praveenrajeshpurohit@gmail.com / Praveen@5187`)
- Bottom-tab nav: Dashboard, Courses, Payments, Students, Settings.
- Dashboard: stats (students, courses, active enrollments, pending payments, total revenue), quick actions.
- Courses: full CRUD (title, description, category, price, discount, validity, level, free toggle, enrollment toggle); per-course **Content modal** to add video/PDF/assignment URLs.
- Payments: tabs Pending / Approved / Rejected; tap row for full detail incl. screenshot; Approve auto-grants enrollment.
- Students: search list of all users.
- Settings: UPI ID + QR upload, WhatsApp/email/phone, hero copy, teacher bio/qualifications, schedule live classes.

## Tech
- **Backend**: FastAPI, MongoDB (motor), bcrypt+JWT auth, admin auto-seeded on startup, /api prefix.
- **Frontend**: Expo SDK 54, expo-router file-based routes, React Native Web for landing, expo-image-picker for QR/screenshot, expo-linear-gradient, @expo/vector-icons.
- **State**: AppContext (auth + theme), Toast provider for feedback.
- **Theming**: light + dark with high-contrast Swiss-education palette (#0A2540 / #FFB800).

## Integrations
- Custom JWT auth (Bearer tokens stored via `@/src/utils/storage`).
- WhatsApp floating button (deeplink `wa.me/91...`).
- UPI deeplink `upi://pay?pa=...&am=...`.
- Manual UPI payment verification by admin (screenshot stored as base64).

## Out of scope (extensions)
- Built-in video player from base64 upload — currently admin pastes URLs (YouTube/Drive); content opens via Linking.
- Email notifications (skipped per user choice).
- Push notifications.
- Certificates auto-PDF (model exists; UI placeholder).
