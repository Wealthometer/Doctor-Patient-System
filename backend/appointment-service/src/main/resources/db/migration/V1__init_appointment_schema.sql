-- V1__init_appointment_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE appointments (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_number   VARCHAR(30) NOT NULL UNIQUE,
    patient_id           UUID NOT NULL,
    patient_name         VARCHAR(200) NOT NULL,
    doctor_id            UUID NOT NULL,
    doctor_name          VARCHAR(200) NOT NULL,
    department           VARCHAR(200) NOT NULL,
    appointment_date     DATE NOT NULL,
    start_time           TIME NOT NULL,
    end_time             TIME NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    type                 VARCHAR(30) NOT NULL,
    reason               VARCHAR(1000) NOT NULL,
    notes                TEXT,
    diagnosis_summary    TEXT,
    cancellation_reason  VARCHAR(500),
    cancelled_at         TIMESTAMP,
    confirmed_at         TIMESTAMP,
CREATE INDEX idx_appt_patient_id    ON appointments(patient_id);
