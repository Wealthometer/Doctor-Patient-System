package com.healthcare.doctor.exception;
public class DoctorNotFoundException extends RuntimeException {
        super(message);

    public DoctorNotFoundException(String message, Throwable cause) {
        super(message, cause);
}