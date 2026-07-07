import React from 'react';
import { cn, statusColor } from '../../utils';
import { Loader2, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', loading, icon, className, disabled, ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge: React.FC<{ status: string; label?: string }> = ({ status, label }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', statusColor(status))}>
    {label || status.replace(/_/g, ' ')}
  </span>
);

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
            icon && 'pl-9',
            error && 'border-red-400 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none',
          error && 'border-red-400',
          className
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
  <div
    className={cn('bg-white rounded-xl border border-slate-200 shadow-sm', onClick && 'cursor-pointer hover:shadow-md transition-shadow', className)}
    onClick={onClick}
  >
    {children}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard: React.FC<{
  title: string; value: string | number; icon: React.ReactNode;
  color?: string; subtitle?: string;
}> = ({ title, value, icon, color = 'blue', subtitle }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600', indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn('p-2.5 rounded-xl', colors[color] ?? colors.blue)}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = 'md' }) => {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-2xl w-full mx-4 max-h-[90vh] flex flex-col', sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

// ── Table ─────────────────────────────────────────────────────────────────────
interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}
export function Table<T extends { id: string }>({ columns, data, loading, emptyMessage = 'No records found', onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map(col => (
              <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="py-12 text-center text-slate-400">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
              </div>
            </td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-12 text-center text-slate-400">{emptyMessage}</td></tr>
          ) : data.map(row => (
            <tr
              key={row.id}
              className={cn('border-b border-slate-100 hover:bg-slate-50 transition-colors', onRowClick && 'cursor-pointer')}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(col => (
                <td key={col.key} className={cn('px-4 py-3 text-slate-700', col.className)}>
                  {col.render ? col.render(row) : (row as any)[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
interface PaginationProps { page: number; totalPages: number; onPageChange: (p: number) => void; totalElements: number; size: number; }
export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, totalElements, size }) => {
  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
      <p className="text-sm text-slate-500">Showing {from}–{to} of {totalElements}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 0}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 text-sm text-slate-600">{page + 1} / {totalPages}</span>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── SearchBar ─────────────────────────────────────────────────────────────────
export const SearchBar: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  value, onChange, placeholder = 'Search...'
}) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9 pr-4 py-2 w-full rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center justify-center py-16', className)}>
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar: React.FC<{ name: string; src?: string; size?: 'sm' | 'md' | 'lg' }> = ({ name, src, size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return src ? (
    <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size])} />
  ) : (
    <div className={cn('rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold', sizes[size])}>
      {initials}
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode }> = ({
  icon, title, description, action
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-slate-300 mb-3">{icon}</div>
    <p className="font-semibold text-slate-700">{title}</p>
    {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
