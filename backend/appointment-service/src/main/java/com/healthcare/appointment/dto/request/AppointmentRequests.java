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
        private UUID doctorId;

        @NotNull(message = "Appointment date is required")
        @FutureOrPresent(message = "Appointment date cannot be in the past")
        private LocalDate appointmentDate;

        @NotNull(message = "Start time is required")
        private LocalTime startTime;

        @NotNull(message = "End time is required")
        private LocalTime endTime;

        @NotNull(message = "Appointment type is required")
