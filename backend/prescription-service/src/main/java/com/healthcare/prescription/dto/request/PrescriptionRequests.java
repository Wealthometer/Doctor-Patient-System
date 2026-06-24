package com.healthcare.prescription.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class PrescriptionRequests {

    @Data
    public static class CreatePrescriptionRequest {
        @NotNull private UUID patientId;
        @NotNull private UUID doctorId;
        private UUID appointmentId;

        @NotNull @FutureOrPresent
        private LocalDate issueDate;

        @NotNull @Future
        private LocalDate expiryDate;

        @NotBlank
        private String diagnosis;

        private String notes;

        @NotEmpty(message = "At least one medication is required")
        @Valid
        private List<PrescriptionItemRequest> items;
    }

    @Data
    public static class PrescriptionItemRequest {
        @NotBlank private String medicationName;
        @NotBlank private String dosage;
        @NotBlank private String frequency;
        @NotBlank private String duration;
        private String instructions;
        @Min(1) private Integer quantity;
        @Min(0) @Max(12) private Integer refillsAllowed;
    }

    @Data
    public static class RefillRequest {
        @NotNull private UUID prescriptionItemId;
    }
}
