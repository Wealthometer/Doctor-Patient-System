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
