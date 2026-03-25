'use client';

import { motion } from 'framer-motion';
import { BarChart3, Construction } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
        <p className="text-gray-500">
          Indicadores y exportaciones (en preparación)
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-amber-600" />
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
          <Construction className="w-4 h-4" />
          Próximamente
        </div>
        <p className="text-gray-500 max-w-md mx-auto">
          Acá vas a poder ver reportes de turnos, asistencia y actividad por
          período. Por ahora usá el resumen del inicio y la agenda operativa.
        </p>
      </motion.div>
    </div>
  );
}
