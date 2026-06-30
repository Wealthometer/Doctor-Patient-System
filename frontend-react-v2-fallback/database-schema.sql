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

