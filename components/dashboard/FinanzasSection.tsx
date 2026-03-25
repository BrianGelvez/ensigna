'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  Clock,
  AlertTriangle,
  Plus,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import RegisterPaymentModal from './RegisterPaymentModal';

type PaymentRow = {
  id: string;
  createdAt: string;
  amount: number;
  method: string;
  source: string;
  status: string;
  patient: { id: string; firstName: string; lastName: string };
  insuranceClaim?: { id: string; status: string } | null;
};

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
  OTHER: 'Otro',
};

const SOURCE_LABELS: Record<string, string> = {
  PRIVATE: 'Particular',
  INSURANCE: 'Obra social',
};

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    PENDING: 'bg-amber-100 text-amber-900 border-amber-200',
    CANCELED: 'bg-red-100 text-red-800 border-red-200',
  };
  const labels: Record<string, string> = {
    PAID: 'Cobrado',
    PENDING: 'Pendiente',
    CANCELED: 'Anulado',
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium border ${map[status] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export default function FinanzasSection() {
  const { user } = useAuth();
  const canManageStatus =
    user?.role === 'OWNER' || user?.role === 'ADMIN';

  const [summary, setSummary] = useState<{
    todayIncome: number;
    totalIncome: number;
    pendingIncome: number;
    byMethod: { CASH: number; CARD: number; TRANSFER: number; OTHER: number };
    bySource: { PRIVATE: number; INSURANCE: number };
  } | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, list] = await Promise.all([
        apiClient.getPaymentsSummary(),
        apiClient.getPayments({
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          status: filterStatus || undefined,
          source: filterSource || undefined,
        }),
      ]);
      setSummary(s);
      setPayments(Array.isArray(list) ? list : []);
    } catch {
      setSummary(null);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, filterStatus, filterSource, refreshKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePatchStatus = async (id: string, status: 'PAID' | 'CANCELED') => {
    setActionId(id);
    try {
      await apiClient.patchPaymentStatus(id, { status });
      setRefreshKey((k) => k + 1);
    } finally {
      setActionId(null);
    }
  };

  const pendingHigh = summary && summary.pendingIncome >= 100000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-amber-600" />
            Finanzas
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Ingresos, obra social y estado de cobros de tu clínica.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => setRegisterOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
          >
            <Plus className="w-4 h-4" />
            Registrar pago
          </button>
        </div>
      </div>

      {pendingHigh && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Cobros pendientes elevados</p>
            <p className="text-amber-900/90 mt-0.5">
              Hay {formatMoney(summary!.pendingIncome)} pendientes de liquidación (obra social u otros). Revisá la tabla y
              actualizá estados cuando cobren.
            </p>
          </div>
        </div>
      )}

      {loading && !summary ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Hoy
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatMoney(summary.todayIncome)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Solo cobros confirmados (PAID)</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <Wallet className="w-4 h-4" />
              Total cobrado
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatMoney(summary.totalIncome)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Histórico confirmado</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Pendiente
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-2">
              {formatMoney(summary.pendingIncome)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Incluye liquidaciones OS</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-700">Por origen (cobrado)</p>
            <p className="text-sm text-gray-600 mt-2">
              Particular:{' '}
              <span className="font-semibold text-gray-900">
                {formatMoney(summary.bySource.PRIVATE)}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Obra social:{' '}
              <span className="font-semibold text-gray-900">
                {formatMoney(summary.bySource.INSURANCE)}
              </span>
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Movimientos</h2>
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-xs text-gray-500 flex flex-col gap-1">
              Desde
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500 flex flex-col gap-1">
              Hasta
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500 flex flex-col gap-1">
              Estado
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm min-w-[130px]"
              >
                <option value="">Todos</option>
                <option value="PAID">Cobrado</option>
                <option value="PENDING">Pendiente</option>
                <option value="CANCELED">Anulado</option>
              </select>
            </label>
            <label className="text-xs text-gray-500 flex flex-col gap-1">
              Tipo
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm min-w-[130px]"
              >
                <option value="">Todos</option>
                <option value="PRIVATE">Particular</option>
                <option value="INSURANCE">Obra social</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Paciente</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                {canManageStatus && (
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={canManageStatus ? 7 : 6}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <Loader2 className="w-6 h-6 animate-spin inline text-amber-500" />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManageStatus ? 7 : 6}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No hay pagos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatDateTime(p.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.patient.firstName} {p.patient.lastName}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatMoney(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {METHOD_LABELS[p.method] ?? p.method}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {SOURCE_LABELS[p.source] ?? p.source}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    {canManageStatus && (
                      <td className="px-4 py-3 text-right">
                        {p.status === 'PENDING' && (
                          <div className="flex flex-wrap justify-end gap-1">
                            <button
                              type="button"
                              disabled={actionId === p.id}
                              onClick={() => handlePatchStatus(p.id, 'PAID')}
                              className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Cobrado
                            </button>
                            <button
                              type="button"
                              disabled={actionId === p.id}
                              onClick={() => handlePatchStatus(p.id, 'CANCELED')}
                              className="px-2 py-1 rounded-lg text-xs font-medium border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Anular
                            </button>
                          </div>
                        )}
                        {p.status === 'PAID' && p.source === 'INSURANCE' && (
                          <button
                            type="button"
                            disabled={actionId === p.id}
                            onClick={() => handlePatchStatus(p.id, 'CANCELED')}
                            className="px-2 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Anular
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterPaymentModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
        defaultPatientId={null}
        allowPatientChange
      />
    </motion.div>
  );
}
