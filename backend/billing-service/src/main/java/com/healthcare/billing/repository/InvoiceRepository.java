package com.healthcare.billing.repository;

import com.healthcare.billing.entity.Invoice;
import com.healthcare.billing.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Page<Invoice> findByPatientId(UUID patientId, Pageable pageable);
    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);
    Page<Invoice> findByPatientIdAndStatus(UUID patientId, InvoiceStatus status, Pageable pageable);

    List<Invoice> findByStatusAndDueDateBefore(InvoiceStatus status, LocalDate date);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PAID' AND i.invoiceDate BETWEEN :start AND :end")
    BigDecimal sumPaidAmountBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(i.totalAmount - i.paidAmount) FROM Invoice i WHERE i.status IN ('PENDING','PARTIALLY_PAID','OVERDUE')")
    BigDecimal sumOutstandingBalance();

