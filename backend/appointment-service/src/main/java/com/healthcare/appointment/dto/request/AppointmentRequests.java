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
