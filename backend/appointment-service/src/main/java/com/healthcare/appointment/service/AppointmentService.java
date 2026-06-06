package com.healthcare.appointment.service;

import com.healthcare.appointment.client.DoctorServiceClient;
import com.healthcare.appointment.client.PatientServiceClient;
import com.healthcare.appointment.dto.request.AppointmentRequests.*;
import com.healthcare.appointment.dto.response.AppointmentResponses.*;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.exception.AppointmentConflictException;
import com.healthcare.appointment.exception.AppointmentNotFoundException;
import com.healthcare.appointment.exception.InvalidAppointmentStateException;
import com.healthcare.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;
    private final AtomicLong appointmentCounter = new AtomicLong(1);

    public AppointmentResponse bookAppointment(BookAppointmentRequest request) {
        // Validate no time conflicts
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                request.getDoctorId(), request.getAppointmentDate(),
                request.getStartTime(), request.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new AppointmentConflictException(
                    "Doctor already has an appointment at this time slot");
        }

        // Check daily appointment limit
        long todayCount = appointmentRepository.countByDoctorIdAndAppointmentDate(
                request.getDoctorId(), request.getAppointmentDate());

        var doctorDto = doctorServiceClient.getDoctorById(request.getDoctorId());
        if (doctorDto.getMaxDailyAppointments() != null && todayCount >= doctorDto.getMaxDailyAppointments()) {
            throw new AppointmentConflictException("Doctor has reached maximum daily appointments");
        }

        var patientDto = patientServiceClient.getPatientById(request.getPatientId());

        Appointment appointment = Appointment.builder()
                .appointmentNumber(generateAppointmentNumber(request.getAppointmentDate()))
                .patientId(request.getPatientId())
                .patientName(patientDto.getFirstName() + " " + patientDto.getLastName())
                .doctorId(request.getDoctorId())
                .doctorName(doctorDto.getFirstName() + " " + doctorDto.getLastName())
                .department(doctorDto.getDepartment())
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .type(request.getType())
                .reason(request.getReason())
                .notes(request.getNotes())
                .status(AppointmentStatus.SCHEDULED)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Booked appointment: {} for patient {} with doctor {}",
                saved.getAppointmentNumber(), patientDto.getFirstName(), doctorDto.getFirstName());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID id) {
        return appointmentRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAppointmentsByPatient(UUID patientId, Pageable pageable) {
        return appointmentRepository.findByPatientId(patientId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAppointmentsByDoctor(UUID doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorId(doctorId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getDoctorAppointmentsByDate(UUID doctorId, LocalDate date, Pageable pageable) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AvailableSlot> getAvailableSlots(UUID doctorId, LocalDate date) {
        var doctor = doctorServiceClient.getDoctorById(doctorId);

        LocalTime start = doctor.getWorkStartTime() != null ? doctor.getWorkStartTime() : LocalTime.of(9, 0);
        LocalTime end = doctor.getWorkEndTime() != null ? doctor.getWorkEndTime() : LocalTime.of(17, 0);

        List<Appointment> bookedSlots = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusNot(doctorId, date, AppointmentStatus.CANCELLED);

        List<AvailableSlot> slots = new ArrayList<>();
        LocalTime current = start;

        while (current.plusMinutes(30).isBefore(end) || current.plusMinutes(30).equals(end)) {
            LocalTime slotEnd = current.plusMinutes(30);
            final LocalTime slotStart = current;

            boolean isBooked = bookedSlots.stream().anyMatch(a ->
                    a.getStartTime().isBefore(slotEnd) && a.getEndTime().isAfter(slotStart));

            slots.add(AvailableSlot.builder()
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .available(!isBooked)
                    .build());

            current = slotEnd;
        }
        return slots;
    }

    public AppointmentResponse confirmAppointment(UUID id) {
        return updateStatus(id, AppointmentStatus.CONFIRMED, a -> {
            if (a.getStatus() != AppointmentStatus.SCHEDULED)
                throw new InvalidAppointmentStateException("Can only confirm SCHEDULED appointments");
            a.setConfirmedAt(LocalDateTime.now());
        });
    }

    public AppointmentResponse startAppointment(UUID id) {
        return updateStatus(id, AppointmentStatus.IN_PROGRESS, a -> {
            if (a.getStatus() != AppointmentStatus.CONFIRMED && a.getStatus() != AppointmentStatus.SCHEDULED)
