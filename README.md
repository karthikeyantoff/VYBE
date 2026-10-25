<div align="center">
  <p>
    <img src="./client/src/assets/logo-glyph.svg" alt="VYBE logo" width="36" height="36" />
    <strong> VYBE</strong>
  </p>

  <h1>VYBE — Complete Social Media & Networking Platform</h1>

  <p><em>An enterprise-grade, high-performance MERN social networking platform featuring strict username validations, real cryptographic email verification, single-use password resets, progressive registration UX, a personalized feed, Cloudinary media CDN, real-time Socket.io notifications, dynamic session JWT security, and a decoupled standalone administration dashboard.</em></p>

  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square&logo=node.js&logoColor=white" alt="Node.js version" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
    <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" alt="Express 5" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
    <img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square&logo=vercel&logoColor=white" alt="Vercel Deployment" />
    <img src="https://img.shields.io/badge/Author-Karthikeyan%20T-purple?style=flat-square" alt="Forward Deployed Engineer" />
    <img src="https://img.shields.io/badge/Contributors-1%20(Sole%20Author)-success?style=flat-square" alt="Sole Contributor" />
  </p>

  <p>
    🚀 <strong><a href="https://vybe-app-ecru.vercel.app/">Live Web App</a></strong> •
    🛡️ <strong><a href="https://vybe-admin-eight.vercel.app/login">Live Admin Console</a></strong> •
    ⚙️ <strong><a href="https://vybe-backend-flax.vercel.app/">Live Backend API</a></strong> •
    📖 <strong><a href="https://vybe-backend-flax.vercel.app/api-docs">Swagger API Docs</a></strong>
  </p>

  <p>
    <a href="https://github.com/karthikeyantoff/VYBE">GitHub Repository</a> •
    <a href="#-live-application-previews">Screenshots</a> •
    <a href="#architecture--3-tier-decoupled-deployment">Architecture</a> •
    <a href="#core-features--authentication-suite">Features</a> •
    <a href="#deployment-guide-3-independent-services">Deployment Guide</a> •
    <a href="#api-endpoints">API Docs</a> •
    <a href="#automated-testing--verification">Testing</a> •
    <a href="#author--credits">Author</a>
  </p>
</div>

---

## 📸 Live Application Previews

| 📱 [Consumer Frontend (Live)](https://vybe-app-ecru.vercel.app/) | 🛡️ [Standalone Admin Console (Live)](https://vybe-admin-eight.vercel.app/login) |
| :---: | :---: |
| <a href="https://vybe-app-ecru.vercel.app/"><img src="./docs/screenshots/vybe-frontend-app.png" alt="VYBE Consumer Social Network Frontend" width="100%" /></a><br/><sub><b>Consumer Web Experience:</b> 3-Column responsive layout, user profile `@vybeadmin`, trending discovery & navigation</sub><br/>🔗 <b><a href="https://vybe-app-ecru.vercel.app/">https://vybe-app-ecru.vercel.app/</a></b> | <a href="https://vybe-admin-eight.vercel.app/login"><img src="./docs/screenshots/vybe-admin-dashboard.png" alt="VYBE Master Admin Console" width="100%" /></a><br/><sub><b>Master Command Hub:</b> Live MongoDB Atlas telemetry, weekly growth velocity & staff moderation</sub><br/>🔗 <b><a href="https://vybe-admin-eight.vercel.app/login">https://vybe-admin-eight.vercel.app/login</a></b> |

<br/>

<div align="center">
  <p><strong>⚙️ <a href="https://vybe-backend-flax.vercel.app/">Backend REST API & Real-Time Engine (Live)</a></strong></p>
  <a href="https://vybe-backend-flax.vercel.app/">
    <img src="./docs/screenshots/vybe-backend-api.png" alt="VYBE Backend API Landing Page" width="85%" />
  </a>
  <p><sub>Interactive API documentation, Swagger OpenAPI 3 specs & live health diagnostics</sub></p>
  <p>🔗 <b><a href="https://vybe-backend-flax.vercel.app/">https://vybe-backend-flax.vercel.app/</a></b> • 📖 <b><a href="https://vybe-backend-flax.vercel.app/api-docs">Swagger UI Docs</a></b> • 🩺 <b><a href="https://vybe-backend-flax.vercel.app/api/health">Health Endpoint</a></b></p>
</div>

---

## Architecture & 3-Tier Decoupled Deployment

VYBE is architected as three independently maintainable, buildable, and deployable applications:

```
                                  ┌──────────────────────────────┐
                                  │      MongoDB Atlas Cluster   │
                                  │   (cluster0.lsat1p6.../db)   │
                                  └──────────────▲───────────────┘
                                                 │ Mongoose 9 ODM
                                                 │
┌───────────────────────────┐     REST / WS      │      REST / WS      ┌───────────────────────────┐
│     Consumer Frontend     ├────────────────────┼─────────────────────┤ Standalone Admin Console  │
│  React 19 + Vite 8 SPA    │                    │                     │   Vite 8 + Tailwind v4    │
│  (vybe-app-ecru.vercel)   │         ┌──────────┴──────────┐          │ (vybe-admin-eight.vercel) │
└───────────────────────────┘         │  Backend API Server │          └───────────────────────────┘
                                      │  Express 5 Server   │
                                      │(vybe-backend-flax...)
                                      └──────────┬──────────┘
                                                 │
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │    Cloudinary Media Engine   │
                                  │    & SMTP Email Transport    │
                                  └──────────────────────────────┘
```

1. **📱 Consumer Frontend App (`client/`)** — Live at [https://vybe-app-ecru.vercel.app/](https://vybe-app-ecru.vercel.app/). Full-featured consumer social web app featuring a modern 3-column layout, personalized feed, bookmarks, progressive 5-step registration stepper, and email verification states.
2. **🛡️ Standalone Admin Console (`admin/`)** — Live at [https://vybe-admin-eight.vercel.app/login](https://vybe-admin-eight.vercel.app/login). Isolated staff management station with real-time platform metrics, user moderation, post moderation, and comment cleanup.
3. **⚙️ Backend API Server (`server/`)** — Live at [https://vybe-backend-flax.vercel.app/](https://vybe-backend-flax.vercel.app/). Express 5 REST API, Nodemailer delivery engine, Cloudinary media CDN, and MongoDB Atlas ODM.

---

## Core Features & Authentication Suite

### 1. Robust Authentication & Verification
- **Canonical Lowercase Usernames:** Enforced via `/^[a-z0-9][a-z0-9_.]{1,18}[a-z0-9]$/`. Disallows consecutive periods (`..`), leading/trailing symbols, and rejects reserved system handles (`admin`, `support`, `api`, `login`, `signup`, `settings`, `moderator`, `help`, `security`, `root`, `vybe`, `system`).
- **Real Cryptographic Email Verification:** Generates 32-byte cryptographically secure random tokens. Stores only the SHA-256 hash in MongoDB Atlas with a 24-hour expiration policy. Consumes tokens atomically upon verification.
- **Login Gating:** Unverified accounts are strictly prevented from logging in, publishing posts, commenting, liking, following, or accessing protected endpoints (rejected with HTTP 403 `EMAIL_NOT_VERIFIED`).
- **Anti-Enumeration Email Resend:** Generic response policy preventing attackers from discovering existing user emails. Enforces client-side and server-side cooldown limits.
- **Password Strength & Matching:** Requires matching `confirmPassword` during registration and password reset (never stored in the database). Minimum 8 characters up to 64 characters with 15+ character security recommendations.
- **Single-Use Password Reset:** Secure 1-hour expiration reset tokens with automated confirmation email dispatch.
- **Dynamic Session Security:** Zero static hardcoded credentials. All protected endpoints strictly validate Bearer JWTs generated dynamically upon authenticated login.

### 2. Progressive Form & Field UX
- **Sequential Registration Stepper:** Fields unlock sequentially — users cannot skip ahead without properly filling previous fields.
- **Real-Time Input Validation:** Inline checks for username availability, email format, and password strength.
- **Accessible Design:** Full keyboard accessibility, contrast-compliant dark/light themes, and screen-reader polite notifications.

### 3. Social Networking Features
- **Personalized Timeline:** Infinite scroll cursor-paginated timeline containing posts from followed authors and self.
- **Explore & Discovery:** Trending posts and suggested profiles for both visitors and authenticated users.
- **Full Post & Comment CRUD:** Rich text, image uploads via Cloudinary, nested comments, and cascade deletions.
- **Interactive Social Graph:** Instant follow/unfollow toggle with optimistic updates, race-condition safe counters, and real-time Socket.io notifications.
- **Bookmarks & Saved Posts:** Private curation with dedicated `/saved` collection.

---

## Local Development Quick Start

### Prerequisites
- **Node.js** >= 20.x
- **MongoDB Atlas** database connection string (or local MongoDB)
- **Cloudinary** credentials (for image uploads)
- **Git**

### Installation

Clone the repository:
```bash
git clone https://github.com/karthikeyantoff/VYBE.git
cd VYBE
```

#### 1. Setup Backend Server
```bash
cd server
npm install
```
Create a `.env` file in `server/` (or use the configured values):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://karthikeyantoff_db_user:qil8g6DHV5oxGus6@cluster0.lsat1p6.mongodb.net/VYBE_db?retryWrites=true&w=majority
JWT_SECRET=vybe_jwt_secret_super_secure_key_2026_at_least_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
CLOUDINARY_CLOUD_NAME=cblqllb4
CLOUDINARY_API_KEY=395367419741642
CLOUDINARY_API_SECRET=1SG9xf-6HZKzVgQu3Im-nFKuFZ4
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="VYBE Platform <no-reply@vybe.dev>"
```
Seed the master admin user:
```bash
node seed/adminSeed.js
```
Start the backend server:
```bash
npm start
```
*API running at:* `http://localhost:5000`

#### 2. Setup Consumer Frontend
```bash
cd ../client
npm install
npm run dev
```
*Consumer App running at:* `http://localhost:5173`

#### 3. Setup Standalone Admin Panel
```bash
cd ../admin
npm install
npm run dev
```
*Admin Dashboard running at:* `http://localhost:5174`

---

## Deployment Guide (3 Independent Services on Vercel)

All 3 projects include native `vercel.json` configurations for seamless one-click zero-config deployment on **Vercel**.

### Target 1: Backend API (`server/` on Vercel)
- **Live URL:** [https://vybe-backend-flax.vercel.app/](https://vybe-backend-flax.vercel.app/)
- **Swagger Docs:** [https://vybe-backend-flax.vercel.app/api-docs](https://vybe-backend-flax.vercel.app/api-docs)
- **Root Directory:** `server`
- **Framework Preset:** `Other`
- **Environment Variables:**
  | Variable | Value | Description |
  |---|---|---|
  | `NODE_ENV` | `production` | Production mode |
  | `MONGO_URI` | `mongodb+srv://karthikeyantoff_db_user:qil8g6DHV5oxGus6@cluster0.lsat1p6.mongodb.net/VYBE_db?retryWrites=true&w=majority` | Live MongoDB Atlas Cluster |
  | `JWT_SECRET` | `vybe_jwt_secret_super_secure_key_2026_at_least_32_chars` | Session token signing key |
  | `JWT_EXPIRES_IN` | `7d` | Token expiration |
  | `CLIENT_URL` | `https://vybe-app-ecru.vercel.app` | Production Frontend Origin |
  | `ADMIN_URL` | `https://vybe-admin-eight.vercel.app` | Production Admin Origin |
  | `CLOUDINARY_CLOUD_NAME` | `cblqllb4` | Cloudinary Name |
  | `CLOUDINARY_API_KEY` | `395367419741642` | Cloudinary Key |
  | `CLOUDINARY_API_SECRET` | `1SG9xf-6HZKzVgQu3Im-nFKuFZ4` | Cloudinary Secret |
  | `ADMIN_EMAIL` | `admin@vybe.dev` | Master Admin Email |
  | `ADMIN_PASSWORD` | `VybeAdmin2026!` | Master Admin Password |

---

### Target 2: Consumer Frontend (`client/` on Vercel)
- **Live URL:** [https://vybe-app-ecru.vercel.app/](https://vybe-app-ecru.vercel.app/)
- **Root Directory:** `client`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  | Variable | Value |
  |---|---|
  | `VITE_API_URL` | `https://vybe-backend-flax.vercel.app/api` |

---

### Target 3: Standalone Admin Console (`admin/` on Vercel)
- **Live URL:** [https://vybe-admin-eight.vercel.app/login](https://vybe-admin-eight.vercel.app/login)
- **Root Directory:** `admin`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  | Variable | Value |
  |---|---|
  | `VITE_API_URL` | `https://vybe-backend-flax.vercel.app/api` |

---

## API Endpoints

### Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register new unverified account and dispatch verification token |
| `POST` | `/verify-email` | Public | Atomically verify email with SHA-256 token hash |
| `POST` | `/resend-verification`| Public | Request new verification token (rate-limited, anti-enumeration) |
| `POST` | `/login` | Public | Authenticate user, gate unverified accounts (`EMAIL_NOT_VERIFIED`), return JWT |
| `POST` | `/forgot-password` | Public | Send 1-hour single-use password reset link |
| `POST` | `/reset-password` | Public | Reset account password with token and confirmPassword |
| `GET` | `/me` | User | Get authenticated user profile |
| `PATCH`| `/change-password` | User | Update password with current password verification |
| `DELETE`| `/delete-account` | User | Delete user account and cascade clean dependencies |

### Posts — `/api/posts`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | User | Create post (text + optional image) |
| `GET` | `/:id` | Optional | Fetch single post with comments |
| `DELETE`| `/:id` | Owner/Admin | Cascade delete post, likes, comments, and media |
| `POST` | `/:id/like` | User | Idempotent like toggle |
| `POST` | `/:id/comments` | User | Add comment to post |

### Social Graph — `/api/users`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/:username` | Optional | Get user profile |
| `POST` | `/:id/follow` | User | Follow/unfollow toggle with real-time notification |
| `GET` | `/:id/followers` | Optional | List user followers |
| `GET` | `/:id/following` | Optional | List user following |

### Administration — `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/stats` | Admin | Real-time platform metrics and top users |
| `GET` | `/users` | Admin | Filterable, paginated user registry |
| `PATCH`| `/users/:id/role` | Admin | Promote / demote staff roles |
| `PATCH`| `/users/:id/active` | Admin | Suspend / reactivate user account |
| `DELETE`| `/users/:id` | Admin | Hard delete user with full cascade |
| `GET` | `/posts` | Admin | Moderation feed including hidden posts |
| `PATCH`| `/posts/:id/hide` | Admin | Hide / unhide flag |

---

## Automated Testing & Verification

VYBE includes an automated end-to-end integration test suite executed against live MongoDB Atlas:

```bash
cd server
npm test
```

### Verified Test Suite (12/12 Passing)
- ✔ **1. System Health Check:** Returns status 200 and `{ status: "ok" }`.
- ✔ **2. Username Validation:** Rejects bad formats, consecutive dots (`..`), leading/trailing symbols, and reserved handles.
- ✔ **3. Registration:** Creates unverified account, hashes token, dispatches verification email.
- ✔ **4. Login Gating:** Unverified account login is strictly rejected with HTTP 403 `EMAIL_NOT_VERIFIED`.
- ✔ **5. Email Verification:** Validates token, consumes atomically, enables login, marks account verified.
- ✔ **6. Resend Verification:** Handles requests with rate limiting and anti-enumeration.
- ✔ **7. Password Reset:** Single-use token reset updates credentials and invalidates previous credentials.
- ✔ **8. Authenticated Endpoints:** Dynamic Bearer JWT validation and profile retrieval.
- ✔ **9. Content Creation:** Post creation, image processing, like toggle, and comment creation.
- ✔ **10. Social Graph:** Follow/unfollow updates counters and dispatches Socket.io notification.
- ✔ **11. Role-Based Access Control:** Rejects regular users from `/api/admin/*` and admits verified admins.
- ✔ **12. Cascade Deletion:** Post deletion cleanly cascades to comments, likes, and saved posts.

---

## Author & Credits

**Karthikeyan T**  
*Forward Deployed Engineer*
- 💻 GitHub: [@karthikeyantoff](https://github.com/karthikeyantoff)
- 🚀 Repository: [https://github.com/karthikeyantoff/VYBE](https://github.com/karthikeyantoff/VYBE)
- 🌐 Live Consumer App: [https://vybe-app-ecru.vercel.app/](https://vybe-app-ecru.vercel.app/)
- 🛡️ Live Admin Console: [https://vybe-admin-eight.vercel.app/login](https://vybe-admin-eight.vercel.app/login)
- ⚙️ Live Backend API: [https://vybe-backend-flax.vercel.app/](https://vybe-backend-flax.vercel.app/)

---

## License

This project is licensed under the [MIT License](LICENSE).
