package com.healthcare.doctor.exception;

public class DoctorAlreadyExistsException extends RuntimeException {
    public DoctorAlreadyExistsException(String message) {
        super(message);
    }

    public DoctorAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}