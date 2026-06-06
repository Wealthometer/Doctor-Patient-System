package com.healthcare.billing.dto.response;

import com.healthcare.billing.entity.InvoiceStatus;
import com.healthcare.billing.entity.PaymentMethod;
import com.healthcare.billing.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class BillingResponses {

    @Data @Builder
    public static class InvoiceResponse {
        private UUID id;
        private String invoiceNumber;
        private UUID patientId;
