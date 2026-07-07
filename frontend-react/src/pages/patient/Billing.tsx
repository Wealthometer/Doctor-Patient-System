import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi, billingApi } from '../../api/services';
import type { InvoiceResponse } from '../../types';
import { Spinner, EmptyState, InvoiceBadge, Pagination, Modal } from '../../components/UI';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientBilling() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selected, setSelected] = useState<InvoiceResponse | null>(null);
  const [payModal, setPayModal] = useState<InvoiceResponse | null>(null);
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'CREDIT_CARD', notes: '' });
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user) return;
    patientApi.getByUserId(user.id)
      .then(p => { setPatientId(p.id); return loadInvoices(p.id, 0); })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const loadInvoices = async (pid: string, p: number) => {
    const res = await billingApi.getPatientInvoices(pid, p);
    setInvoices(res.content);
    setTotalPages(res.totalPages);
    setTotalElements(res.totalElements);
  };

  const handlePageChange = useCallback(async (p: number) => {
    if (!patientId) return;
    setPage(p);
    setLoading(true);
    try { await loadInvoices(patientId, p); }
    finally { setLoading(false); }
  }, [patientId]);

  const handlePayment = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      await billingApi.recordPayment(payModal.id, {
        amount: parseFloat(payForm.amount),
        paymentMethod: payForm.paymentMethod,
        notes: payForm.notes,
      });
      toast.success('Payment submitted successfully!');
      setPayModal(null);
      if (patientId) await loadInvoices(patientId, page);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Payment failed');
    } finally { setPaying(false); }
  };

  const totalOwed = invoices
    .filter(inv => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.remainingAmount, 0);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div><h1>Billing & Invoices</h1><p>Your payment history and outstanding balances</p></div>
      </div>

      {/* Summary row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value">{totalElements}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--clr-primary-light)' }}>📋</div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Outstanding Balance</div>
            <div className="stat-value" style={{ color: totalOwed > 0 ? 'var(--clr-danger)' : 'var(--clr-success)' }}>
              ${totalOwed.toFixed(2)}
            </div>
          </div>
          <div className="stat-icon" style={{ background: totalOwed > 0 ? 'var(--clr-danger-light)' : 'var(--clr-success-light)' }}>
            {totalOwed > 0 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Paid Invoices</div>
            <div className="stat-value">{invoices.filter(i => i.status === 'PAID').length}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--clr-success-light)' }}><CheckCircle size={24} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Invoice History</span></div>
        <div className="table-wrapper">
          {invoices.length === 0 ? (
            <EmptyState message="No invoices found" />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <code style={{ fontSize: 12 }}>{inv.invoiceNumber}</code>
                    </td>
                    <td>{inv.invoiceDate}</td>
                    <td>
                      {inv.dueDate
                        ? <span style={{ color: inv.status === 'OVERDUE' ? 'var(--clr-danger)' : 'inherit' }}>{inv.dueDate}</span>
                        : '—'}
                    </td>
                    <td style={{ fontWeight: 600 }}>${inv.totalAmount.toLocaleString()}</td>
                    <td style={{ color: 'var(--clr-success)' }}>${inv.paidAmount.toLocaleString()}</td>
                    <td style={{ color: inv.remainingAmount > 0 ? 'var(--clr-danger)' : 'inherit', fontWeight: inv.remainingAmount > 0 ? 600 : 400 }}>
                      ${inv.remainingAmount.toLocaleString()}
                    </td>
                    <td><InvoiceBadge status={inv.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(inv)}>View</button>
                        {['PENDING', 'PARTIAL', 'OVERDUE'].includes(inv.status) && (
                          <button className="btn btn-sm btn-primary"
                            onClick={() => { setPayModal(inv); setPayForm({ amount: String(inv.remainingAmount), paymentMethod: 'CREDIT_CARD', notes: '' }); }}>
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>

      {/* Invoice detail */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title={`Invoice ${selected.invoiceNumber}`} maxWidth="640px">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Date: {selected.invoiceDate}</div>
              {selected.dueDate && <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Due: {selected.dueDate}</div>}
            </div>
            <InvoiceBadge status={selected.status} />
          </div>

          <div className="table-wrapper" style={{ marginBottom: 16 }}>
            <table>
              <thead>
                <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                {selected.items?.map((item, i) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0', borderTop: '1px solid var(--clr-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--clr-text-muted)' }}>
              <span>Subtotal</span><span>${selected.subtotal?.toFixed(2)}</span>
            </div>
            {selected.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--clr-text-muted)' }}>
                <span>Tax</span><span>${selected.tax.toFixed(2)}</span>
              </div>
            )}
            {selected.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--clr-success)' }}>
                <span>Discount</span><span>−${selected.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingTop: 8, borderTop: '1px solid var(--clr-border)' }}>
              <span>Total</span><span>${selected.totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--clr-success)' }}>
              <span>Paid</span><span>${selected.paidAmount.toFixed(2)}</span>
            </div>
            {selected.remainingAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: 'var(--clr-danger)' }}>
                <span>Remaining</span><span>${selected.remainingAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {selected.notes && (
            <div style={{ marginTop: 12, padding: 10, background: 'var(--clr-bg)', borderRadius: 8, fontSize: 13, color: 'var(--clr-text-muted)' }}>
              {selected.notes}
            </div>
          )}

          {['PENDING', 'PARTIAL', 'OVERDUE'].includes(selected.status) && (
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setSelected(null); setPayModal(selected); setPayForm({ amount: String(selected.remainingAmount), paymentMethod: 'CREDIT_CARD', notes: '' }); }}>
                Pay ${selected.remainingAmount.toFixed(2)} Now
              </button>
            </div>
          )}
        </Modal>
      )}

      {/* Payment modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Make Payment"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setPayModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePayment} disabled={paying || !payForm.amount}>
            {paying ? 'Processing…' : `Pay $${parseFloat(payForm.amount || '0').toFixed(2)}`}
          </button>
        </>}>
        <div style={{ marginBottom: 16, padding: 12, background: 'var(--clr-bg)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>Invoice {payModal?.invoiceNumber}</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>Outstanding: ${payModal?.remainingAmount.toFixed(2)}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Amount ($) <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          <input type="number" className="form-control" value={payForm.amount}
            max={payModal?.remainingAmount}
            onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} step="0.01" />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select className="form-control" value={payForm.paymentMethod}
            onChange={e => setPayForm(p => ({ ...p, paymentMethod: e.target.value }))}>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="CASH">Cash</option>
            <option value="INSURANCE">Insurance</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <input className="form-control" placeholder="Reference number, etc." value={payForm.notes}
            onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
