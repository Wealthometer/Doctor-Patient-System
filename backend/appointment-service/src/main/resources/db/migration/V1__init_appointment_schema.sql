-- V1__init_appointment_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE appointments (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
