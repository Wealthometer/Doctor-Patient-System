# HealthCare+ Frontend

React + TypeScript frontend for the Doctor-Patient Management System capstone project.

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Routing | React Router v6 |
| HTTP Client | Axios (with JWT interceptor) |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Bundler | Vite |
| Serving | Nginx (Docker) |

---

## Project Structure

```
src/
├── api/
│   ├── client.ts          # Axios instance + auth interceptors
│   └── services.ts        # All API call functions (one per microservice)
├── components/
│   ├── Layout.tsx          # Shell with topbar
│   ├── Sidebar.tsx         # Role-aware navigation
│   ├── ProtectedRoute.tsx  # Role-based route guard
│   └── UI.tsx              # Reusable: Badge, Modal, StatCard, Pagination...
├── context/
│   └── AuthContext.tsx     # Login, logout, user state
├── pages/
│   ├── auth/              Login, Register
│   ├── patient/           Dashboard, Appointments, Prescriptions, Billing,
│   │                      FindDoctors, Profile
│   ├── doctor/            Dashboard, Appointments, Patients, Prescriptions, Profile
│   └── admin/             Dashboard, Patients, Doctors, Appointments, Billing, Users
├── types/
│   └── index.ts           # TypeScript types matching backend DTOs
├── App.tsx                 # Route definitions
└── main.tsx                # Entry point
```

---

## API Endpoints Consumed

### Auth Service  `/api/v1/auth`
| Method | Endpoint | Page |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Register, AdminUsers, AdminDoctors |
| GET | `/auth/me` | AuthContext bootstrap |
| POST | `/auth/logout` | Sidebar |
| PUT | `/auth/change-password` | Patient & Doctor Profile |

### Patient Service  `/api/v1/patients`
| Method | Endpoint | Page |
|---|---|---|
| POST | `/patients` | PatientProfile (create) |
| GET | `/patients/{id}` | DoctorPatients (detail) |
| GET | `/patients/user/{userId}` | PatientDashboard, Appointments, Billing, Prescriptions |
| GET | `/patients` | AdminPatients |
| GET | `/patients/search?query=` | AdminPatients, DoctorPrescriptions (patient search) |
| PUT | `/patients/{id}` | PatientProfile (edit) |
| PATCH | `/patients/{id}/deactivate` | AdminPatients |
| GET | `/patients/stats` | AdminDashboard |

### Doctor Service  `/api/v1/doctors`
| Method | Endpoint | Page |
|---|---|---|
| POST | `/doctors` | AdminDoctors |
| GET | `/doctors/{id}` | (detail lookup) |
| GET | `/doctors/user/{userId}` | DoctorDashboard, DoctorAppointments, DoctorProfile, DoctorPrescriptions |
| GET | `/doctors` | PatientAppointments (book), FindDoctors |
| GET | `/doctors/search?query=` | AdminDoctors |
| GET | `/doctors/department/{dept}/active` | FindDoctors filter |
| PUT | `/doctors/{id}` | DoctorProfile (edit), AdminDoctors |
| PATCH | `/doctors/{id}/status` | AdminDoctors |
| POST | `/doctors/{id}/ratings` | FindDoctors (rate doctor) |
| GET | `/doctors/stats` | AdminDashboard |

### Appointment Service  `/api/v1/appointments`
| Method | Endpoint | Page |
|---|---|---|
| POST | `/appointments` | PatientAppointments (book) |
| GET | `/appointments/{id}` | (detail) |
| GET | `/appointments/patient/{id}` | PatientAppointments, PatientDashboard, DoctorPatients |
| GET | `/appointments/doctor/{id}` | DoctorAppointments, DoctorDashboard, DoctorPatients |
| GET | `/appointments/doctor/{id}/slots?date=` | PatientAppointments (slot picker) |
| PATCH | `/appointments/{id}/confirm` | DoctorAppointments, AdminAppointments |
| PATCH | `/appointments/{id}/start` | DoctorAppointments |
| PATCH | `/appointments/{id}/complete` | DoctorAppointments |
| PATCH | `/appointments/{id}/cancel` | PatientAppointments, DoctorAppointments, AdminAppointments |
| GET | `/appointments/stats` | AdminDashboard |

### Prescription Service  `/api/v1/prescriptions`
| Method | Endpoint | Page |
|---|---|---|
| POST | `/prescriptions` | DoctorPrescriptions (create) |
| GET | `/prescriptions/{id}` | (detail) |
| GET | `/prescriptions/patient/{id}` | PatientPrescriptions, DoctorPatients |
| GET | `/prescriptions/patient/{id}/active` | PatientDashboard, PatientPrescriptions |
| GET | `/prescriptions/doctor/{id}` | DoctorPrescriptions |
| PATCH | `/prescriptions/{id}/cancel` | DoctorPrescriptions |

### Billing Service  `/api/v1/billing`
| Method | Endpoint | Page |
|---|---|---|
| GET | `/billing/invoices/patient/{id}` | PatientBilling, PatientDashboard |
| GET | `/billing/invoices` | AdminBilling |
| GET | `/billing/invoices/{id}` | (detail) |
| POST | `/billing/invoices/{id}/payments` | PatientBilling (pay now), AdminBilling |
| PATCH | `/billing/invoices/{id}/cancel` | AdminBilling |
| GET | `/billing/stats` | AdminDashboard, AdminBilling |

---

## Running Locally

### Prerequisites
- Node.js 20+
- Backend microservices running (see backend README)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_URL if your gateway runs on a different port

# 3. Start dev server
npm run dev
# Opens at http://localhost:3000
```

### Default Admin Credentials
```
Username: admin
Password: Admin@123
```

---

## Running with Docker

```bash
# Build the image
docker build -t healthcare-frontend .

# Run standalone (API on host machine)
docker run -p 80:80 \
  -e VITE_API_URL=http://localhost:8080/api/v1 \
  healthcare-frontend
```

### With Docker Compose (full stack)

Add this to your root `docker-compose.yml`:

```yaml
frontend:
  build: ./frontend-react
  ports:
    - "3000:80"
  depends_on:
    - api-gateway
  networks:
    - healthcare-network
```

---

## Role-Based Navigation

| Role | Home | Pages |
|---|---|---|
| PATIENT | `/patient` | Dashboard, Appointments, Prescriptions, Billing, Find Doctors, Profile |
| DOCTOR / NURSE | `/doctor` | Dashboard, Appointments, My Patients, Prescriptions, Profile |
| ADMIN | `/admin` | Dashboard, Patients, Doctors, Appointments, Billing, Users |

Unauthenticated users are redirected to `/login`. Wrong-role access redirects to the appropriate dashboard.

---

## Key Features by Role

### Patient
- Complete onboarding (create patient profile on first login)
- Book appointments with available time slot picker
- View and cancel appointments
- View active and past prescriptions with medication detail
- Pay invoices with multiple payment methods
- Browse and rate doctors by specialization / department
- Edit personal & medical profile; change password

### Doctor
- Live dashboard with today's schedule
- Appointment lifecycle: Confirm → Start → Complete (with diagnosis) → or Cancel
- Browse patient records with tabbed view (info / appointments / prescriptions)
- Create multi-medication prescriptions with patient search
- Edit professional profile (work hours, fee, bio, qualifications)

### Admin
- System-wide KPI dashboard with charts
- Full patient management with health alert display
- Doctor management: create accounts + profiles, update status
- Invoice management with payment recording
- User creation with role selection

---

## Database Schema

See `database-schema.sql` for the complete PostgreSQL schema covering all 6 microservice schemas:

- `auth_service` — users, refresh_tokens
- `patient_service` — patients
- `doctor_service` — doctors, doctor_ratings
- `appointment_service` — appointments (unique constraint prevents double-booking)
- `prescription_service` — prescriptions, medications
- `billing_service` — invoices, invoice_items, payments (with computed remaining_amount column)

Includes indexes, views, triggers, and a seed admin user.
