package com.healthcare.patient.dto.response;

import com.healthcare.patient.entity.Gender;
import com.healthcare.patient.entity.PatientStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class PatientResponses {

    @Data
    @Builder
    public static class PatientResponse {
        private UUID id;
        private UUID userId;
        private String patientCode;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private LocalDate dateOfBirth;
        private int age;
        private Gender gender;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelation;
        private String allergies;
        private String chronicConditions;
        private String bloodType;
        private String medicalNotes;
        private PatientStatus status;
        private String insuranceProvider;
        private String insurancePolicyNumber;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

