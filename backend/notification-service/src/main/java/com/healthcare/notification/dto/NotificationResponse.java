package com.healthcare.notification.dto;

import com.healthcare.notification.entity.NotificationChannel;
import com.healthcare.notification.entity.NotificationStatus;
import com.healthcare.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationResponse {
    private UUID id;
    private UUID recipientId;
    private String recipientEmail;
    private String recipientPhone;
    private String subject;
    private String body;
    private NotificationType type;
    private NotificationChannel channel;
    private NotificationStatus status;
    private String errorMessage;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
}
