package com.healthcare.prescription.repository;

import com.healthcare.prescription.entity.Prescription;
import com.healthcare.prescription.entity.PrescriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);
    Page<Prescription> findByPatientId(UUID patientId, Pageable pageable);
    Page<Prescription> findByDoctorId(UUID doctorId, Pageable pageable);
    Page<Prescription> findByPatientIdAndStatus(UUID patientId, PrescriptionStatus status, Pageable pageable);
    List<Prescription> findByAppointmentId(UUID appointmentId);

    @Query("SELECT p FROM Prescription p WHERE p.status = 'ACTIVE' AND p.expiryDate < :date")
    List<Prescription> findExpiredPrescriptions(@Param("date") LocalDate date);

    long countByPatientIdAndStatus(UUID patientId, PrescriptionStatus status);
}
