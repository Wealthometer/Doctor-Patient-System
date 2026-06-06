-- V1__init_billing_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE invoices (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number       VARCHAR(30) NOT NULL UNIQUE,
    patient_id           UUID NOT NULL,
    patient_name         VARCHAR(200) NOT NULL,
    appointment_id       UUID,
    appointment_number   VARCHAR(30),
