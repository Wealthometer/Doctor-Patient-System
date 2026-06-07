package com.healthcare.patient;

import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
        SpringApplication.run(PatientServiceApplication.class, args);
    }
}
