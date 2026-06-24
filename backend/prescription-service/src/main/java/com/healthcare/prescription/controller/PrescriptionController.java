package com.healthcare.prescription.controller;

import com.healthcare.prescription.client.PatientServiceClient;
import com.healthcare.prescription.client.DoctorServiceClient;
import com.healthcare.prescription.dto.request.PrescriptionRequests.*;
import com.healthcare.prescription.entity.Prescription;
import com.healthcare.prescription.service.PrescriptionService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Prescriptions", description = "Prescription management APIs")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Prescription> create(@Valid @RequestBody CreatePrescriptionRequest request) {
        var patient = patientServiceClient.getPatientById(request.getPatientId());
        var doctor  = doctorServiceClient.getDoctorById(request.getDoctorId());
        String patientName = patient.getFirstName() + " " + patient.getLastName();
        String doctorName  = doctor.getFirstName() + " " + doctor.getLastName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(prescriptionService.createPrescription(request, patientName, doctorName));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    public ResponseEntity<Prescription> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    public ResponseEntity<Page<Prescription>> getByPatient(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20, sort = "issueDate") Pageable pageable) {
        return ResponseEntity.ok(prescriptionService.getPatientPrescriptions(patientId, pageable));
    }

    @GetMapping("/patient/{patientId}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    public ResponseEntity<Page<Prescription>> getActivePrescriptions(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(prescriptionService.getActivePrescriptions(patientId, pageable));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Page<Prescription>> getByDoctor(
            @PathVariable UUID doctorId,
            @PageableDefault(size = 20, sort = "issueDate") Pageable pageable) {
        return ResponseEntity.ok(prescriptionService.getDoctorPrescriptions(doctorId, pageable));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Prescription> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(prescriptionService.cancelPrescription(id));
    }
}
