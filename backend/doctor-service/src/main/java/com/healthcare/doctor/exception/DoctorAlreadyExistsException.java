package com.healthcare.doctor.exception;

public class DoctorAlreadyExistsException extends RuntimeException {
        super(message);
    }

    public DoctorAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}