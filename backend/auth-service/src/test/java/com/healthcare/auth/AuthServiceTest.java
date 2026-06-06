package com.healthcare.auth;

import com.healthcare.auth.dto.request.AuthRequests.*;
import com.healthcare.auth.dto.response.AuthResponses.*;
import com.healthcare.auth.entity.RefreshToken;
import com.healthcare.auth.entity.Role;
import com.healthcare.auth.entity.User;
import com.healthcare.auth.exception.AuthException;
import com.healthcare.auth.repository.RefreshTokenRepository;
import com.healthcare.auth.repository.UserRepository;
import com.healthcare.auth.security.JwtService;
import com.healthcare.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
