package com.healthcare.patient.mapper;

import com.healthcare.patient.dto.request.PatientRequests.CreatePatientRequest;
import com.healthcare.patient.dto.request.PatientRequests.UpdatePatientRequest;
import com.healthcare.patient.dto.response.PatientResponses.PatientResponse;
import com.healthcare.patient.entity.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PatientMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patientCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Patient toEntity(CreatePatientRequest request);
    
    @Mapping(target = "fullName", expression = "java(patient.getFirstName() + \" \" + patient.getLastName())")
    @Mapping(target = "age", expression = "java(calculateAge(patient.getDateOfBirth()))")
    PatientResponse toResponse(Patient patient);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "patientCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "dateOfBirth", ignore = true)
    @Mapping(target = "gender", ignore = true)
    void updateEntityFromRequest(UpdatePatientRequest request, @MappingTarget Patient patient);
    
    default int calculateAge(java.time.LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return 0;
        }
        java.time.LocalDate today = java.time.LocalDate.now();
        return (int) java.time.temporal.ChronoUnit.YEARS.between(dateOfBirth, today);
    }
}
