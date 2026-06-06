package com.healthcare.doctor.service;

import com.healthcare.doctor.dto.request.DoctorRequests.*;
import com.healthcare.doctor.dto.response.DoctorResponses.*;
import com.healthcare.doctor.entity.Doctor;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DoctorMapper {

    @Mapping(target = "id", ignore = true)
