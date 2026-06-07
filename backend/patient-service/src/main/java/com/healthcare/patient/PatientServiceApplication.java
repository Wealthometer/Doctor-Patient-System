package com.healthcare.patient;

import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PatientServiceApplication {
        SpringApplication.run(PatientServiceApplication.class, args);
    }
}
