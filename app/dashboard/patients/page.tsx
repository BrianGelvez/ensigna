'use client';

import { motion } from 'framer-motion';
import PatientsSection from '@/components/dashboard/PatientsSection';

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
        <p className="text-gray-500">Base de pacientes de la clínica</p>
      </motion.div>
      <PatientsSection />
    </div>
  );
}
