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
