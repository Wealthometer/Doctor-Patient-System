package com.healthcare.prescription.repository;

import com.healthcare.prescription.entity.Prescription;
import com.healthcare.prescription.entity.PrescriptionStatus;
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

    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);

