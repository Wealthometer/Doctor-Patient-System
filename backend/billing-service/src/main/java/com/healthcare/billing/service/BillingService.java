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
                .max(BigDecimal.ZERO);

        invoice.setSubtotal(subtotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(total);

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Created invoice {} for patient {}", saved.getInvoiceNumber(), saved.getPatientName());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(UUID id) {
        return invoiceRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getPatientInvoices(UUID patientId, Pageable pageable) {
        return invoiceRepository.findByPatientId(patientId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status, Pageable pageable) {
        return invoiceRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    public InvoiceResponse recordPayment(UUID invoiceId, RecordPaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new InvalidBillingStateException("Cannot accept payment for a " + invoice.getStatus() + " invoice");
        }

        BigDecimal balance = invoice.getTotalAmount().subtract(invoice.getPaidAmount());
        if (request.getAmount().compareTo(balance) > 0) {
            throw new InvalidBillingStateException("Payment amount exceeds balance due of $" + balance);
        }

        long count = paymentRepository.findByInvoiceId(invoiceId).size() + 1;
        Payment payment = Payment.builder()
                .invoice(invoice)
                .paymentReference("PAY-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                        + "-" + String.format("%04d", count))
                .amount(request.getAmount())
                .method(request.getMethod())
                .transactionId(request.getTransactionId())
                .notes(request.getNotes())
                .build();
        paymentRepository.save(payment);

        BigDecimal newPaid = invoice.getPaidAmount().add(request.getAmount());
        invoice.setPaidAmount(newPaid);

        if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }

        log.info("Payment {} recorded for invoice {}", payment.getPaymentReference(), invoice.getInvoiceNumber());
        return toResponse(invoiceRepository.save(invoice));
    }

    public InvoiceResponse cancelInvoice(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + id));
        if (invoice.getStatus() == InvoiceStatus.PAID)
            throw new InvalidBillingStateException("Cannot cancel a PAID invoice");
        invoice.setStatus(InvoiceStatus.CANCELLED);
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional(readOnly = true)
    public BillingStatsResponse getStats() {
        YearMonth currentMonth = YearMonth.now();
        BigDecimal monthlyRevenue = invoiceRepository.sumPaidAmountBetween(
                currentMonth.atDay(1), currentMonth.atEndOfMonth());
        BigDecimal outstanding = invoiceRepository.sumOutstandingBalance();

        return BillingStatsResponse.builder()
                .totalInvoices(invoiceRepository.count())
