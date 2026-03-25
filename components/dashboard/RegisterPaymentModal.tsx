'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'OTHER';
export type PaymentSource = 'PRIVATE' | 'INSURANCE';

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface RegisterPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultPatientId: string | null;
  defaultPatientLabel?: string;
  defaultAppointmentId?: string | null;
  /** Si true, permite elegir paciente desde el listado de la clínica */
  allowPatientChange?: boolean;
}

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'OTHER', label: 'Otro' },
];

const SOURCE_OPTIONS: { value: PaymentSource; label: string; hint: string }[] = [
  { value: 'PRIVATE', label: 'Particular', hint: 'Se marca como cobrado al instante' },
  { value: 'INSURANCE', label: 'Obra social', hint: 'Queda pendiente hasta cobrar la liquidación' },
];

export default function RegisterPaymentModal({
  open,
  onClose,
  onSuccess,
  defaultPatientId,
  defaultPatientLabel,
  defaultAppointmentId,
  allowPatientChange = false,
}: RegisterPaymentModalProps) {
  const [patientId, setPatientId] = useState<string>(defaultPatientId ?? '');
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [source, setSource] = useState<PaymentSource>('PRIVATE');
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setPatientId(defaultPatientId ?? '');
    setAmount('');
    setMethod('CASH');
    setSource('PRIVATE');
    setPatientSearch('');
    setError(null);
  }, [defaultPatientId]);

  useEffect(() => {
    if (!open) return;
    resetForm();
  }, [open, resetForm]);

  useEffect(() => {
    if (open && defaultPatientId) {
      setPatientId(defaultPatientId);
    }
  }, [open, defaultPatientId]);

  useEffect(() => {
    if (!open || !allowPatientChange) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoadingPatients(true);
      try {
        const res = await apiClient.getPatients({
          limit: 50,
          q: patientSearch.trim() || undefined,
          activeFilter: 'active',
        });
        if (cancelled) return;
        const list = (res.items ?? []) as PatientOption[];
        setPatientOptions(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setPatientOptions([]);
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, allowPatientChange, patientSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const num = parseFloat(amount.replace(',', '.'));
    if (!patientId.trim()) {
      setError('Seleccioná un paciente.');
      return;
    }
    if (!Number.isFinite(num) || num <= 0) {
      setError('Ingresá un monto válido mayor a 0.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.createPayment({
        patientId: patientId.trim(),
        appointmentId: defaultAppointmentId ?? undefined,
        amount: num,
        method,
        source,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message?.toString?.() ?? 'No se pudo registrar el pago.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-payment-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 min-h-[100dvh] bg-black/50 backdrop-blur-sm"
          onClick={() => !submitting && onClose()}
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative z-10 w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 id="register-payment-title" className="text-lg font-semibold text-gray-900">
              Registrar pago
            </h2>
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {allowPatientChange ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                <input
                  type="search"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mb-2"
                />
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  required
                >
                  <option value="">Seleccionar…</option>
                  {loadingPatients && <option disabled>Cargando…</option>}
                  {patientOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Paciente</span>
                <p className="text-sm text-gray-900 font-medium py-2 px-3 rounded-xl bg-gray-50 border border-gray-100">
                  {defaultPatientLabel ?? '—'}
                </p>
              </div>
            )}

            {defaultAppointmentId && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Este pago quedará asociado al turno seleccionado.
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej: 15000"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              >
                {METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">Tipo de cobro</span>
              <div className="space-y-2">
                {SOURCE_OPTIONS.map((o) => (
                  <label
                    key={o.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      source === o.value
                        ? 'border-amber-400 bg-amber-50/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="source"
                      value={o.value}
                      checked={source === o.value}
                      onChange={() => setSource(o.value)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium text-gray-900 block">{o.label}</span>
                      <span className="text-xs text-gray-500">{o.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => !submitting && onClose()}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Guardar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
