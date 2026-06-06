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
        private String accessToken;
        private String refreshToken;
        @Builder.Default
        private String tokenType = "Bearer";
        private long expiresIn;
        private UserInfo user;
    }

