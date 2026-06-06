package com.healthcare.billing.dto.request;

import com.healthcare.billing.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
