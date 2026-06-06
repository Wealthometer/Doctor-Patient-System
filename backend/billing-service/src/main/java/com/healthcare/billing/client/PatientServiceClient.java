package com.healthcare.billing.client;

import lombok.Builder;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "patient-service", fallback = PatientServiceClient.Fallback.class)
public interface PatientServiceClient {

    @GetMapping("/api/v1/patients/{id}")
    PatientDto getPatientById(@PathVariable UUID id);

    @Data @Builder
    class PatientDto {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String insuranceProvider;
    }

    class Fallback implements PatientServiceClient {
        @Override
        public PatientDto getPatientById(UUID id) {
            return PatientDto.builder().id(id).firstName("Unknown").lastName("Patient").build();
