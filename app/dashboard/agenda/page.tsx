'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import ScheduleSection from '@/components/dashboard/ScheduleSection';

function AgendaHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
      <p className="text-gray-500">
        Gestioná los turnos y la disponibilidad de la clínica
      </p>
    </motion.div>
  );
}

export default function AgendaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Calendar className="w-10 h-10 text-emerald-600 animate-pulse" />
          <p className="text-sm text-gray-500">Cargando agenda...</p>
        </div>
      }
    >
      <div className="space-y-6">
        <AgendaHeader />
        <ScheduleSection />
      </div>
    </Suspense>
  );
}
