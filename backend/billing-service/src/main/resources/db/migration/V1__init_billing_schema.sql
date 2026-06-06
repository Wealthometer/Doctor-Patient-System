-- V1__init_billing_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE invoices (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number       VARCHAR(30) NOT NULL UNIQUE,
