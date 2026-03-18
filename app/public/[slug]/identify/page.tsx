'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Loader2, AlertCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { apiClient } from '@/lib/api';

type TabId = 'identify' | 'new';

export default function IdentifyPatientPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;
  const [activeTab, setActiveTab] = useState<TabId>('identify');
  const [identifier, setIdentifier] = useState('');
  const [fullForm, setFullForm] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicInfo, setClinicInfo] = useState<{
    name: string;
    address?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!slug) return;
    apiClient
      .getPublicClinicInfo(slug)
      .then((data) => setClinicInfo(data))
      .catch(() => {
        setError('Clínica no encontrada.');
      });
  }, [slug]);

  const handleIdentifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = identifier.trim();
    if (!value) {
      setError('Ingresá tu DNI, teléfono o email para identificarte.');
      return;
    }
    if (!slug) return;
    const isEmail = value.includes('@');
    const payload: Parameters<typeof apiClient.identifyPatientPublic>[0] = {
      clinicSlug: slug,
      ...(isEmail ? { email: value } : { dni: value, phone: value }),
    };
    setSubmitting(true);
    try {
      const result = await apiClient.identifyPatientPublic(payload);
      sessionStorage.setItem('publicPatientId', result.patientId);
      sessionStorage.setItem('publicClinicId', result.clinicId);
      sessionStorage.setItem('publicClinicSlug', slug);
      if (result.patient) {
        sessionStorage.setItem('publicPatientData', JSON.stringify(result.patient));
      }
      sessionStorage.setItem('publicPatientIsNew', 'false'); // Identificado, no creado
      router.push(`/public/${slug}/agenda`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al identificar.';
      setError(
        msg.includes('No encontramos')
          ? 'No te encontramos con esos datos. Completá el formulario "Nuevo paciente" para registrarte.'
          : msg,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFullFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullForm.firstName.trim() || !fullForm.lastName.trim()) {
      setError('Nombre y apellido son obligatorios.');
      return;
    }
    if (!slug) return;
    setSubmitting(true);
    try {
      const result = await apiClient.identifyPatientPublic({
        clinicSlug: slug,
        firstName: fullForm.firstName.trim(),
        lastName: fullForm.lastName.trim(),
        dni: fullForm.dni.trim() || undefined,
        phone: fullForm.phone.trim() || undefined,
        email: fullForm.email.trim() || undefined,
      });
      sessionStorage.setItem('publicPatientId', result.patientId);
      sessionStorage.setItem('publicClinicId', result.clinicId);
      sessionStorage.setItem('publicClinicSlug', slug);
      if (result.patient) {
        sessionStorage.setItem('publicPatientData', JSON.stringify(result.patient));
      }
      sessionStorage.setItem('publicPatientIsNew', result.isNewPatient ? 'true' : 'false');
      router.push(`/public/${slug}/agenda`);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Error al registrarte.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!slug) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 pb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {clinicInfo?.name ?? 'Reservar Turno'}
            </h1>
            <p className="text-sm text-gray-600 text-center">
              Si ya sos paciente de esta clínica, ingresá tu DNI, email o teléfono y te identificamos. Si es la primera vez, completá el formulario.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('identify');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === 'identify'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Ya soy paciente
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('new');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === 'new'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Nuevo paciente
            </button>
          </div>

          <div className="p-6 sm:p-8 pt-5">
            <AnimatePresence mode="wait">
              {activeTab === 'identify' ? (
                <motion.form
                  key="identify"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleIdentifySubmit}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-600 mb-4">
                    Ingresá tu DNI, teléfono o email y te identificaremos.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DNI, teléfono o email
                    </label>
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[48px]"
                      placeholder=""
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-800">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 inline-flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Identificarme
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="new"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleFullFormSubmit}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-600 mb-4">
                    Completá el formulario para registrarte como paciente y elegir un turno.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={fullForm.firstName}
                      onChange={(e) => setFullForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[48px]"
                      placeholder="Ej. Juan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={fullForm.lastName}
                      onChange={(e) => setFullForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[48px]"
                      placeholder="Ej. Pérez"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DNI
                    </label>
                    <input
                      type="text"
                      value={fullForm.dni}
                      onChange={(e) => setFullForm((f) => ({ ...f, dni: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[48px]"
                      placeholder="Ej. 12345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={fullForm.phone}
                      onChange={(e) => setFullForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[48px]"
                      placeholder="Ej. +54 11 1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={fullForm.email}
                      onChange={(e) => setFullForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[48px]"
                      placeholder="Ej. juan@email.com"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-800">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 inline-flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Registrarme y continuar
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
