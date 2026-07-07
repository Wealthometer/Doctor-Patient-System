package com.healthcare.notification.service;

import com.healthcare.notification.dto.NotificationRequest;
import com.healthcare.notification.dto.NotificationResponse;
import com.healthcare.notification.entity.*;
import com.healthcare.notification.exception.NotificationNotFoundException;
import com.healthcare.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Async
    public void sendNotification(NotificationRequest request) {
        processAndSave(request);
    }

    public NotificationResponse sendAndReturn(NotificationRequest request) {
        Notification notification = processAndSave(request);
        return toResponse(notification);
    }

    private Notification processAndSave(NotificationRequest request) {
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
            switch (notification.getChannel()) {
                case EMAIL -> sendEmail(notification);
                case SMS -> sendSms(notification);
                case PUSH -> sendPush(notification);
            }
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            log.info("Notification sent to {} via {}", request.getRecipientEmail(), notification.getChannel());
        } catch (Exception e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            log.error("Failed to send notification to {}: {}", request.getRecipientEmail(), e.getMessage());
        }
        return notificationRepository.save(notification);
    }

    private void sendEmail(Notification notification) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(notification.getRecipientEmail());
        message.setSubject(notification.getSubject());
        message.setText(notification.getBody());
        message.setFrom("noreply@healthcare.com");
        mailSender.send(message);
    }

    private void sendSms(Notification notification) {
        log.info("SMS to {}: {}", notification.getRecipientPhone(), notification.getBody());
    }

    private void sendPush(Notification notification) {
        log.info("PUSH to recipient {}: {}", notification.getRecipientId(), notification.getSubject());
    }

    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(UUID id) {
        return notificationRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAllNotifications(Pageable pageable) {
        return notificationRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotificationsByRecipient(UUID recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientId(recipientId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotificationsByStatus(NotificationStatus status, Pageable pageable) {
        return notificationRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByStatus(NotificationStatus.PENDING);
    }

    public NotificationResponse cancelNotification(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found: " + id));
        notification.setStatus(NotificationStatus.CANCELLED);
        return toResponse(notificationRepository.save(notification));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .recipientId(n.getRecipientId())
                .recipientEmail(n.getRecipientEmail())
                .recipientPhone(n.getRecipientPhone())
                .subject(n.getSubject())
                .body(n.getBody())
                .type(n.getType())
                .channel(n.getChannel())
                .status(n.getStatus())
                .errorMessage(n.getErrorMessage())
                .sentAt(n.getSentAt())
                .createdAt(n.getCreatedAt())
                .build();
    }

    public void sendAppointmentConfirmation(String email, String patientName,
                                             String doctorName, String dateTime) {
        NotificationRequest req = NotificationRequest.builder()
                .recipientEmail(email)
                .subject("Appointment Confirmed - HealthCare+")
                .body(String.format("""
                    Dear %s,
                    
                    Your appointment has been confirmed.
                    
                    Doctor: Dr. %s
                    Date & Time: %s
                    
                    Please arrive 15 minutes early. Bring any previous medical records.
                    
                    To cancel or reschedule, please log into your portal.
                    
                    Regards,
                    HealthCare+ Team
                    """, patientName, doctorName, dateTime))
                .type(NotificationType.APPOINTMENT_CONFIRMED)
                .channel(NotificationChannel.EMAIL)
                .build();
        sendNotification(req);
    }

    public void sendPrescriptionIssuedNotification(String email, String patientName,
                                                    String doctorName, String rxNumber) {
        NotificationRequest req = NotificationRequest.builder()
                .recipientEmail(email)
                .subject("New Prescription Issued - " + rxNumber)
                .body(String.format("""
                    Dear %s,
                    
                    Dr. %s has issued a new prescription (%s) for you.
                    
                    Please log into your HealthCare+ portal to view the details
                    and take your medications as prescribed.
                    
                    Regards,
                    HealthCare+ Team
                    """, patientName, doctorName, rxNumber))
                .type(NotificationType.PRESCRIPTION_ISSUED)
                .channel(NotificationChannel.EMAIL)
                .build();
        sendNotification(req);
    }

    public void sendBillingInvoice(String email, String patientName,
                                   String invoiceNumber, String amount, String dueDate) {
        NotificationRequest req = NotificationRequest.builder()
                .recipientEmail(email)
                .subject("Invoice " + invoiceNumber + " - HealthCare+")
                .body(String.format("""
                    Dear %s,
                    
                    A new invoice has been generated for your recent visit.
                    
                    Invoice Number: %s
                    Amount Due: $%s
                    Due Date: %s
                    
                    Please log into your portal to make a payment.
                    
                    Regards,
                    HealthCare+ Billing Team
                    """, patientName, invoiceNumber, amount, dueDate))
                .type(NotificationType.BILLING_INVOICE)
                .channel(NotificationChannel.EMAIL)
                .build();
        sendNotification(req);
    }
}
