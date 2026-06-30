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
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
