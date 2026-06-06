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
