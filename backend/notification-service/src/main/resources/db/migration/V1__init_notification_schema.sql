-- V1__init_notification_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE notifications (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id     UUID,
    recipient_email  VARCHAR(255) NOT NULL,
    recipient_phone  VARCHAR(20),
    subject          VARCHAR(500) NOT NULL,
    body             TEXT NOT NULL,
    type             VARCHAR(50) NOT NULL,
    channel          VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    error_message    TEXT,
    sent_at          TIMESTAMP,
