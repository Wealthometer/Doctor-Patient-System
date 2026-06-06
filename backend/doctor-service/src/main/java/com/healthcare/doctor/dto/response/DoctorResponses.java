package com.healthcare.doctor.dto.response;

import com.healthcare.doctor.entity.DoctorStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class DoctorResponses {

    @Data
    @Builder
    public static class DoctorResponse {
        private UUID id;
        private UUID userId;
        private String doctorCode;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private String specialization;
        private String department;
        private String licenseNumber;
