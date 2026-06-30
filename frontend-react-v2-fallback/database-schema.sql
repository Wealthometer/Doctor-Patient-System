-- =============================================================================
-- HealthCare Management System — Complete PostgreSQL Schema
-- Covers: auth, patient, doctor, appointment, prescription, billing services
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- AUTH SERVICE DATABASE
-- =============================================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50)  UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN','DOCTOR','PATIENT','NURSE')),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_locked       BOOLEAN      NOT NULL DEFAULT FALSE,
    email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMP   NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_refresh_user   ON refresh_tokens(user_id);

-- =============================================================================
-- PATIENT SERVICE DATABASE
-- =============================================================================

CREATE TABLE patients (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     UUID        NOT NULL UNIQUE,   -- FK to auth.users
    patient_code                VARCHAR(20) NOT NULL UNIQUE,   -- e.g. PAT-000001
    first_name                  VARCHAR(100) NOT NULL,
    last_name                   VARCHAR(100) NOT NULL,
    email                       VARCHAR(255) NOT NULL,
    phone                       VARCHAR(20)  NOT NULL,
    date_of_birth               DATE         NOT NULL,
    gender                      VARCHAR(10)  NOT NULL CHECK (gender IN ('MALE','FEMALE','OTHER')),

    -- Address
    address                     VARCHAR(255),
    city                        VARCHAR(100),
    state                       VARCHAR(100),
    zip_code                    VARCHAR(20),
    country                     VARCHAR(100) DEFAULT 'US',

    -- Emergency contact
    emergency_contact_name      VARCHAR(100),
    emergency_contact_phone     VARCHAR(20),
    emergency_contact_relation  VARCHAR(50),

    -- Medical info
    allergies                   TEXT,
    chronic_conditions          TEXT,
    blood_type                  VARCHAR(5),
    medical_notes               TEXT,

    -- Insurance
    insurance_provider          VARCHAR(100) NOT NULL,
    insurance_policy_number     VARCHAR(50),

    -- Status
    status                      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                                    CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),

    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_patients_user_id      ON patients(user_id);
CREATE INDEX idx_patients_code         ON patients(patient_code);
CREATE INDEX idx_patients_status       ON patients(status);
CREATE INDEX idx_patients_email        ON patients(email);
CREATE INDEX idx_patients_name         ON patients(last_name, first_name);

-- =============================================================================
-- DOCTOR SERVICE DATABASE
-- =============================================================================

CREATE TABLE doctors (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID         NOT NULL UNIQUE,
    doctor_code             VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. DOC-000001
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    phone                   VARCHAR(20)  NOT NULL,

    -- Professional
    specialization          VARCHAR(100) NOT NULL,
    department              VARCHAR(100) NOT NULL,
    license_number          VARCHAR(50)  NOT NULL UNIQUE,
    license_expiry_date     DATE,
    bio                     TEXT,
    qualifications          TEXT,
    years_of_experience     INTEGER      DEFAULT 0,
    consultation_fee        NUMERIC(10,2),
    profile_image_url       TEXT,

    -- Schedule
    work_start_time         TIME,
    work_end_time           TIME,
    work_days               VARCHAR(100),           -- e.g. 'Mon,Tue,Wed,Thu,Fri'
    max_daily_appointments  INTEGER DEFAULT 20,

    -- Rating (denormalised for performance)
    average_rating          NUMERIC(3,2) DEFAULT 0.0,
    total_ratings           INTEGER      DEFAULT 0,

    status                  VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                                CHECK (status IN ('ACTIVE','INACTIVE','ON_LEAVE','SUSPENDED')),

    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE doctor_ratings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id   UUID        NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id  UUID        NOT NULL,   -- FK to patient service
    rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (doctor_id, patient_id)     -- one rating per patient per doctor
);

-- Indexes
CREATE INDEX idx_doctors_user_id        ON doctors(user_id);
CREATE INDEX idx_doctors_code           ON doctors(doctor_code);
CREATE INDEX idx_doctors_department     ON doctors(department);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_status         ON doctors(status);
CREATE INDEX idx_doctor_ratings_doctor  ON doctor_ratings(doctor_id);

-- =============================================================================
-- APPOINTMENT SERVICE DATABASE
-- =============================================================================

CREATE TABLE appointments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_number  VARCHAR(20) NOT NULL UNIQUE,   -- e.g. APT-20240101-0001
    patient_id          UUID        NOT NULL,           -- FK to patient service
    patient_name        VARCHAR(200),                  -- denormalised cache
    doctor_id           UUID        NOT NULL,           -- FK to doctor service
    doctor_name         VARCHAR(200),
    department          VARCHAR(100),

    appointment_date    DATE        NOT NULL,
    start_time          TIME        NOT NULL,
    end_time            TIME        NOT NULL,

    status              VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
                            CHECK (status IN ('SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW')),

    type                VARCHAR(30) NOT NULL
                            CHECK (type IN ('CONSULTATION','FOLLOW_UP','EMERGENCY','ROUTINE_CHECKUP','PROCEDURE','LAB_TEST')),

    reason              VARCHAR(1000) NOT NULL,
    notes               TEXT,
    diagnosis_summary   TEXT,
    cancellation_reason TEXT,

    cancelled_at    TIMESTAMP,
    confirmed_at    TIMESTAMP,
    completed_at    TIMESTAMP,

    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_appt_patient_id    ON appointments(patient_id);
CREATE INDEX idx_appt_doctor_id     ON appointments(doctor_id);
CREATE INDEX idx_appt_date          ON appointments(appointment_date);
CREATE INDEX idx_appt_status        ON appointments(status);
CREATE INDEX idx_appt_doctor_date   ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appt_number        ON appointments(appointment_number);

-- =============================================================================
-- PRESCRIPTION SERVICE DATABASE
-- =============================================================================

CREATE TABLE prescriptions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_number VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. RX-20240101-0001
    patient_id          UUID         NOT NULL,
    patient_name        VARCHAR(200),
    doctor_id           UUID         NOT NULL,
    appointment_id      UUID,                           -- optional link

    issue_date          DATE    NOT NULL DEFAULT CURRENT_DATE,
    expiry_date         DATE,

    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE','EXPIRED','CANCELLED')),
    notes               TEXT,

    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE prescription_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id     UUID         NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name     VARCHAR(200) NOT NULL,
    dosage              VARCHAR(100) NOT NULL,
    frequency           VARCHAR(100) NOT NULL,
    duration            VARCHAR(100) NOT NULL,
    instructions        TEXT,
    sort_order          SMALLINT    DEFAULT 0
);

-- Indexes
CREATE INDEX idx_presc_patient_id   ON prescriptions(patient_id);
CREATE INDEX idx_presc_doctor_id    ON prescriptions(doctor_id);
CREATE INDEX idx_presc_status       ON prescriptions(status);
CREATE INDEX idx_presc_number       ON prescriptions(prescription_number);
CREATE INDEX idx_presc_items_presc  ON prescription_items(prescription_id);

-- =============================================================================
-- BILLING SERVICE DATABASE
-- =============================================================================

CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number  VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. INV-20240101-0001
    patient_id      UUID         NOT NULL,
    patient_name    VARCHAR(200),
    appointment_id  UUID,

    invoice_date    DATE         NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE,

    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('DRAFT','PENDING','PAID','PARTIALLY_PAID','CANCELLED','OVERDUE')),

    subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax             NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_amount  NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,

    notes           TEXT,

    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_line_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id      UUID          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description     VARCHAR(500)  NOT NULL,
    quantity        INTEGER       NOT NULL DEFAULT 1,
    unit_price      NUMERIC(10,2) NOT NULL,
    total_price     NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sort_order      SMALLINT      DEFAULT 0
);

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id      UUID          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount          NUMERIC(12,2) NOT NULL,
    payment_method  VARCHAR(20)   NOT NULL
                        CHECK (payment_method IN ('CASH','CARD','INSURANCE','BANK_TRANSFER','ONLINE')),
    payment_status  VARCHAR(20)   NOT NULL DEFAULT 'COMPLETED'
                        CHECK (payment_status IN ('PENDING','COMPLETED','FAILED','REFUNDED')),
    transaction_id  VARCHAR(100),
    paid_at         TIMESTAMP     NOT NULL DEFAULT NOW(),
    notes           TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoices_patient_id    ON invoices(patient_id);
CREATE INDEX idx_invoices_status        ON invoices(status);
CREATE INDEX idx_invoices_date          ON invoices(invoice_date);
CREATE INDEX idx_invoices_number        ON invoices(invoice_number);
CREATE INDEX idx_line_items_invoice     ON invoice_line_items(invoice_id);
CREATE INDEX idx_payments_invoice       ON payments(invoice_id);
CREATE INDEX idx_payments_status        ON payments(payment_status);

-- =============================================================================
-- NOTIFICATION SERVICE DATABASE (optional standalone)
-- =============================================================================

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL,
    channel         VARCHAR(50),
    subject         VARCHAR(255),
    recipient       VARCHAR(255) NOT NULL,  -- email addr or phone
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','SENT','FAILED','CANCELLED')),
    reference_type  VARCHAR(50),            -- APPOINTMENT | PRESCRIPTION | INVOICE
    reference_id    UUID,
    sent_at         TIMESTAMP,
    error_message   TEXT,
);

CREATE INDEX idx_notif_user_id    ON notifications(user_id);
CREATE INDEX idx_notif_status     ON notifications(status);
CREATE INDEX idx_notif_ref        ON notifications(reference_type, reference_id);

-- =============================================================================
-- USEFUL VIEWS
-- =============================================================================

-- Full appointment details (for reporting)
CREATE OR REPLACE VIEW vw_appointment_details AS
