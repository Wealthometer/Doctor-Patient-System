package com.healthcare.patient.service;

import com.healthcare.patient.dto.request.PatientRequests.*;
import com.healthcare.patient.dto.response.PatientResponses.*;
import com.healthcare.patient.entity.Patient;
import org.mapstruct.*;

import java.time.LocalDate;
import java.time.Period;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patientCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Patient toEntity(CreatePatientRequest request);

    @Mapping(target = "fullName", expression = "java(patient.getFirstName() + ' ' + patient.getLastName())")
    @Mapping(target = "age", expression = "java(calculateAge(patient.getDateOfBirth()))")
    PatientResponse toResponse(Patient patient);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "patientCode", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UpdatePatientRequest request, @MappingTarget Patient patient);

    default int calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) return 0;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }
}
