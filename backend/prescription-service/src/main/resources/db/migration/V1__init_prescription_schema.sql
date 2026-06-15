-- V1__init_prescription_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE prescriptions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_number  VARCHAR(30)  NOT NULL UNIQUE,
    patient_id           UUID         NOT NULL,
    patient_name         VARCHAR(200) NOT NULL,
    doctor_id            UUID         NOT NULL,
    doctor_name          VARCHAR(200) NOT NULL,
    appointment_id       UUID,
    issue_date           DATE         NOT NULL,
    expiry_date          DATE         NOT NULL,
    diagnosis            TEXT,
    notes                TEXT,
    status               VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescription_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id     UUID         NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name     VARCHAR(300) NOT NULL,
    dosage              VARCHAR(100) NOT NULL,
    frequency           VARCHAR(100) NOT NULL,
    duration            VARCHAR(100) NOT NULL,
    instructions        VARCHAR(500),
    quantity            INT,
    refills_allowed     INT NOT NULL DEFAULT 0,
    refills_used        INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_rx_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_rx_doctor_id  ON prescriptions(doctor_id);
CREATE INDEX idx_rx_status     ON prescriptions(status);
CREATE INDEX idx_rx_expiry     ON prescriptions(expiry_date);
CREATE INDEX idx_rx_items_rx   ON prescription_items(prescription_id);
