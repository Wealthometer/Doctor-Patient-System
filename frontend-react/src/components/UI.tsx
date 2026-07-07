import React from 'react';
import type { AppointmentStatus, InvoiceStatus, PatientStatus, DoctorStatus } from '../types';

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return <div className="loading-spinner"><div className="spinner" /></div>;
}

// ── Badge helpers ─────────────────────────────────────────────────────────────
export function AppointmentBadge({ status }: { status: AppointmentStatus }) {
  const label = status.replace('_', ' ');
  return <span className={`badge status-${status}`}>{label}</span>;
}

export function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  const cls: Record<InvoiceStatus, string> = {
    PAID: 'badge-success', PENDING: 'badge-warn', PARTIAL: 'badge-info',
    OVERDUE: 'badge-danger', CANCELLED: 'badge-muted',
  };
  return <span className={`badge ${cls[status]}`}>{status}</span>;
}

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  const cls: Record<PatientStatus, string> = {
    ACTIVE: 'badge-success', INACTIVE: 'badge-muted', SUSPENDED: 'badge-danger',
  };
  return <span className={`badge ${cls[status]}`}>{status}</span>;
}

export function DoctorStatusBadge({ status }: { status: DoctorStatus }) {
  const cls: Record<DoctorStatus, string> = {
    ACTIVE: 'badge-success', INACTIVE: 'badge-muted', ON_LEAVE: 'badge-warn',
  };
  return <span className={`badge ${cls[status]}`}>{status.replace('_', ' ')}</span>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}
export function Modal({ open, onClose, title, children, footer, maxWidth = '560px' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  danger?: boolean;
  loading?: boolean;
}
export function Confirm({ open, onClose, onConfirm, title, message, danger, loading }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait…' : 'Confirm'}
        </button>
      </>}>
      <p style={{ color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  change?: string;
}
export function StatCard({ label, value, icon, iconBg = 'var(--clr-primary-light)', change }: StatCardProps) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {change && <div className="stat-change">{change}</div>}
      </div>
      <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ message = 'No records found' }: { message?: string }) {
  return (
    <div className="empty-state">
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
      <p>{message}</p>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
interface PaginationProps { page: number; totalPages: number; onChange: (p: number) => void; }
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '16px 0' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => onChange(page - 1)} disabled={page === 0}>← Prev</button>
      <span style={{ padding: '5px 12px', fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
      <button className="btn btn-ghost btn-sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}>Next →</button>
    </div>
  );
}
