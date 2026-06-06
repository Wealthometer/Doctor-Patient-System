package com.healthcare.auth.service;

import com.healthcare.auth.dto.request.AuthRequests.*;
import com.healthcare.auth.dto.response.AuthResponses.*;
import com.healthcare.auth.entity.RefreshToken;
import com.healthcare.auth.entity.User;
import com.healthcare.auth.exception.AuthException;
import com.healthcare.auth.repository.RefreshTokenRepository;
import com.healthcare.auth.repository.UserRepository;
import com.healthcare.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshTokenExpiration;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .build();

        userRepository.save(user);
        log.info("New user registered: {} with role {}", user.getUsername(), user.getRole());

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsernameOrEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new AuthException("Invalid credentials");
        }

        User user = userRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(), request.getUsernameOrEmail()
        ).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        userRepository.updateLastLoginTime(user.getId(), LocalDateTime.now());
        refreshTokenRepository.revokeAllUserTokens(user);
        refreshTokenRepository.deleteRevokedTokensByUser(user);

        log.info("User logged in: {}", user.getUsername());
        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AuthException("Refresh token not found"));

        if (storedToken.isRevoked()) {
            throw new AuthException("Refresh token has been revoked");
        }
        if (storedToken.getExpiryDate().isBefore(Instant.now())) {
            throw new AuthException("Refresh token has expired");
        }

        User user = storedToken.getUser();
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public TokenValidationResponse validateToken(String token) {
        if (!jwtService.isTokenValid(token)) {
            return TokenValidationResponse.builder().valid(false).build();
        }

        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null || !user.isEnabled()) {
            return TokenValidationResponse.builder().valid(false).build();
        }

        return TokenValidationResponse.builder()
                .valid(true)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AuthException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.revokeAllUserTokens(user);
        log.info("Password changed for user: {}", user.getUsername());
    }

    public MessageResponse logout(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        refreshTokenRepository.revokeAllUserTokens(user);
        return MessageResponse.builder()
