-- V1__init_billing_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE invoices (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number       VARCHAR(30) NOT NULL UNIQUE,
    patient_id           UUID NOT NULL,
    patient_name         VARCHAR(200) NOT NULL,
    appointment_id       UUID,
    appointment_number   VARCHAR(30),
    doctor_id            UUID,
    doctor_name          VARCHAR(200),
    department           VARCHAR(200) NOT NULL,
    invoice_date         DATE NOT NULL,
    due_date             DATE NOT NULL,
    subtotal             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate             DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    tax_amount           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    insurance_provider   VARCHAR(200)  NOT NULL DEFAULT 'Self-pay',
    insurance_coverage   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status               VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    notes                TEXT,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_line_items (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id   UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description  VARCHAR(500) NOT NULL,
    service_code VARCHAR(50)  NOT NULL,
    quantity     INT          NOT NULL DEFAULT 1,
