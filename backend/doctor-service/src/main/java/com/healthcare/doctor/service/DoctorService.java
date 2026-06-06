package com.healthcare.doctor.service;

import com.healthcare.doctor.dto.request.DoctorRequests.*;
import com.healthcare.doctor.dto.response.DoctorResponses.*;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.DoctorStatus;
import com.healthcare.doctor.exception.DoctorAlreadyExistsException;
import com.healthcare.doctor.exception.DoctorNotFoundException;
import com.healthcare.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorMapper doctorMapper;

    public DoctorResponse createDoctor(CreateDoctorRequest request) {
        if (doctorRepository.existsByEmail(request.getEmail()))
            throw new DoctorAlreadyExistsException("Doctor with email already exists: " + request.getEmail());
        if (doctorRepository.existsByUserId(request.getUserId()))
            throw new DoctorAlreadyExistsException("Doctor profile already exists for this user");
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber()))
            throw new DoctorAlreadyExistsException("License number already registered: " + request.getLicenseNumber());

        Doctor doctor = doctorMapper.toEntity(request);
        doctor.setDoctorCode(generateDoctorCode());
        Doctor saved = doctorRepository.save(doctor);
        log.info("Created doctor: {} ({})", saved.getDoctorCode(), saved.getEmail());
        return doctorMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(UUID id) {
        return doctorRepository.findById(id)
                .map(doctorMapper::toResponse)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found: " + id));
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUserId(UUID userId) {
        return doctorRepository.findByUserId(userId)
                .map(doctorMapper::toResponse)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found for userId: " + userId));
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByCode(String code) {
        return doctorRepository.findByDoctorCode(code)
                .map(doctorMapper::toResponse)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with code: " + code));
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponse> getAllDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable).map(doctorMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponse> searchDoctors(String query, Pageable pageable) {
        return doctorRepository.searchDoctors(query, pageable).map(doctorMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponse> getDoctorsByDepartment(String department, Pageable pageable) {
        return doctorRepository.findByDepartment(department, pageable).map(doctorMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponse> getDoctorsBySpecialization(String specialization, Pageable pageable) {
        return doctorRepository.findBySpecialization(specialization, pageable).map(doctorMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<DoctorSummaryResponse> getActiveDoctorsByDepartment(String department) {
        return doctorRepository.findByDepartmentAndStatus(department, DoctorStatus.ACTIVE)
                .stream().map(doctorMapper::toSummary).toList();
    }

    public DoctorResponse updateDoctor(UUID id, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found: " + id));
        doctorMapper.updateEntity(request, doctor);
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    public DoctorResponse updateDoctorStatus(UUID id, DoctorStatus status) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found: " + id));
        doctor.setStatus(status);
        log.info("Doctor {} status updated to {}", doctor.getDoctorCode(), status);
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    public DoctorResponse submitRating(UUID id, RatingRequest request) {
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found: " + id));
