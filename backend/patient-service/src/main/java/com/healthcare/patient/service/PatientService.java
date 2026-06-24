package com.healthcare.patient.service;

import com.healthcare.patient.dto.request.PatientRequests.CreatePatientRequest;
import com.healthcare.patient.dto.request.PatientRequests.UpdatePatientRequest;
import com.healthcare.patient.dto.response.PatientResponses.PatientResponse;
import com.healthcare.patient.dto.response.PatientResponses.PatientStatsResponse;
import com.healthcare.patient.entity.PatientStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PatientService {
    
    PatientResponse createPatient(CreatePatientRequest request);
    
    PatientResponse getPatientById(UUID id);
    
    PatientResponse getPatientByUserId(UUID userId);
    
    PatientResponse getPatientByCode(String code);
    
    Page<PatientResponse> getAllPatients(Pageable pageable);
    
    Page<PatientResponse> searchPatients(String query, Pageable pageable);
    
    Page<PatientResponse> getPatientsByStatus(PatientStatus status, Pageable pageable);
    
    PatientResponse updatePatient(UUID id, UpdatePatientRequest request);
    
    void deactivatePatient(UUID id);
    PatientStatsResponse getStats();
}
