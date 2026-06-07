package com.healthcare.patient.controller;

import com.healthcare.patient.dto.request.PatientRequests.*;
import com.healthcare.patient.dto.response.PatientResponses.*;
import com.healthcare.patient.entity.PatientStatus;
import com.healthcare.patient.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
