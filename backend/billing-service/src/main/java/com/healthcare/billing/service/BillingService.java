package com.healthcare.billing.service;

import com.healthcare.billing.client.PatientServiceClient;
import com.healthcare.billing.dto.request.BillingRequests.*;
import com.healthcare.billing.dto.response.BillingResponses.*;
import com.healthcare.billing.entity.*;
import com.healthcare.billing.exception.InvoiceNotFoundException;
import com.healthcare.billing.exception.InvalidBillingStateException;
import com.healthcare.billing.repository.InvoiceRepository;
import com.healthcare.billing.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PatientServiceClient patientServiceClient;

    public InvoiceResponse createInvoice(CreateInvoiceRequest request) {
        var patient = patientServiceClient.getPatientById(request.getPatientId());

        // Build line items and calculate subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber(request.getInvoiceDate()))
                .patientId(request.getPatientId())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .appointmentId(request.getAppointmentId())
                .appointmentNumber(request.getAppointmentNumber())
                .doctorId(request.getDoctorId())
                .doctorName(request.getDoctorName())
                .department(request.getDepartment())
                .invoiceDate(request.getInvoiceDate())
                .dueDate(request.getDueDate())
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO)
                .insuranceProvider(request.getInsuranceProvider() != null ? request.getInsuranceProvider() : "Self-pay")
                .insuranceCoverage(request.getInsuranceCoverage() != null ? request.getInsuranceCoverage() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .subtotal(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (var itemReq : request.getLineItems()) {
            BigDecimal lineTotal = itemReq.getUnitPrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1));
            subtotal = subtotal.add(lineTotal);

            InvoiceLineItem item = InvoiceLineItem.builder()
                    .invoice(invoice)
                    .description(itemReq.getDescription())
                    .serviceCode(itemReq.getServiceCode())
                    .quantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1)
                    .unitPrice(itemReq.getUnitPrice())
                    .totalPrice(lineTotal)
                    .build();
            invoice.getLineItems().add(item);
        }

        BigDecimal taxAmount = subtotal.multiply(invoice.getTaxRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(taxAmount).subtract(invoice.getInsuranceCoverage())
