-- V1__init_doctor_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE doctor_status AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED');

CREATE TABLE doctors (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL UNIQUE,
    doctor_code             VARCHAR(20) NOT NULL UNIQUE,
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    phone                   VARCHAR(20) NOT NULL,
    specialization          VARCHAR(200) NOT NULL,
    department              VARCHAR(200) NOT NULL,
    license_number          VARCHAR(100) NOT NULL UNIQUE,
