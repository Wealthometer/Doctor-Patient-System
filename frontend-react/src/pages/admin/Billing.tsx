import { useState, useEffect, useCallback } from 'react';
import { billingApi } from '../../api/services';
import type { InvoiceResponse } from '../../types';
import { Spinner, EmptyState, InvoiceBadge, Pagination, Modal, StatCard } from '../../components/UI';
import { DollarSign, CheckCircle, Hourglass, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBilling() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [selected, setSelected] = useState<InvoiceResponse | null>(null);
  const [payModal, setPayModal] = useState<InvoiceResponse | null>(null);
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'CASH', notes: '' });
  const [paying, setPaying] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const [inv, st] = await Promise.all([
        billingApi.getAll(p),
        billingApi.stats().catch(() => null),
      ]);
      setInvoices(inv.content);
      setTotalPages(inv.totalPages);
      setStats(st);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const handlePayment = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      await billingApi.recordPayment(payModal.id, {
        amount: parseFloat(payForm.amount),
        paymentMethod: payForm.paymentMethod,
        notes: payForm.notes,
      });
      toast.success('Payment recorded');
      setPayModal(null);
      load(page);
    } catch { toast.error('Failed to record payment'); }
    finally { setPaying(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this invoice?')) return;
    try {
      await billingApi.cancel(id);
      toast.success('Invoice cancelled');
      load(page);
    } catch { toast.error('Failed to cancel invoice'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Billing</h1><p>Invoices and payment management</p></div>
      </div>

      {stats && (
        <div className="stats-grid">
          <StatCard label="Total Revenue" value={`$${(stats.totalRevenue || 0).toLocaleString()}`} icon={<DollarSign size={24} />} iconBg="var(--clr-success-light)" />
          <StatCard label="Paid This Month" value={`$${(stats.paidThisMonth || 0).toLocaleString()}`} icon={<CheckCircle size={24} />} iconBg="var(--clr-accent-light)" />
          <StatCard label="Pending Amount" value={`$${(stats.pendingAmount || 0).toLocaleString()}`} icon={<Hourglass size={24} />} iconBg="var(--clr-warn-light)" />
          <StatCard label="Overdue Count" value={stats.overdueCount || 0} icon={<AlertTriangle size={24} />} iconBg="var(--clr-danger-light)" />
        </div>
      )}

      <div className="card">
        <div className="card-header"><span className="card-title">All Invoices</span></div>
        <div className="table-wrapper">
          {loading ? <Spinner /> : invoices.length === 0 ? <EmptyState message="No invoices found" /> : (
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Patient</th>
                  <th>Date</th>
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
                    <td><code style={{ fontSize: 12 }}>{inv.invoiceNumber}</code></td>
                    <td>{inv.patientName || inv.patientId.slice(0, 8) + '…'}</td>
                    <td>{inv.invoiceDate}</td>
                    <td style={{ fontWeight: 600 }}>${inv.totalAmount.toLocaleString()}</td>
                    <td style={{ color: 'var(--clr-success)' }}>${inv.paidAmount.toLocaleString()}</td>
                    <td style={{ color: inv.remainingAmount > 0 ? 'var(--clr-danger)' : 'inherit' }}>
                      ${inv.remainingAmount.toLocaleString()}
                    </td>
                    <td><InvoiceBadge status={inv.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(inv)}>View</button>
                        {['PENDING', 'PARTIAL', 'OVERDUE'].includes(inv.status) && (
                          <button className="btn btn-sm btn-accent" onClick={() => { setPayModal(inv); setPayForm({ amount: String(inv.remainingAmount), paymentMethod: 'CASH', notes: '' }); }}>
                            Record Payment
                          </button>
                        )}
                        {inv.status !== 'CANCELLED' && inv.status !== 'PAID' && (
                          <button className="btn btn-sm" style={{ background: 'var(--clr-danger-light)', color: 'var(--clr-danger)' }}
                            onClick={() => handleCancel(inv.id)}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Invoice detail */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title={`Invoice ${selected.invoiceNumber}`} maxWidth="640px">
          <div className="info-grid">
            <div className="info-item"><div className="info-label">Patient</div><div className="info-value">{selected.patientName || selected.patientId}</div></div>
            <div className="info-item"><div className="info-label">Date</div><div className="info-value">{selected.invoiceDate}</div></div>
            <div className="info-item"><div className="info-label">Due Date</div><div className="info-value">{selected.dueDate || '—'}</div></div>
            <div className="info-item"><div className="info-label">Status</div><div className="info-value"><InvoiceBadge status={selected.status} /></div></div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Line Items</div>
            <table>
              <thead>
                <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unitPrice}</td>
                    <td>${item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Subtotal: ${selected.subtotal}</div>
            <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Tax: ${selected.tax}</div>
            {selected.discount > 0 && <div style={{ fontSize: 13, color: 'var(--clr-success)' }}>Discount: −${selected.discount}</div>}
            <div style={{ fontSize: 16, fontWeight: 700 }}>Total: ${selected.totalAmount}</div>
            <div style={{ fontSize: 13, color: 'var(--clr-success)' }}>Paid: ${selected.paidAmount}</div>
            {selected.remainingAmount > 0 && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--clr-danger)' }}>Remaining: ${selected.remainingAmount}</div>}
          </div>
        </Modal>
      )}

      {/* Payment modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Record Payment"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setPayModal(null)}>Cancel</button>
          <button className="btn btn-accent" onClick={handlePayment} disabled={paying || !payForm.amount}>
            {paying ? 'Recording…' : 'Record Payment'}
          </button>
        </>}>
        <div className="form-group">
          <label className="form-label">Amount ($)</label>
          <input type="number" className="form-control" value={payForm.amount}
            onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} step="0.01" />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select className="form-control" value={payForm.paymentMethod}
            onChange={e => setPayForm(p => ({ ...p, paymentMethod: e.target.value }))}>
            <option value="CASH">Cash</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="INSURANCE">Insurance</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <input className="form-control" value={payForm.notes}
            onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
