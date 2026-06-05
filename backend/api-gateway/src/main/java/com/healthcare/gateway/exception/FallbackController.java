package com.healthcare.gateway.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    private ResponseEntity<Map<String, Object>> fallback(String service) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", 503,
                "error", "Service Unavailable",
                "message", service + " is currently unavailable. Please try again later."
        ));
    }

    @GetMapping("/auth")         public ResponseEntity<?> authFallback()         { return fallback("Auth Service"); }
    @GetMapping("/patient")      public ResponseEntity<?> patientFallback()      { return fallback("Patient Service"); }
    @GetMapping("/doctor")       public ResponseEntity<?> doctorFallback()       { return fallback("Doctor Service"); }
    @GetMapping("/appointment")  public ResponseEntity<?> appointmentFallback()  { return fallback("Appointment Service"); }
    @GetMapping("/prescription") public ResponseEntity<?> prescriptionFallback() { return fallback("Prescription Service"); }
