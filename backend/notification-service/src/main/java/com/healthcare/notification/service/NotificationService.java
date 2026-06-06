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
    @Transactional
    public void sendNotification(NotificationRequest request) {
        Notification notification = Notification.builder()
                .recipientId(request.getRecipientId())
                .recipientEmail(request.getRecipientEmail())
                .recipientPhone(request.getRecipientPhone())
                .subject(request.getSubject())
                .body(request.getBody())
                .type(request.getType())
                .channel(request.getChannel() != null ? request.getChannel() : NotificationChannel.EMAIL)
                .build();

        try {
            if (notification.getChannel() == NotificationChannel.EMAIL) {
                sendEmail(notification);
            } else if (notification.getChannel() == NotificationChannel.SMS) {
                sendSms(notification);
            }
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            log.info("Notification sent to {} via {}", request.getRecipientEmail(), notification.getChannel());
        } catch (Exception e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            log.error("Failed to send notification to {}: {}", request.getRecipientEmail(), e.getMessage());
        }
    }
    private void sendEmail(Notification notification) {
        message.setTo(notification.getRecipientEmail());
        message.setText(notification.getBody());
        mailSender.send(message);
    }

