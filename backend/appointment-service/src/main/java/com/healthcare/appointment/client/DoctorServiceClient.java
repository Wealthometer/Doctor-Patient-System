package com.healthcare.appointment.client;

import lombok.Builder;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalTime;
import java.util.UUID;

@FeignClient(name = "doctor-service", fallback = DoctorServiceClient.DoctorServiceFallback.class)
public interface DoctorServiceClient {

    @GetMapping("/api/v1/doctors/{id}")
    DoctorDto getDoctorById(@PathVariable UUID id);

    @Data
    @Builder
    class DoctorDto {
        private UUID id;
        private String doctorCode;
        private String firstName;
        private String lastName;
        private String specialization;
        private String department;
        private LocalTime workStartTime;
        private LocalTime workEndTime;
        private String workDays;
        private Integer maxDailyAppointments;
        private String status;
