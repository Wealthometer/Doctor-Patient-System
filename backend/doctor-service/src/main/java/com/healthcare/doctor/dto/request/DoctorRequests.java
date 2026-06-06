package com.healthcare.doctor.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class DoctorRequests {

    @Data
    public static class CreateDoctorRequest {
        @NotNull
        private UUID userId;

        @NotBlank
        private String firstName;

        @NotBlank
        private String lastName;

        @NotBlank @Email
        private String email;

        @NotBlank
        private String phone;

        @NotBlank(message = "Specialization is required")
        private String specialization;

        @NotBlank(message = "Department is required")
        private String department;

        @NotBlank(message = "License number is required")
        private String licenseNumber;

        private LocalDate licenseExpiryDate;
        private String bio;
        private String qualifications;

        @Min(0) @Max(60)
        private Integer yearsOfExperience;

        private String consultationFee;
        private LocalTime workStartTime;
