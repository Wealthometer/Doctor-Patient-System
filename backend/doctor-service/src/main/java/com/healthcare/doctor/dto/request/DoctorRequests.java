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
