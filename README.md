# HealthPulse - Smart Healthcare Analytics System

A full-stack personal health management and analytics platform built as a Final Year Computer Engineering project.

## Tech Stack

**Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, Recharts, Chart.js, jsPDF

**Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs, Nodemailer, Swagger UI

**Testing:** Jest, Supertest

**ML Service:** Python FastAPI, scikit-learn (diabetes risk prediction)

## Features

- Interactive Charts (Line, Area, Bar, Radar, Doughnut)
- Health Score Meter & BMI Gauge
- Calendar Heatmap with Streak System
- Achievement Badges
- Weekly & Monthly Health Reports (PDF export)
- Daily Health Planner with task CRUD
- Progress Tracking with real heatmap data
- Health Records management with pagination
- Risk Assessment (ML-powered diabetes prediction)
- Data-driven Recommendations
- Profile management with photo upload
- Threshold-based Health Alerts screened against clinical reference ranges
- Clinical normal-range bands on all analytics charts
- Data export (CSV + full-account JSON) and account deletion
- Change password from Settings; account preferences stored server-side
- Secure JWT authentication with email-delivered password reset
- Interactive Swagger API documentation at /api/docs
- Rate limiting & input validation
- Automated Jest + Supertest test suite (149 tests)

## Setup

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- Python 3.10+ (for ML service)

### Backend

```bash
cd backend
cp .env.example .env    # configure MONGO_URI, JWT_SECRET
npm install
npm run seed             # seed demo data (4 users, 93 records, 200+ tasks)
npm start                # runs on port 5001
npm test                 # run the Jest + Supertest suite
npm run test:coverage    # the same suite with a coverage report
```

API documentation is served at <http://localhost:5001/api/docs> once the
backend is running, and the raw OpenAPI 3.0 document at `/api/docs.json`.

The test suite creates and drops its own `healthpulse_test_*` database, so it
never touches development data. It needs a MongoDB server on
`mongodb://127.0.0.1:27017` (override with `MONGO_URI_TEST`).

### ML Service (Optional)

```bash
cd ml
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
npm install
npm run dev              # runs on port 5173
```

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| rahul.sharma@email.com | Password123! | user |
| priya.patel@email.com | Password123! | user |
| anjali.shah@email.com | Password123! | user |
| admin@healthpulse.com | Admin123! | admin |

## Environment Variables

### backend/.env

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/smart_healthcare
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000
```

### Root (.env)

```
VITE_API_URL=http://localhost:5001/api
```

## Project Structure

```
medical_project/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── middleware/        # Auth, rate limiting, validation, upload
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── services/         # ML service integration
│   ├── uploads/          # User-uploaded files (avatars)
│   ├── config/db.js      # MongoDB connection
│   ├── docs/openapi.js   # OpenAPI 3.0 specification
│   ├── tests/            # Jest + Supertest suites
│   ├── utils/            # Shared helpers (local-calendar date keys)
│   ├── seed.js           # Database seeder
│   ├── app.js            # Express app (no listener, used by tests)
│   └── server.js         # Entry point: connects DB and listens
├── ml/                   # Python FastAPI ML service
├── src/
│   ├── components/       # Reusable React components
│   ├── context/          # Auth context provider
│   ├── data/             # Static data (landing, dashboard)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components (auth, dashboard, landing)
│   └── services/         # API client (api.js)
├── vite.config.js
└── package.json
```

## License

This project is for educational purposes.
