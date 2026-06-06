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
