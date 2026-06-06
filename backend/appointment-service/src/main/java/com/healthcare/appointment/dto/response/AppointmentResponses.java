package com.healthcare.appointment.dto.response;

import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.entity.AppointmentType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;

public class AppointmentResponses {

    @Data
    @Builder
    public static class AppointmentResponse {
        private UUID id;
        private String appointmentNumber;
        private UUID patientId;
        private String patientName;
        private UUID doctorId;
        private String doctorName;
        private String department;
        private LocalDate appointmentDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private AppointmentStatus status;
        private AppointmentType type;
        private String reason;
        private String notes;
        private String diagnosisSummary;
        private String cancellationReason;
        private LocalDateTime cancelledAt;
        private LocalDateTime confirmedAt;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    public static class AppointmentStatsResponse {
        private long totalAppointments;
        private long todayAppointments;
        private long scheduledAppointments;
        private long completedAppointments;
        private long cancelledAppointments;
        private Map<String, Long> byDepartment;
    }

    @Data
    @Builder
    public static class AvailableSlot {
        private LocalTime startTime;
        private LocalTime endTime;
