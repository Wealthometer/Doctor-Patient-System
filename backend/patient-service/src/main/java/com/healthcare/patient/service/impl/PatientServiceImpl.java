package com.healthcare.patient.service.impl;

import com.healthcare.patient.dto.request.PatientRequests.CreatePatientRequest;
import com.healthcare.patient.dto.request.PatientRequests.UpdatePatientRequest;
import com.healthcare.patient.dto.response.PatientResponses.PatientResponse;
import com.healthcare.patient.dto.response.PatientResponses.PatientStatsResponse;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.entity.PatientStatus;
import com.healthcare.patient.exception.PatientAlreadyExistsException;
import com.healthcare.patient.exception.PatientNotFoundException;
import com.healthcare.patient.mapper.PatientMapper;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PatientServiceImpl implements PatientService {
    
    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;
    
    @Override
    public PatientResponse createPatient(CreatePatientRequest request) {
        log.info("Creating patient for user: {}", request.getUserId());
        
        // Check if patient already exists for this user
        if (patientRepository.existsByUserId(request.getUserId())) {
            throw new PatientAlreadyExistsException("Patient already exists for user: " + request.getUserId());
        }
        
        // Check if email is already used
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new PatientAlreadyExistsException("Email already in use: " + request.getEmail());
        }
        
        // Check if phone is already used
        if (patientRepository.existsByPhone(request.getPhone())) {
            throw new PatientAlreadyExistsException("Phone number already in use: " + request.getPhone());
        }
        
        Patient patient = patientMapper.toEntity(request);
        patient.setStatus(PatientStatus.ACTIVE);
        
        Patient savedPatient = patientRepository.save(patient);
        log.info("Patient created successfully with ID: {}", savedPatient.getId());
        
        return patientMapper.toResponse(savedPatient);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(UUID id) {
        log.info("Fetching patient with ID: {}", id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        return patientMapper.toResponse(patient);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientByUserId(UUID userId) {
        log.info("Fetching patient for user ID: {}", userId);
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found for user ID: " + userId));
        return patientMapper.toResponse(patient);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientByCode(String code) {
        log.info("Fetching patient with code: {}", code);
        Patient patient = patientRepository.findByPatientCode(code)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with code: " + code));
        return patientMapper.toResponse(patient);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getAllPatients(Pageable pageable) {
        log.info("Fetching all patients");
        return patientRepository.findAll(pageable)
                .map(patientMapper::toResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> searchPatients(String query, Pageable pageable) {
        log.info("Searching patients with query: {}", query);
        return patientRepository.searchPatients(query, pageable)
                .map(patientMapper::toResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getPatientsByStatus(PatientStatus status, Pageable pageable) {
        log.info("Fetching patients with status: {}", status);
        return patientRepository.findByStatus(status, pageable)
                .map(patientMapper::toResponse);
    }
    
    @Override
    public PatientResponse updatePatient(UUID id, UpdatePatientRequest request) {
        log.info("Updating patient with ID: {}", id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        
        patientMapper.updateEntityFromRequest(request, patient);
        Patient updatedPatient = patientRepository.save(patient);
        
        log.info("Patient updated successfully with ID: {}", id);
        return patientMapper.toResponse(updatedPatient);
    }
    
    @Override
    public void deactivatePatient(UUID id) {
        log.info("Deactivating patient with ID: {}", id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        
        patient.setStatus(PatientStatus.INACTIVE);
        patientRepository.save(patient);
        
        log.info("Patient deactivated successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientStatsResponse getStats() {
        long total = patientRepository.count();
        long active = patientRepository.countByStatus(PatientStatus.ACTIVE);
        long inactive = patientRepository.countByStatus(PatientStatus.INACTIVE);

        return PatientStatsResponse.builder()
                .totalPatients(total)
                .activePatients(active)
                .inactivePatients(inactive)
                .build();
    }
}
