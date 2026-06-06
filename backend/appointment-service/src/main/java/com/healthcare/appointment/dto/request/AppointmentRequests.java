package com.healthcare.appointment.dto.request;

import com.healthcare.appointment.entity.AppointmentType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class AppointmentRequests {

    @Data
    public static class BookAppointmentRequest {
        @NotNull(message = "Patient ID is required")
        private UUID patientId;

        @NotNull(message = "Doctor ID is required")
        @NotNull(message = "Start time is required")
