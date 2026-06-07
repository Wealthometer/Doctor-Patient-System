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
