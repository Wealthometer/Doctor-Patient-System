package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.DoctorStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUserId(UUID userId);
    Optional<Doctor> findByDoctorCode(String doctorCode);
    Optional<Doctor> findByEmail(String email);
    Optional<Doctor> findByLicenseNumber(String licenseNumber);

    boolean existsByEmail(String email);
    boolean existsByUserId(UUID userId);
    boolean existsByLicenseNumber(String licenseNumber);

    Page<Doctor> findByDepartment(String department, Pageable pageable);
    Page<Doctor> findBySpecialization(String specialization, Pageable pageable);
    Page<Doctor> findByStatus(DoctorStatus status, Pageable pageable);
    List<Doctor> findByDepartmentAndStatus(String department, DoctorStatus status);

    @Query("""
        SELECT d FROM Doctor d WHERE
        LOWER(d.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR
        LOWER(d.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR
        LOWER(d.specialization) LIKE LOWER(CONCAT('%', :query, '%')) OR
        LOWER(d.department) LIKE LOWER(CONCAT('%', :query, '%')) OR
        LOWER(d.doctorCode) LIKE LOWER(CONCAT('%', :query, '%'))
    """)
    Page<Doctor> searchDoctors(@Param("query") String query, Pageable pageable);

    @Query("SELECT DISTINCT d.department FROM Doctor d WHERE d.status = 'ACTIVE' ORDER BY d.department")
