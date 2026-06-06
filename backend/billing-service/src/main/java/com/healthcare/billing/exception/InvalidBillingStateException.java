package com.healthcare.billing.exception;

public class InvalidBillingStateException extends RuntimeException {
    public InvalidBillingStateException(String message) { super(message); }
}
