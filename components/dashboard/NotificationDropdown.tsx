'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, Loader2 } from 'lucide-react';

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  onFetch: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onUnreadCountChange: (count: number) => void;
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function getNavigationForNotification(n: NotificationItem): string | null {
  const meta = n.metadata as { appointmentId?: string; patientId?: string } | null;
  if (!meta) return null;
  if (meta.appointmentId) return '/dashboard?section=schedule';
  if (meta.patientId) return `/dashboard/patients/${meta.patientId}`;
  return null;
}

export function NotificationDropdown({
  open,
  onClose,
  notifications,
  unreadCount,
  loading,
  onFetch,
  onMarkAsRead,
  onMarkAllAsRead,
  onUnreadCountChange,
}: NotificationPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      onFetch();
    }
  }, [open, onFetch]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  const handleItemClick = (n: NotificationItem) => {
    if (!n.readAt) {
      onMarkAsRead(n.id);
      onUnreadCountChange(Math.max(0, unreadCount - 1));
    }
    const href = getNavigationForNotification(n);
    if (href) router.push(href);
    onClose();
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
    onUnreadCountChange(0);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="fixed top-16 right-4 left-4 z-50 sm:left-auto sm:w-[380px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas como leídas
            </button>
          )}
        </div>
        <div className="max-h-[min(70vh,400px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8 px-4">
              No tenés notificaciones
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${
                      !n.readAt ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {!n.readAt && (
                        <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-red-500" />
                      )}
                      <div className={`flex-1 min-w-0 ${!n.readAt ? '' : 'pl-5'}`}>
                        <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
