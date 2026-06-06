package com.healthcare.notification.service;

import com.healthcare.notification.dto.NotificationRequest;
import com.healthcare.notification.entity.*;
import com.healthcare.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
