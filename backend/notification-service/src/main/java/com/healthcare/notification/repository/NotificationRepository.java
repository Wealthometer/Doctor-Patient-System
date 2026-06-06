package com.healthcare.notification.repository;

import com.healthcare.notification.entity.Notification;
import com.healthcare.notification.entity.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByRecipientId(UUID recipientId, Pageable pageable);
    Page<Notification> findByStatus(NotificationStatus status, Pageable pageable);
