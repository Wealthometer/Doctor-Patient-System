package com.healthcare.notification.dto;

import com.healthcare.notification.entity.NotificationChannel;
import com.healthcare.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class NotificationRequest {
    private UUID recipientId;
    private String recipientEmail;
