package com.healthcare.appointment.repository;

import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Optional<Appointment> findByAppointmentNumber(String appointmentNumber);

    Page<Appointment> findByPatientId(UUID patientId, Pageable pageable);
    Page<Appointment> findByDoctorId(UUID doctorId, Pageable pageable);
    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);
    Page<Appointment> findByDoctorIdAndAppointmentDate(UUID doctorId, LocalDate date, Pageable pageable);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(
            UUID doctorId, LocalDate date, AppointmentStatus status);

    List<Appointment> findByPatientIdAndStatusIn(UUID patientId, List<AppointmentStatus> statuses);

    @Query("""
        SELECT a FROM Appointment a WHERE a.doctorId = :doctorId
        AND a.appointmentDate = :date
        AND a.status NOT IN ('CANCELLED', 'NO_SHOW')
        AND ((a.startTime < :endTime AND a.endTime > :startTime))
