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
        private String patientName;
        private UUID appointmentId;
        private String appointmentNumber;
        private String doctorName;
        private String department;
        private LocalDate invoiceDate;
        private LocalDate dueDate;
        private BigDecimal subtotal;
        private BigDecimal taxRate;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal balanceDue;
        private String insuranceProvider;
        private BigDecimal insuranceCoverage;
        private InvoiceStatus status;
        private String notes;
        private List<LineItemResponse> lineItems;
        private List<PaymentResponse> payments;
        private LocalDateTime createdAt;
    }

    @Data @Builder
