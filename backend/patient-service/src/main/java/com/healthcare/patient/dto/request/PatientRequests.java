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
        private LocalDate dateOfBirth;

        @NotNull(message = "Gender is required")
        private Gender gender;

        private String address;
        private String city;
        private String state;
        private String zipCode;
        @Builder.Default
        private String country = "US";

        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelation;
        private String allergies;
        private String chronicConditions;
        private String bloodType;
        private String medicalNotes;

        @NotBlank(message = "Insurance provider is required")
