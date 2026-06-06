package com.healthcare.billing.controller;

import com.healthcare.billing.dto.request.BillingRequests.*;
import com.healthcare.billing.dto.response.BillingResponses.*;
import com.healthcare.billing.entity.InvoiceStatus;
import com.healthcare.billing.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Billing", description = "Billing and invoice management APIs")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Create a new invoice")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.createInvoice(request));
    }

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all invoices")
    public ResponseEntity<Page<InvoiceResponse>> getAllInvoices(
            @PageableDefault(size = 20, sort = "invoiceDate") Pageable pageable) {
        return ResponseEntity.ok(billingService.getAllInvoices(pageable));
    }

    @GetMapping("/invoices/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    @Operation(summary = "Get invoices for a patient")
    public ResponseEntity<Page<InvoiceResponse>> getPatientInvoices(
            @PathVariable UUID patientId,
            @PageableDefault(size = 20, sort = "invoiceDate") Pageable pageable) {
        return ResponseEntity.ok(billingService.getPatientInvoices(patientId, pageable));
    }

    @GetMapping("/invoices/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get invoices by status")
    public ResponseEntity<Page<InvoiceResponse>> getByStatus(
