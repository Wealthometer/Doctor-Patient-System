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
