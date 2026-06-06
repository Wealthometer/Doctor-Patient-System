package com.healthcare.doctor.service;

import com.healthcare.doctor.dto.request.DoctorRequests.*;
import com.healthcare.doctor.dto.response.DoctorResponses.*;
import com.healthcare.doctor.entity.Doctor;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DoctorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctorCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "totalRatings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Doctor toEntity(CreateDoctorRequest request);

    @Mapping(target = "fullName", expression = "java(doctor.getFirstName() + ' ' + doctor.getLastName())")
