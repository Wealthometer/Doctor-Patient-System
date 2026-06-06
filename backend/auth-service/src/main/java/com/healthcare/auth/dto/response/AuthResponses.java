package com.healthcare.auth.dto.response;

import com.healthcare.auth.entity.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuthResponses {

    @Data
    @Builder
    public static class AuthResponse {
