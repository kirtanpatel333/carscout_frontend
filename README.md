# CarScout

A full-stack used car marketplace where sellers list cars, buyers browse and inquire, and both parties can book test drives, exchange messages, and receive real-time in-app notifications.

---

## 🗂️ Project Structure

```
carscout/
├── carscout_backend/   → Node.js + Express REST API (Port 4444)
├── carscout_frontend/  → React 18 + Vite SPA (Port 5173)
└── PROJECT_EXPLANATION.md
```

---

## ✅ Features

- **Authentication** — Register, Login, JWT-based auth (buyer / seller / admin roles)
- **Car Listings** — Full CRUD with field validation (year, price, fuel type, transmission)
- **Inquiries** — Buyers submit inquiries on car listings
- **Reviews** — Buyers rate and review cars (1–5 stars)
- **Test Drives** — Schedule test drives with automatic 24-hour reminder notifications
- **Notifications** — In-app notifications with read/unread state and pagination
- **Direct Messaging** — Buyer-to-seller messaging
- **Admin Dashboard** — Platform-wide stats and moderation tools
- **Enterprise Error Handling** — Typed error classes, centralized handler, structured JSON responses
- **Frontend Error Sync** — Automatic error toasts via centralized Axios instance

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend
```bash
cd carscout_backend
npm install

# Create .env
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, PORT=4444

npm start
# Server starts on http://localhost:4444
```

### Frontend
```bash
cd carscout_frontend
npm install

# Create .env
echo "VITE_API_URL=http://localhost:4444" > .env

npm run dev
# App starts on http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`carscout_backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: `4444`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `NODE_ENV` | `development` / `production` |
| `MAIL_USER` | SMTP email address (for welcome emails) |
| `MAIL_PASS` | SMTP password |

### Frontend (`carscout_frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (default: `http://localhost:4444`) |

---

## 🛣️ API Routes

| Prefix | Resource | Auth |
|---|---|---|
| `POST /user/register` | Register a new user | Public |
| `POST /user/login` | Login | Public |
| `GET /user/all` | List all users | Protected |
| `GET /car/all` | List all car listings | Public |
| `POST /car/add` | Create a listing | Protected |
| `GET /car/:id` | Get single listing | Public |
| `PUT /car/:id` | Update listing | Protected |
| `DELETE /car/:id` | Delete listing | Protected |
| `POST /inquiry/add` | Submit inquiry | Protected |
| `POST /reviews/add` | Submit review | Protected |
| `POST /testdrive/add` | Book test drive | Protected |
| `GET /notification/my` | Get my notifications | Protected |
| `PUT /notification/:id/read` | Mark as read | Protected |
| `GET /admin/dashboard` | Admin stats | Protected |

---

## ⚙️ Architecture

### Error Handling
All backend errors flow through a centralized pipeline:

```
Controller throws typed error
  → asyncHandler catches it → passes to next(err)
    → globalErrorHandler formats response:

{ "success": false, "error": { "code": "...", "message": "...", "errors": [] } }
```

**Error classes** (from `src/logging/adapter.js`):

| Class | HTTP | When to use |
|---|---|---|
| `ValidationError` | 400 | Missing or invalid input fields |
| `AuthenticationError` | 401 | Missing, expired, or invalid token |
| `AuthorizationError` | 403 | Insufficient role/permission |
| `NotFoundError` | 404 | Resource or route not found |
| `ConflictError` | 409 | Duplicate resource (e.g., email exists) |
| `BusinessError` | 422 | Business rule violation |
| `RateLimitError` | 429 | Too many requests |
| `SystemError` | 500 | Unhandled server-side error |

### Frontend Error Sync (`src/utils/axios.js`)
- All API calls go through `apiClient` (centralized Axios instance)
- JWT auto-attached on every request
- Structured backend error extracted and shown as a `react-toastify` toast
- 401 → session cleared → redirect to `/login`

> **Important:** Add `<ToastContainer />` to `App.jsx` and import `react-toastify/dist/ReactToastify.css` to activate error toasts.

---

## 🧱 Tech Stack

### Backend
| Library | Purpose |
|---|---|
| `express` | HTTP framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT generation & verification |
| `bcrypt` | Password hashing |
| `nodemailer` | Transactional email |
| `multer` | File upload handling |
| `cors`, `dotenv` | CORS + environment config |

### Frontend
| Library | Purpose |
|---|---|
| `react` + `vite` | UI framework + build tool |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client |
| `react-toastify` | Toast notifications |
| `@mui/material` | UI component library |
| `tailwindcss` | Utility-first CSS |
| `framer-motion` | Animations |
| `recharts` | Data visualization |
| `react-hook-form` | Form state management |

---

## 📋 Remaining Work

| Feature | Priority |
|---|---|
| `<ToastContainer />` in App.jsx | 🔴 Required for toasts |
| Migrate all remaining axios calls to `apiClient` | 🔴 High |
| Admin role guard middleware | 🔴 High |
| Car image uploads (extend `CarModel` + upload route) | 🔴 High |
| Car search & filtering (`GET /car/all?brand=&city=`) | 🟡 Medium |
| JWT expiry + refresh token flow | 🟡 Medium |
| Seller dashboard (own listings + stats) | 🟡 Medium |
| Pagination on cars, reviews, inquiries | 🟡 Medium |
| Email verification flow | 🟠 Low |
| Test drive cancellation by user | 🟠 Low |

---

## 📄 License

ISC
