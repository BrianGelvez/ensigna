'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
  href?: string;
  delay?: number;
  trend?: { text: string; className: string };
}

export default function DashboardCard({
  title,
  value,
  icon,
  color,
  href,
  delay = 0,
  trend,
}: DashboardCardProps) {
  const router = useRouter();
  const isClickable = Boolean(href);

  const go = () => {
    if (!href) return;
    console.log('Dashboard click:', href);
    router.push(href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={isClickable ? go : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                go();
              }
            }
          : undefined
      }
      title={isClickable ? 'Ver detalles' : undefined}
      className={`relative bg-white rounded-2xl p-6 border border-gray-100 transition-all duration-200 ${
        isClickable
          ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:border-gray-200 active:scale-[0.98]'
          : 'shadow-sm'
      }`}
    >
      {isClickable && (
        <div className="absolute inset-0 rounded-2xl bg-black/5 opacity-0 hover:opacity-100 transition pointer-events-none" />
      )}
      <div className="relative flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend ? (
            <p className={`mt-1.5 text-sm ${trend.className}`}>{trend.text}</p>
          ) : null}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

