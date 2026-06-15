package com.healthcare.prescription.service;

import com.healthcare.prescription.dto.request.PrescriptionRequests.*;
import com.healthcare.prescription.entity.Prescription;
import com.healthcare.prescription.entity.PrescriptionItem;
import com.healthcare.prescription.entity.PrescriptionStatus;
import com.healthcare.prescription.exception.PrescriptionNotFoundException;
import com.healthcare.prescription.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public Prescription createPrescription(CreatePrescriptionRequest request, String patientName, String doctorName) {
        Prescription prescription = Prescription.builder()
                .prescriptionNumber(generateRxNumber(request.getIssueDate()))
                .patientId(request.getPatientId())
                .patientName(patientName)
                .doctorId(request.getDoctorId())
                .doctorName(doctorName)
                .appointmentId(request.getAppointmentId())
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .diagnosis(request.getDiagnosis())
                .notes(request.getNotes())
                .build();

        List<PrescriptionItem> items = request.getItems().stream().map(itemReq -> {
            PrescriptionItem item = PrescriptionItem.builder()
                    .prescription(prescription)
                    .medicationName(itemReq.getMedicationName())
                    .dosage(itemReq.getDosage())
                    .frequency(itemReq.getFrequency())
                    .duration(itemReq.getDuration())
                    .instructions(itemReq.getInstructions())
                    .quantity(itemReq.getQuantity())
                    .refillsAllowed(itemReq.getRefillsAllowed() != null ? itemReq.getRefillsAllowed() : 0)
                    .build();
            return item;
        }).toList();
        prescription.setItems(items);

        Prescription saved = prescriptionRepository.save(prescription);
        log.info("Created prescription {} for patient {}", saved.getPrescriptionNumber(), patientName);
        return saved;
    }

    @Transactional(readOnly = true)
    public Prescription getPrescriptionById(UUID id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new PrescriptionNotFoundException("Prescription not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Prescription> getPatientPrescriptions(UUID patientId, Pageable pageable) {
        return prescriptionRepository.findByPatientId(patientId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Prescription> getActivePrescriptions(UUID patientId, Pageable pageable) {
        return prescriptionRepository.findByPatientIdAndStatus(patientId, PrescriptionStatus.ACTIVE, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Prescription> getDoctorPrescriptions(UUID doctorId, Pageable pageable) {
        return prescriptionRepository.findByDoctorId(doctorId, pageable);
    }

    public Prescription cancelPrescription(UUID id) {
        Prescription p = getPrescriptionById(id);
        if (p.getStatus() != PrescriptionStatus.ACTIVE)
            throw new IllegalStateException("Can only cancel ACTIVE prescriptions");
        p.setStatus(PrescriptionStatus.CANCELLED);
        return prescriptionRepository.save(p);
    }

    // Scheduled job to expire old prescriptions daily at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void expireOldPrescriptions() {
        List<Prescription> expired = prescriptionRepository.findExpiredPrescriptions(LocalDate.now());
        expired.forEach(p -> p.setStatus(PrescriptionStatus.EXPIRED));
        prescriptionRepository.saveAll(expired);
        if (!expired.isEmpty())
            log.info("Expired {} prescriptions", expired.size());
    }

    private String generateRxNumber(LocalDate date) {
        String datePart = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = prescriptionRepository.count() + 1;
        return "RX-" + datePart + "-" + String.format("%04d", count);
    }
}
