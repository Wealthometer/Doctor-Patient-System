package com.healthcare.patient.dto.request;

import com.healthcare.patient.entity.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

public class PatientRequests {

    @Data
    public static class CreatePatientRequest {
        @NotNull(message = "User ID is required")
        private UUID userId;

        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "Phone is required")
        private String phone;

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
