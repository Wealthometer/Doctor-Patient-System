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

    private final NotificationRepository notificationRepository;
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
        notificationRepository.save(notification);
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
        // Integration point for SMS provider (Twilio, AWS SNS, etc.)
        log.info("SMS to {}: {}", notification.getRecipientPhone(), notification.getBody());
    }

    // Template helpers for common notification types
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
