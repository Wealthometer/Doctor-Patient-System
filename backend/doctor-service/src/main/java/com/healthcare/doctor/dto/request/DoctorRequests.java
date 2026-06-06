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
        private LocalTime workEndTime;
        private String workDays;

        @Min(1) @Max(50)
        private Integer maxDailyAppointments;

        private String profileImageUrl;
    }

    @Data
    public static class UpdateDoctorRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String specialization;
        private String department;
        private LocalDate licenseExpiryDate;
        private String bio;
        private String qualifications;
        private Integer yearsOfExperience;
        private String consultationFee;
        private LocalTime workStartTime;
        private LocalTime workEndTime;
        private String workDays;
        private Integer maxDailyAppointments;
        private String profileImageUrl;
    }
