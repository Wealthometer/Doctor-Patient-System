package com.healthcare.patient.exception;

public class PatientNotFoundException extends RuntimeException {
    public PatientNotFoundException(String message) { super(message); }
}
