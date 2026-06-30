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

