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
