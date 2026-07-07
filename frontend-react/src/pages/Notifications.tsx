import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationApi } from '@/api/services';
import type { Notification, Page } from '@/types';

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  SENT: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-700',
  CANCELLED: 'bg-gray-50 text-gray-500',
};

const typeIcon: Record<string, string> = {
  APPOINTMENT_BOOKED: '📅',
  APPOINTMENT_CONFIRMED: '✅',
  APPOINTMENT_CANCELLED: '❌',
  APPOINTMENT_REMINDER: '⏰',
  PRESCRIPTION_ISSUED: '💊',
  BILLING_INVOICE: '💰',
  PAYMENT_RECEIVED: '💳',
};

export default function Notifications() {
  const [page, setPage] = useState<Page<Notification> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    notificationApi.getAll({ size: 50, sort: 'createdAt,desc' })
      .then(({ data }) => { if (active) setPage(data); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const notifications = page?.content ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Bell size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            View all system notifications and alerts.
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-5 text-sm text-gray-600">
          No notifications found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
          {notifications.map((notification) => (
            <article key={notification.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg leading-none">{typeIcon[notification.type] || '🔔'}</span>
                    <p className="font-semibold text-gray-900 truncate">{notification.subject}</p>
                    <StatusBadge status={notification.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap break-words">
                    {notification.body}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>Channel: {notification.channel}</span>
                    <span>Type: {notification.type.replace(/_/g, ' ')}</span>
                    <span>Sent to: {notification.recipientEmail}</span>
                    {notification.sentAt && <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>}
                    {notification.errorMessage && (
                      <span className="text-red-500">Error: {notification.errorMessage}</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[status] || 'bg-gray-50 text-gray-700'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
