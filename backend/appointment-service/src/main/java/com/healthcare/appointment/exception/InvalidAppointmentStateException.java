package com.healthcare.appointment.exception;

public class InvalidAppointmentStateException extends RuntimeException {
    public InvalidAppointmentStateException(String message) {
        super(message);
