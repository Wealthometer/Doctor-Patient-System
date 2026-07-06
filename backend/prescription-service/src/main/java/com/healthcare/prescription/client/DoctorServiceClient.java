package com.healthcare.prescription.client;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.UUID;

@FeignClient(name = "doctor-service") // must match your service name
public interface DoctorServiceClient {

    @GetMapping("/api/v1/doctors/{id}")
    DoctorResponse getDoctorById(@PathVariable("id") UUID id);

    @Data
    @NoArgsConstructor
    class DoctorResponse {
        private String firstName;
        private String lastName;
    }
}
