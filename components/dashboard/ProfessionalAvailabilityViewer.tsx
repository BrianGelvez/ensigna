'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2, AlertCircle, Stethoscope, Search } from 'lucide-react';
import { apiClient } from '@/lib/api';
import AvailabilitySection from './AvailabilitySection';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  userId?: string;
  managedByClinic?: boolean;
}

export default function ProfessionalAvailabilityViewer() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getProfessionals();
      const list = Array.isArray(data) ? data : [];
      setProfessionals(list);
      if (list.length > 0) {
        setSelectedProfessionalId((prev) =>
          prev && list.some((p: Professional) => p.id === prev) ? prev : list[0].id
        );
      }
    } catch (err: unknown) {
      setError('Error al cargar profesionales.');
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedProfessional = professionals.find((p) => p.id === selectedProfessionalId);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-center"
      >
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      </motion.div>
    );
  }

  if (professionals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sin profesionales
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Agregá profesionales en la sección Equipo. Podés gestionar la disponibilidad de todos (con o sin cuenta de usuario).
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Seleccionar profesional</h3>
              <p className="text-sm text-gray-500">
                {professionals.length} profesional{professionals.length !== 1 ? 'es' : ''}. Gestioná horarios con o sin cuenta.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {professionals.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setSelectedProfessionalId(prof.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  selectedProfessionalId === prof.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                  selectedProfessionalId === prof.id
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}>
                  {prof.firstName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium truncate ${
                    selectedProfessionalId === prof.id ? 'text-indigo-900' : 'text-gray-900'
                  }`}>
                    Dr. {prof.firstName} {prof.lastName}
                  </p>
                  <p className={`text-sm truncate ${
                    selectedProfessionalId === prof.id ? 'text-indigo-600' : 'text-gray-500'
                  }`}>
                    {prof.specialty || 'Sin especialidad'}
                    {prof.userId ? ' · Con cuenta' : prof.managedByClinic ? ' · Gestionado por la clínica' : ' · Pendiente'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Selected Professional Info */}
      {selectedProfessional && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {selectedProfessional.firstName[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Dr. {selectedProfessional.firstName} {selectedProfessional.lastName}
              </h3>
              <p className="text-white/80">
                {selectedProfessional.specialty || 'Sin especialidad asignada'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Availability */}
      {selectedProfessionalId && (
        <motion.div
          key={selectedProfessionalId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AvailabilitySection professionalId={selectedProfessionalId} />
        </motion.div>
      )}
    </div>
  );
}
