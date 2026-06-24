-- V1__init_patient_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE patient_status AS ENUM ('ACTIVE', 'INACTIVE', 'DECEASED', 'TRANSFERRED');

CREATE TABLE patients (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     UUID NOT NULL UNIQUE,
    patient_code                VARCHAR(20) NOT NULL UNIQUE,
    first_name                  VARCHAR(100) NOT NULL,
    last_name                   VARCHAR(100) NOT NULL,
    email                       VARCHAR(255) NOT NULL UNIQUE,
    phone                       VARCHAR(20) NOT NULL,
    date_of_birth               DATE NOT NULL,
    gender                      VARCHAR(30) NOT NULL,
    address                     VARCHAR(500),
    city                        VARCHAR(100),
    state                       VARCHAR(100),
    zip_code                    VARCHAR(20),
    country                     VARCHAR(100) DEFAULT 'US',
    emergency_contact_name      VARCHAR(200),
    emergency_contact_phone     VARCHAR(20),
    emergency_contact_relation  VARCHAR(100),
    allergies                   VARCHAR(1000),
    chronic_conditions          VARCHAR(1000),
    blood_type                  VARCHAR(10),
    medical_notes               TEXT,
    status                      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    insurance_provider          VARCHAR(200) NOT NULL,
    insurance_policy_number     VARCHAR(100),
    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_patient_code ON patients(patient_code);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
