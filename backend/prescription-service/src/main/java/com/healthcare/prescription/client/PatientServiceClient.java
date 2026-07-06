package com.healthcare.prescription.client;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.UUID;

@FeignClient(name = "patient-service") // must match your service name
public interface PatientServiceClient {

    @GetMapping("/api/v1/patients/{id}")
    PatientResponse getPatientById(@PathVariable("id") UUID id);

    @Data
    @NoArgsConstructor
    class PatientResponse {
        private String firstName;
        private String lastName;
    }
}
