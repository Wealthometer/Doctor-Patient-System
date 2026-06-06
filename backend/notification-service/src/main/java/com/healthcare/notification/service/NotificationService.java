package com.healthcare.notification.service;

import com.healthcare.notification.dto.NotificationRequest;
import com.healthcare.notification.entity.*;
import com.healthcare.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final JavaMailSender mailSender;

    @Async
    public void sendNotification(NotificationRequest request) {
                .recipientId(request.getRecipientId())
                .recipientPhone(request.getRecipientPhone())
                .body(request.getBody())
                .channel(request.getChannel() != null ? request.getChannel() : NotificationChannel.EMAIL)

            if (notification.getChannel() == NotificationChannel.EMAIL) {
            } else if (notification.getChannel() == NotificationChannel.SMS) {
            }
            notification.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            notification.setErrorMessage(e.getMessage());
        }

