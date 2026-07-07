package com.healthcare.notification.dto;

import com.healthcare.notification.entity.NotificationChannel;
import com.healthcare.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private UUID recipientId;
    private String recipientEmail;
    private String recipientPhone;
    private String subject;
    private String body;
    private NotificationType type;
    private NotificationChannel channel;
}
