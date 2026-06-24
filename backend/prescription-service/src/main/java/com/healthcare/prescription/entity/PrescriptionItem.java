package com.healthcare.prescription.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "prescription_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(nullable = false)
    private String medicationName;

    @Column(nullable = false)
    private String dosage; // e.g. "10mg"

    @Column(nullable = false)
    private String frequency; // e.g. "Once daily", "Twice daily"

    @Column(nullable = false)
    private String duration; // e.g. "30 days"

    private String instructions; // e.g. "Take with food"

    private Integer quantity;

    private Integer refillsAllowed;

    @Builder.Default
    private Integer refillsUsed = 0;
}
