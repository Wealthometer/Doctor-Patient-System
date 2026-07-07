import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { billingApi, patientApi } from '../../api/services';
import {
  Table, Badge, Button, Modal, Input, Select, Textarea,
  Pagination, Card, StatCard, EmptyState,
} from '../../components/common';
import { formatDate, formatCurrency } from '../../utils';
import { useAppSelector } from '../../hooks/redux';
import { Plus, RefreshCw, Eye, XCircle, CreditCard, Trash2, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import type { InvoiceResponse, BillingStatsResponse, CreateInvoiceRequest, RecordPaymentRequest, PatientResponse, InvoiceStatus } from '../../types';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online' },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const BillingPage: React.FC = () => {
  const user = useAppSelector(s => s.auth.user);
  const [searchParams] = useSearchParams();
  const filterPatientId = searchParams.get('patientId');

  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR';
  const isPatient = user?.role === 'PATIENT';

  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<BillingStatsResponse | null>(null);
  const [selected, setSelected] = useState<InvoiceResponse | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showPayment, setShowPayment] = useState<InvoiceResponse | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [myPatient, setMyPatient] = useState<PatientResponse | null>(null);

  const { register: invReg, control: invControl, handleSubmit: invSubmit, reset: invReset, watch: invWatch } = useForm<CreateInvoiceRequest>({
    defaultValues: { lineItems: [{ description: '', quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control: invControl, name: 'lineItems' as any });
  const lineItems = invWatch('lineItems');

  const { register: payReg, handleSubmit: paySubmit, reset: payReset } = useForm<RecordPaymentRequest>();

  // Compute subtotal live
  const subtotal = lineItems?.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0) ?? 0;

  useEffect(() => {
    if (isPatient && user) patientApi.getByUserId(user.id).then(setMyPatient).catch(() => {});
  }, [user, isPatient]);

  useEffect(() => {
    if (isAdmin) billingApi.getStats().then(setStats).catch(() => {});
  }, [isAdmin]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (filterPatientId) {
        res = await billingApi.getPatientInvoices(filterPatientId, page);
      } else if (isPatient && myPatient) {
        res = await billingApi.getPatientInvoices(myPatient.id, page);
      } else if (statusFilter && isAdmin) {
        res = await billingApi.getByStatus(statusFilter as InvoiceStatus, page);
      } else if (isAdmin) {
        res = await billingApi.getAllInvoices(page);
      } else {
        res = { content: [], totalElements: 0 };
      }
      setInvoices(res.content);
      setTotal(res.totalElements);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  }, [page, myPatient, filterPatientId, isPatient, isAdmin, statusFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleCreate = async (data: CreateInvoiceRequest) => {
    setCreateLoading(true);
    try {
      await billingApi.createInvoice(data);
      toast.success('Invoice created');
      setShowCreate(false);
      invReset();
      fetchInvoices();
      if (isAdmin) billingApi.getStats().then(setStats).catch(() => {});
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create invoice');
    } finally { setCreateLoading(false); }
  };

  const handlePayment = async (data: RecordPaymentRequest) => {
    if (!showPayment) return;
    setPaymentLoading(true);
    try {
      const updated = await billingApi.recordPayment(showPayment.id, { ...data, amount: Number(data.amount) });
      toast.success('Payment recorded');
      setShowPayment(null);
      payReset();
      fetchInvoices();
      if (selected?.id === updated.id) setSelected(updated);
      if (isAdmin) billingApi.getStats().then(setStats).catch(() => {});
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to record payment');
    } finally { setPaymentLoading(false); }
  };

  const handleCancelInvoice = async (id: string) => {
    if (!confirm('Cancel this invoice?')) return;
    try {
      await billingApi.cancelInvoice(id);
      toast.success('Invoice cancelled');
      setSelected(null);
      fetchInvoices();
    } catch { toast.error('Failed to cancel invoice'); }
  };

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #', render: (inv: InvoiceResponse) => <span className="font-mono text-xs text-slate-500">{inv.invoiceNumber}</span> },
    { key: 'patientName', header: 'Patient', render: (inv: InvoiceResponse) => <span className="text-sm font-medium">{inv.patientName}</span> },
    { key: 'invoiceDate', header: 'Date', render: (inv: InvoiceResponse) => <span className="text-sm">{formatDate(inv.invoiceDate)}</span> },
    { key: 'dueDate', header: 'Due', render: (inv: InvoiceResponse) => <span className="text-sm">{formatDate(inv.dueDate)}</span> },
    {
      key: 'totalAmount', header: 'Total',
      render: (inv: InvoiceResponse) => <span className="text-sm font-semibold">{formatCurrency(inv.totalAmount)}</span>,
    },
    {
      key: 'balance', header: 'Balance',
      render: (inv: InvoiceResponse) => (
        <span className={`text-sm font-semibold ${inv.balanceAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {formatCurrency(inv.balanceAmount)}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (inv: InvoiceResponse) => <Badge status={inv.status} /> },
    {
      key: 'actions', header: '',
      render: (inv: InvoiceResponse) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelected(inv)}>View</Button>
          {(isAdmin || isPatient) && ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status) && (
            <Button variant="ghost" size="sm" icon={<DollarSign className="w-3.5 h-3.5" />}
              className="text-emerald-600 hover:bg-emerald-50" onClick={() => setShowPayment(inv)}>
              Pay
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Invoices</h1>
          <p className="text-slate-500 text-sm">{total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchInvoices}>Refresh</Button>
          {(isAdmin || isDoctor) && (
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowCreate(true)}>New Invoice</Button>
          )}
        </div>
      </div>

      {/* Stats for admin */}
      {isAdmin && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<TrendingUp className="w-5 h-5" />} color="green" />
          <StatCard title="Pending Amount" value={formatCurrency(stats.pendingAmount)} icon={<AlertCircle className="w-5 h-5" />} color="yellow" />
          <StatCard title="Paid Invoices" value={stats.paidInvoices} icon={<CheckCircle className="w-5 h-5" />} color="blue" />
          <StatCard title="Overdue" value={stats.overdueInvoices} icon={<XCircle className="w-5 h-5" />} color="red" />
        </div>
      )}

      <Card>
        {isAdmin && (
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_FILTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        )}
        {invoices.length === 0 && !loading ? (
          <EmptyState
            icon={<CreditCard className="w-12 h-12" />}
            title="No invoices found"
            description="Invoices will appear here once created."
            action={(isAdmin || isDoctor) ? <Button size="sm" onClick={() => setShowCreate(true)}>Create Invoice</Button> : undefined}
          />
        ) : (
          <>
            <Table columns={columns} data={invoices} loading={loading} onRowClick={setSelected} />
            {total > 20 && <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} totalElements={total} size={20} />}
          </>
        )}
      </Card>

      {/* Invoice detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Invoice Details" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Invoice Number</p>
                <p className="font-mono font-semibold text-slate-900">{selected.invoiceNumber}</p>
              </div>
              <Badge status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Patient', selected.patientName],
                ['Invoice Date', formatDate(selected.invoiceDate)],
                ['Due Date', formatDate(selected.dueDate)],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Line items */}
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Line Items</p>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Description', 'Qty', 'Unit Price', 'Total'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lineItems?.map((item, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 font-medium">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(selected.subtotal)}</span></div>
              {selected.tax > 0 && <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{formatCurrency(selected.tax)}</span></div>}
              {selected.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatCurrency(selected.discount)}</span></div>}
              <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-2 mt-2">
                <span>Total</span><span>{formatCurrency(selected.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600"><span>Paid</span><span>{formatCurrency(selected.paidAmount)}</span></div>
              <div className="flex justify-between font-semibold text-red-600"><span>Balance Due</span><span>{formatCurrency(selected.balanceAmount)}</span></div>
            </div>

            {/* Payment history */}
            {selected.payments && selected.payments.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Payment History</p>
                <div className="space-y-2">
                  {selected.payments.map((pay, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-2">
                        <Badge status={pay.paymentStatus} />
                        <span className="text-slate-600">{pay.paymentMethod.replace(/_/g, ' ')}</span>
                        {pay.transactionId && <span className="text-xs text-slate-400 font-mono">#{pay.transactionId}</span>}
                      </div>
                      <span className="font-semibold text-emerald-700">{formatCurrency(pay.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              {(isAdmin || isPatient) && ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(selected.status) && (
                <Button size="sm" icon={<DollarSign className="w-3.5 h-3.5" />}
                  className="text-white" onClick={() => { setShowPayment(selected); setSelected(null); }}>
                  Record Payment
                </Button>
              )}
              {isAdmin && !['CANCELLED', 'PAID'].includes(selected.status) && (
                <Button size="sm" variant="danger" icon={<XCircle className="w-3.5 h-3.5" />}
                  onClick={() => handleCancelInvoice(selected.id)}>
                  Cancel Invoice
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create invoice modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); invReset(); }} title="Create Invoice" size="xl">
        <form onSubmit={invSubmit(handleCreate)} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Patient ID" {...invReg('patientId', { required: 'Required' })} placeholder="UUID" />
            <Input label="Appointment ID (optional)" {...invReg('appointmentId')} placeholder="UUID" />
            <Input label="Due Date" type="date" {...invReg('dueDate')} className="col-span-1" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">Line Items</label>
              <Button type="button" size="sm" variant="outline" icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 } as any)}>
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    {i === 0 && <label className="text-xs text-slate-500 font-medium block mb-1">Description</label>}
                    <input {...invReg(`lineItems.${i}.description` as any, { required: true })}
                      placeholder="Service description"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="text-xs text-slate-500 font-medium block mb-1">Qty</label>}
                    <input type="number" {...invReg(`lineItems.${i}.quantity` as any, { valueAsNumber: true })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="text-xs text-slate-500 font-medium block mb-1">Unit Price ($)</label>}
                    <input type="number" step="0.01" {...invReg(`lineItems.${i}.unitPrice` as any, { valueAsNumber: true })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <button type="button" onClick={() => remove(i)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right text-sm font-semibold text-slate-700">
              Estimated Total: {formatCurrency(subtotal)}
            </div>
          </div>

          <Textarea label="Notes (optional)" {...invReg('notes')} placeholder="Additional billing notes..." />

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => { setShowCreate(false); invReset(); }}>Cancel</Button>
            <Button type="submit" loading={createLoading} icon={<CreditCard className="w-4 h-4" />}>Create Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Record payment modal */}
      <Modal open={!!showPayment} onClose={() => { setShowPayment(null); payReset(); }} title="Record Payment" size="sm">
        {showPayment && (
          <form onSubmit={paySubmit(handlePayment)} className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-3 text-sm border border-blue-100">
              <p className="text-slate-600">Balance due:</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(showPayment.balanceAmount)}</p>
            </div>
            <Input label="Amount ($)" type="number" step="0.01" {...payReg('amount', { required: 'Required', valueAsNumber: true })}
              placeholder="0.00" />
            <Select label="Payment Method" options={PAYMENT_METHODS} {...payReg('paymentMethod', { required: 'Required' })} />
            <Input label="Transaction ID (optional)" {...payReg('transactionId')} placeholder="e.g. TXN-12345" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => { setShowPayment(null); payReset(); }}>Cancel</Button>
              <Button type="submit" loading={paymentLoading} icon={<DollarSign className="w-4 h-4" />}>Record Payment</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
