-- ============================================================
--  HealthCare+ Doctor-Patient Management System
--  Complete PostgreSQL Database Schema
--  Each microservice owns its schema (logical separation)
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- fast trigram text search

-- ============================================================
--  SCHEMA: auth_service
-- ============================================================
CREATE SCHEMA IF NOT EXISTS auth_service;

CREATE TABLE auth_service.users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN','DOCTOR','PATIENT','NURSE')),
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_service.refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID         NOT NULL REFERENCES auth_service.users(id) ON DELETE CASCADE,
    token       TEXT         NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON auth_service.users(email);
CREATE INDEX idx_users_username ON auth_service.users(username);
CREATE INDEX idx_users_role     ON auth_service.users(role);
CREATE INDEX idx_refresh_token  ON auth_service.refresh_tokens(token);

-- ============================================================
--  SCHEMA: patient_service
-- ============================================================
CREATE SCHEMA IF NOT EXISTS patient_service;

CREATE TABLE patient_service.patients (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     UUID         NOT NULL UNIQUE,  -- FK to auth_service.users (cross-service, enforced app-side)
    patient_code                VARCHAR(20)  NOT NULL UNIQUE,  -- e.g. PAT-000001
    first_name                  VARCHAR(100) NOT NULL,
    last_name                   VARCHAR(100) NOT NULL,
    email                       VARCHAR(255) NOT NULL,
    phone                       VARCHAR(30),
    date_of_birth               DATE         NOT NULL,
    gender                      VARCHAR(30)  NOT NULL CHECK (gender IN ('MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY')),
    -- Address
    address                     VARCHAR(255),
    city                        VARCHAR(100),
    state                       VARCHAR(100),
    zip_code                    VARCHAR(20),
    country                     VARCHAR(100) NOT NULL DEFAULT 'US',
    -- Emergency contact
    emergency_contact_name      VARCHAR(200),
    emergency_contact_phone     VARCHAR(30),
    emergency_contact_relation  VARCHAR(100),
    -- Medical info
    allergies                   TEXT,
    chronic_conditions          TEXT,
    blood_type                  VARCHAR(10)  CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    medical_notes               TEXT,
    -- Insurance
    insurance_provider          VARCHAR(200) NOT NULL,
    insurance_policy_number     VARCHAR(100),
    -- Status
    status                      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                                    CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
    profile_image_url           VARCHAR(500),
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_user_id     ON patient_service.patients(user_id);
CREATE INDEX idx_patient_code        ON patient_service.patients(patient_code);
CREATE INDEX idx_patient_email       ON patient_service.patients(email);
CREATE INDEX idx_patient_status      ON patient_service.patients(status);
-- Trigram index for fast full-text search
CREATE INDEX idx_patient_search      ON patient_service.patients
    USING gin ((first_name || ' ' || last_name || ' ' || email || ' ' || patient_code) gin_trgm_ops);

-- ============================================================
--  SCHEMA: doctor_service
-- ============================================================
CREATE SCHEMA IF NOT EXISTS doctor_service;

CREATE TABLE doctor_service.doctors (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID         NOT NULL UNIQUE,
    doctor_code             VARCHAR(20)  NOT NULL UNIQUE,  -- e.g. DOC-000001
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    phone                   VARCHAR(30),
    specialization          VARCHAR(200) NOT NULL,
    department              VARCHAR(200) NOT NULL,
    license_number          VARCHAR(100) NOT NULL UNIQUE,
    license_expiry_date     DATE,
    bio                     TEXT,
    qualifications          TEXT,
    years_of_experience     SMALLINT     CHECK (years_of_experience >= 0),
    consultation_fee        NUMERIC(10,2),
    work_start_time         TIME,
    work_end_time           TIME,
    work_days               VARCHAR(100),  -- e.g. "Monday,Tuesday,Wednesday,Thursday,Friday"
    max_daily_appointments  SMALLINT DEFAULT 20,
    profile_image_url       VARCHAR(500),
    average_rating          NUMERIC(3,2)  CHECK (average_rating BETWEEN 0 AND 5),
    total_ratings           INTEGER  NOT NULL DEFAULT 0,
    status                  VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE'
                                CHECK (status IN ('ACTIVE','INACTIVE','ON_LEAVE')),
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE doctor_service.doctor_ratings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id   UUID        NOT NULL REFERENCES doctor_service.doctors(id) ON DELETE CASCADE,
    patient_id  UUID        NOT NULL,  -- cross-service ref
    rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (doctor_id, patient_id)  -- one rating per patient per doctor
);

CREATE INDEX idx_doctor_user_id        ON doctor_service.doctors(user_id);
CREATE INDEX idx_doctor_code           ON doctor_service.doctors(doctor_code);
CREATE INDEX idx_doctor_specialization ON doctor_service.doctors(specialization);
CREATE INDEX idx_doctor_department     ON doctor_service.doctors(department);
CREATE INDEX idx_doctor_status         ON doctor_service.doctors(status);
CREATE INDEX idx_doctor_search         ON doctor_service.doctors
    USING gin ((first_name || ' ' || last_name || ' ' || specialization || ' ' || department) gin_trgm_ops);
CREATE INDEX idx_doctor_ratings_doctor ON doctor_service.doctor_ratings(doctor_id);

-- ============================================================
--  SCHEMA: appointment_service
-- ============================================================
CREATE SCHEMA IF NOT EXISTS appointment_service;

CREATE TABLE appointment_service.appointments (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id           UUID         NOT NULL,  -- cross-service ref
    doctor_id            UUID         NOT NULL,  -- cross-service ref
    appointment_date     DATE         NOT NULL,
    start_time           TIME         NOT NULL,
    end_time             TIME         NOT NULL,
    type                 VARCHAR(50)  NOT NULL
                             CHECK (type IN ('CONSULTATION','FOLLOW_UP','ROUTINE_CHECKUP',
                                             'EMERGENCY','TELEMEDICINE','PROCEDURE','LAB_REVIEW')),
    status               VARCHAR(30)  NOT NULL DEFAULT 'SCHEDULED'
                             CHECK (status IN ('SCHEDULED','CONFIRMED','IN_PROGRESS',
                                               'COMPLETED','CANCELLED','NO_SHOW','RESCHEDULED')),
    reason               TEXT         NOT NULL,
    notes                TEXT,
    diagnosis_summary    TEXT,
    cancellation_reason  TEXT,
    -- Denormalized for display performance (populated by appointment-service via Feign)
    patient_name         VARCHAR(200),
    doctor_name          VARCHAR(200),
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    -- Prevent double-booking: one appointment per doctor slot
    CONSTRAINT no_double_book UNIQUE (doctor_id, appointment_date, start_time)
);

CREATE INDEX idx_appt_patient_id   ON appointment_service.appointments(patient_id);
CREATE INDEX idx_appt_doctor_id    ON appointment_service.appointments(doctor_id);
CREATE INDEX idx_appt_date         ON appointment_service.appointments(appointment_date);
CREATE INDEX idx_appt_status       ON appointment_service.appointments(status);
CREATE INDEX idx_appt_doctor_date  ON appointment_service.appointments(doctor_id, appointment_date);
CREATE INDEX idx_appt_patient_date ON appointment_service.appointments(patient_id, appointment_date);

-- ============================================================
--  SCHEMA: prescription_service
-- ============================================================
CREATE SCHEMA IF NOT EXISTS prescription_service;

CREATE TABLE prescription_service.prescriptions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id       UUID         NOT NULL,
    doctor_id        UUID         NOT NULL,
    appointment_id   UUID,  -- optional link to appointment
    patient_name     VARCHAR(200) NOT NULL,
    doctor_name      VARCHAR(200) NOT NULL,
    diagnosis        TEXT         NOT NULL,
    notes            TEXT,
    issue_date       DATE         NOT NULL DEFAULT CURRENT_DATE,
    expiry_date      DATE,
    status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                         CHECK (status IN ('ACTIVE','COMPLETED','CANCELLED')),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE prescription_service.medications (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id   UUID         NOT NULL REFERENCES prescription_service.prescriptions(id) ON DELETE CASCADE,
    name              VARCHAR(200) NOT NULL,
    dosage            VARCHAR(100) NOT NULL,
    frequency         VARCHAR(100) NOT NULL,
    duration          VARCHAR(100) NOT NULL,
    instructions      TEXT,
    sort_order        SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX idx_rx_patient_id    ON prescription_service.prescriptions(patient_id);
CREATE INDEX idx_rx_doctor_id     ON prescription_service.prescriptions(doctor_id);
CREATE INDEX idx_rx_status        ON prescription_service.prescriptions(status);
CREATE INDEX idx_rx_issue_date    ON prescription_service.prescriptions(issue_date);
CREATE INDEX idx_rx_appt_id       ON prescription_service.prescriptions(appointment_id);
CREATE INDEX idx_med_rx_id        ON prescription_service.medications(prescription_id);

-- ============================================================
--  SCHEMA: notification_service
-- ============================================================
CREATE SCHEMA IF NOT EXISTS notification_service;

CREATE TABLE notification_service.notifications (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID         NOT NULL,
    type         VARCHAR(50)  NOT NULL
                     CHECK (type IN ('EMAIL','SMS','PUSH','IN_APP')),
    event        VARCHAR(100) NOT NULL,  -- e.g. APPOINTMENT_CONFIRMED, PRESCRIPTION_ISSUED
    title        VARCHAR(255) NOT NULL,
    message      TEXT         NOT NULL,
    reference_id UUID,        -- e.g. appointment id
    read         BOOLEAN      NOT NULL DEFAULT FALSE,
    sent         BOOLEAN      NOT NULL DEFAULT FALSE,
    sent_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user_id   ON notification_service.notifications(user_id);
CREATE INDEX idx_notif_read      ON notification_service.notifications(user_id, read);
CREATE INDEX idx_notif_type      ON notification_service.notifications(type);
CREATE INDEX idx_notif_created   ON notification_service.notifications(created_at DESC);

-- ============================================================
--  SCHEMA: billing_service
-- ============================================================
CREATE SCHEMA IF NOT EXISTS billing_service;

CREATE TABLE billing_service.invoices (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number   VARCHAR(30)    NOT NULL UNIQUE,  -- e.g. INV-2024-000001
    patient_id       UUID           NOT NULL,
    patient_name     VARCHAR(200),
    appointment_id   UUID,
    subtotal         NUMERIC(12,2)  NOT NULL DEFAULT 0,
    tax              NUMERIC(12,2)  NOT NULL DEFAULT 0,
    discount         NUMERIC(12,2)  NOT NULL DEFAULT 0,
    total_amount     NUMERIC(12,2)  NOT NULL DEFAULT 0,
    paid_amount      NUMERIC(12,2)  NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status           VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING','PAID','PARTIAL','OVERDUE','CANCELLED')),
    invoice_date     DATE           NOT NULL DEFAULT CURRENT_DATE,
    due_date         DATE,
    notes            TEXT,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE billing_service.invoice_items (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id   UUID           NOT NULL REFERENCES billing_service.invoices(id) ON DELETE CASCADE,
    description  VARCHAR(300)   NOT NULL,
    quantity     SMALLINT       NOT NULL DEFAULT 1,
    unit_price   NUMERIC(10,2)  NOT NULL,
    total_price  NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sort_order   SMALLINT       NOT NULL DEFAULT 0
);

CREATE TABLE billing_service.payments (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id       UUID           NOT NULL REFERENCES billing_service.invoices(id),
    amount           NUMERIC(12,2)  NOT NULL CHECK (amount > 0),
    payment_method   VARCHAR(50)    NOT NULL
                         CHECK (payment_method IN ('CASH','CREDIT_CARD','DEBIT_CARD','INSURANCE','BANK_TRANSFER')),
    reference_number VARCHAR(100),
    notes            TEXT,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_patient_id  ON billing_service.invoices(patient_id);
CREATE INDEX idx_invoice_status      ON billing_service.invoices(status);
CREATE INDEX idx_invoice_date        ON billing_service.invoices(invoice_date DESC);
CREATE INDEX idx_invoice_appt_id     ON billing_service.invoices(appointment_id);
CREATE INDEX idx_invoice_items       ON billing_service.invoice_items(invoice_id);
CREATE INDEX idx_payments_invoice_id ON billing_service.payments(invoice_id);

-- ============================================================
--  Auto-update updated_at trigger (reusable)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema IN ('auth_service','patient_service','doctor_service',
                           'appointment_service','prescription_service','billing_service')
  LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I.%I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      t.table_name, t.table_schema, t.table_name
    );
  END LOOP;
END;
$$;

-- ============================================================
--  Seed: default admin user  (password: Admin@123)
--  BCrypt hash of "Admin@123"
-- ============================================================
INSERT INTO auth_service.users (username, email, password_hash, first_name, last_name, role)
VALUES (
    'admin',
    'admin@healthcare.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6o4xIvS.vu',
    'System',
    'Admin',
    'ADMIN'
) ON CONFLICT DO NOTHING;

-- ============================================================
--  Useful views
-- ============================================================

-- Active doctors summary (used by patient "Find Doctors" page)
CREATE OR REPLACE VIEW doctor_service.active_doctors_view AS
SELECT
    d.id, d.doctor_code, d.first_name, d.last_name, d.email, d.phone,
    d.specialization, d.department, d.years_of_experience,
    d.consultation_fee, d.work_start_time, d.work_end_time,
    d.work_days, d.max_daily_appointments,
    d.average_rating, d.total_ratings, d.bio, d.qualifications
FROM doctor_service.doctors d
WHERE d.status = 'ACTIVE';

-- Today's appointments per doctor (useful for dashboard widget)
CREATE OR REPLACE VIEW appointment_service.today_appointments_view AS
SELECT
    a.*,
    EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60 AS duration_minutes
FROM appointment_service.appointments a
WHERE a.appointment_date = CURRENT_DATE
  AND a.status NOT IN ('CANCELLED', 'NO_SHOW');

-- Invoice summary with payment totals
CREATE OR REPLACE VIEW billing_service.invoice_summary_view AS
SELECT
    i.*,
    COALESCE(p.total_paid, 0)          AS total_paid_from_payments,
    COUNT(p.id)                         AS payment_count
FROM billing_service.invoices i
LEFT JOIN (
    SELECT invoice_id, SUM(amount) AS total_paid, COUNT(id) AS id
    FROM billing_service.payments
    GROUP BY invoice_id
) p ON p.invoice_id = i.id
GROUP BY i.id, p.total_paid;
