package com.healthcare.doctor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false, unique = true, length = 20)
    private String doctorCode; // e.g. D-1001

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String licenseNumber;

    private LocalDate licenseExpiryDate;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String qualifications;

    private Integer yearsOfExperience;

    private String consultationFee;

    private LocalTime workStartTime;

    private LocalTime workEndTime;

    @Column(length = 100)
    private String workDays; // e.g. "MON,TUE,WED,THU,FRI"

    private Integer maxDailyAppointments;

    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DoctorStatus status = DoctorStatus.ACTIVE;

    @Column(nullable = false)
    @Builder.Default
    private double averageRating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private int totalRatings = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
