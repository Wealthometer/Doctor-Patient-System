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
    license_expiry_date     DATE,
    bio                     TEXT,
    qualifications          VARCHAR(500),
    years_of_experience     INT,
    consultation_fee        VARCHAR(50),
    work_start_time         TIME,
    work_end_time           TIME,
    work_days               VARCHAR(100),
    max_daily_appointments  INT DEFAULT 20,
    profile_image_url       VARCHAR(500),
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    average_rating          DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    total_ratings           INT NOT NULL DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
