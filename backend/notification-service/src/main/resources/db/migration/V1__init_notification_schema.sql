-- V1__init_notification_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE notifications (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id     UUID,
    recipient_email  VARCHAR(255) NOT NULL,
    recipient_phone  VARCHAR(20),
