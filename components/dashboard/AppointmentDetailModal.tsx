'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  User,
  Stethoscope,
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  XCircle,
  UserX,
  Ban,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export interface AppointmentDetail {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dni?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string | null;
  };
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Realizado',
  CANCELED: 'Cancelado',
  NO_SHOW: 'No se presentó',
};

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
  CANCELED: 'bg-gray-100 text-gray-600 border-gray-200',
  NO_SHOW: 'bg-red-100 text-red-800 border-red-200',
};

interface AppointmentDetailModalProps {
  appointmentId: string;
  onClose: () => void;
  onSuccess?: () => void;
  canEdit?: boolean;
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return `${days[date.getDay()]}, ${d} de ${months[m - 1]} de ${y}`;
}

export default function AppointmentDetailModal({
  appointmentId,
  onClose,
  onSuccess,
  canEdit = false,
}: AppointmentDetailModalProps) {
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAppointmentById(appointmentId);
      setDetail(data as AppointmentDetail);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'No se pudo cargar el turno.',
      );
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusChange = async (newStatus: string, cancelReasonValue?: string) => {
    if (!detail || !canEdit) return;
    setActionLoading(newStatus);
    setError(null);
    try {
      await apiClient.patchAppointmentStatus(detail.id, {
        status: newStatus,
        ...(newStatus === 'CANCELED' && cancelReasonValue != null && { cancelReason: cancelReasonValue }),
      });
      await fetchDetail();
      onSuccess?.();
      if (newStatus === 'CANCELED') {
        setShowCancelConfirm(false);
        setCancelReason('');
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'No se pudo actualizar el turno.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const statusStyle = detail ? STATUS_STYLES[detail.status] ?? STATUS_STYLES.SCHEDULED : '';
  const statusLabel = detail ? (STATUS_LABELS[detail.status] ?? detail.status) : '';

  const canTransition =
    canEdit &&
    detail &&
    ['SCHEDULED', 'CONFIRMED'].includes(detail.status);

  const actionsScheduled = canEdit && detail?.status === 'SCHEDULED';
  const actionsConfirmed = canEdit && detail?.status === 'CONFIRMED';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-detail-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 min-h-[100dvh] min-w-full bg-black/50 backdrop-blur-sm z-0"
          onClick={onClose}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/80">
            <h2 id="appointment-detail-title" className="text-lg font-semibold text-gray-900">
              Detalle del turno
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors touch-manipulation"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                <p className="text-sm text-gray-500">Cargando turno...</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : detail ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{formatDateLabel(detail.date)}</p>
                    <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {detail.startTime} – {detail.endTime}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusStyle}`}
                    >
                      {statusLabel}
                    </span>
                    {detail.status === 'CANCELED' && detail.cancelReason && (
                      <p className="text-xs text-gray-600 mt-2 italic">Motivo: {detail.cancelReason}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Paciente</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="font-semibold text-gray-900">
                      {detail.patient.firstName} {detail.patient.lastName}
                    </p>
                    {detail.patient.dni && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        DNI: {detail.patient.dni}
                      </p>
                    )}
                    {detail.patient.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${detail.patient.phone}`} className="text-amber-600 hover:underline">
                          {detail.patient.phone}
                        </a>
                      </p>
                    )}
                    {detail.patient.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${detail.patient.email}`} className="text-amber-600 hover:underline truncate block">
                          {detail.patient.email}
                        </a>
                      </p>
                    )}
                    {!detail.patient.dni && !detail.patient.phone && !detail.patient.email && (
                      <p className="text-sm text-gray-400">Sin datos de contacto adicionales</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Profesional</span>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900">
                      {detail.professional.firstName} {detail.professional.lastName}
                    </p>
                    {detail.professional.specialty && (
                      <p className="text-sm text-gray-600 mt-0.5">{detail.professional.specialty}</p>
                    )}
                  </div>
                </div>

                {detail.notes && (
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">Notas</span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.notes}</p>
                    </div>
                  </div>
                )}

                {/* Acciones según estado */}
                {!showCancelConfirm && canTransition && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Acciones</p>
                    {actionsScheduled && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => handleStatusChange('CONFIRMED')}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 touch-manipulation"
                        >
                          {actionLoading === 'CONFIRMED' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Confirmar turno
                        </button>
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => setShowCancelConfirm(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 touch-manipulation"
                        >
                          <Ban className="w-4 h-4" />
                          Cancelar turno
                        </button>
                      </div>
                    )}
                    {actionsConfirmed && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => handleStatusChange('COMPLETED')}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 touch-manipulation"
                        >
                          {actionLoading === 'COMPLETED' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Marcar como atendido
                        </button>
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => handleStatusChange('NO_SHOW')}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 touch-manipulation"
                        >
                          {actionLoading === 'NO_SHOW' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                          No se presentó
                        </button>
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => setShowCancelConfirm(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 touch-manipulation"
                        >
                          <Ban className="w-4 h-4" />
                          Cancelar turno
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirmación de cancelación con motivo */}
                {showCancelConfirm && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 space-y-3">
                    <p className="text-sm font-semibold text-amber-900">¿Cancelar este turno?</p>
                    <label className="block text-sm text-gray-700">
                      Motivo (opcional)
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Ej: el paciente solicitó reprogramar"
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!!actionLoading}
                        onClick={() => handleStatusChange('CANCELED', cancelReason.trim() || undefined)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 touch-manipulation"
                      >
                        {actionLoading === 'CANCELED' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Sí, cancelar
                      </button>
                      <button
                        type="button"
                        disabled={!!actionLoading}
                        onClick={() => {
                          setShowCancelConfirm(false);
                          setCancelReason('');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 touch-manipulation"
                      >
                        No, volver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/80">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
