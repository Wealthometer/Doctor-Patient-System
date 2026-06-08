package com.healthcare.patient.service;

import com.healthcare.patient.dto.request.PatientRequests.*;
import com.healthcare.patient.dto.response.PatientResponses.*;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.entity.PatientStatus;
import com.healthcare.patient.exception.PatientNotFoundException;
import com.healthcare.patient.exception.PatientAlreadyExistsException;
import com.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;
    private final AtomicLong patientCodeCounter = new AtomicLong(1000);

    public PatientResponse createPatient(CreatePatientRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new PatientAlreadyExistsException("Patient with email already exists: " + request.getEmail());
        }
        if (patientRepository.existsByUserId(request.getUserId())) {
            throw new PatientAlreadyExistsException("Patient profile already exists for this user");
        }

        Patient patient = patientMapper.toEntity(request);
        patient.setPatientCode(generatePatientCode());

        Patient saved = patientRepository.save(patient);
        log.info("Created patient: {} ({})", saved.getPatientCode(), saved.getEmail());
        return patientMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(UUID id) {
        return patientRepository.findById(id)
                .map(patientMapper::toResponse)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByUserId(UUID userId) {
        return patientRepository.findByUserId(userId)
                .map(patientMapper::toResponse)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found for userId: " + userId));
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByCode(String code) {
        return patientRepository.findByPatientCode(code)
                .map(patientMapper::toResponse)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with code: " + code));
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable).map(patientMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> searchPatients(String query, Pageable pageable) {
        return patientRepository.searchPatients(query, pageable).map(patientMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> getPatientsByStatus(PatientStatus status, Pageable pageable) {
        return patientRepository.findByStatus(status, pageable).map(patientMapper::toResponse);
    }

    public PatientResponse updatePatient(UUID id, UpdatePatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + id));

        patientMapper.updateEntity(request, patient);
        Patient updated = patientRepository.save(patient);
        log.info("Updated patient: {}", updated.getPatientCode());
        return patientMapper.toResponse(updated);
    }

    public void deactivatePatient(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + id));
        patient.setStatus(PatientStatus.INACTIVE);
        patientRepository.save(patient);
        log.info("Deactivated patient: {}", patient.getPatientCode());
    }

    @Transactional(readOnly = true)
    public PatientStatsResponse getStats() {
        return PatientStatsResponse.builder()
                .totalPatients(patientRepository.count())
                .activePatients(patientRepository.countByStatus(PatientStatus.ACTIVE))
                .inactivePatients(patientRepository.countByStatus(PatientStatus.INACTIVE))
                .build();
    }

    private String generatePatientCode() {
        long count = patientRepository.count();
        return "P-" + String.format("%04d", count + 1001);
    }
}
