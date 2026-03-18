'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Building2,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {changeType === 'positive' ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : changeType === 'negative' ? (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  changeType === 'positive'
                    ? 'text-emerald-600'
                    : changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function OverviewSection() {
  const { user, clinic } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'OWNER':
        return [
          {
            title: 'Profesionales',
            value: '8',
            change: '+2 este mes',
            changeType: 'positive' as const,
            icon: <Users className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
          },
          {
            title: 'Turnos Hoy',
            value: '24',
            change: '+15% vs ayer',
            changeType: 'positive' as const,
            icon: <Calendar className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
          },
          {
            title: 'Tasa Asistencia',
            value: '94%',
            change: '+3% este mes',
            changeType: 'positive' as const,
            icon: <Activity className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
          },
          {
            title: 'Ingresos Mensuales',
            value: '$1.2M',
            change: '+8% vs mes anterior',
            changeType: 'positive' as const,
            icon: <TrendingUp className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-amber-500 to-amber-600',
          },
        ];
      case 'ADMIN':
        return [
          {
            title: 'Profesionales Activos',
            value: '8',
            icon: <Users className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
          },
          {
            title: 'Turnos Hoy',
            value: '24',
            change: '+15% vs ayer',
            changeType: 'positive' as const,
            icon: <Calendar className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
          },
          {
            title: 'Pendientes',
            value: '3',
            icon: <Clock className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-amber-500 to-amber-600',
          },
          {
            title: 'Tasa Asistencia',
            value: '94%',
            change: '+3%',
            changeType: 'positive' as const,
            icon: <Activity className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
          },
        ];
      case 'STAFF':
        return [
          {
            title: 'Mis Turnos Hoy',
            value: '6',
            icon: <Calendar className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
          },
          {
            title: 'Próximo Turno',
            value: '10:30',
            icon: <Clock className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
          },
          {
            title: 'Pacientes Atendidos',
            value: '128',
            change: 'este mes',
            changeType: 'neutral' as const,
            icon: <UserCheck className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
          },
          {
            title: 'Tasa Asistencia',
            value: '96%',
            change: '+2%',
            changeType: 'positive' as const,
            icon: <Activity className="w-6 h-6 text-white" />,
            color: 'bg-gradient-to-br from-amber-500 to-amber-600',
          },
        ];
      default:
        return [];
    }
  };

  const stats = getRoleSpecificStats();

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-rose-800 p-6 sm:p-8 text-white"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-rose-500/30 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-medium text-white/80">
                  {new Date().toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {getGreeting()}, {user?.name}
              </h1>
              <p className="mt-2 text-white/80 max-w-lg">
                {user?.role === 'OWNER'
                  ? 'Aquí tienes un resumen de la actividad de tu clínica.'
                  : user?.role === 'ADMIN'
                  ? 'Gestiona la operación diaria de la clínica.'
                  : 'Revisa tu agenda y gestiona tus turnos del día.'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/70">Clínica</p>
                <p className="font-semibold text-lg">{clinic?.name || 'ENSIGNA'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 min-w-0 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones rápidas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
            {[
              { label: 'Nuevo turno', icon: Calendar, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
              { label: 'Ver agenda', icon: Clock, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
              { label: 'Pacientes', icon: Users, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
              { label: 'Reportes', icon: TrendingUp, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
            ].map((action) => (
              <button
                key={action.label}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="min-w-0 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad reciente
          </h3>
          <div className="space-y-4">
            {[
              { text: 'Nuevo turno confirmado', time: 'Hace 5 min', type: 'success' },
              { text: 'Paciente canceló turno', time: 'Hace 15 min', type: 'warning' },
              { text: 'Dr. López actualizó horarios', time: 'Hace 1 hora', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'success'
                      ? 'bg-emerald-500'
                      : activity.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="min-w-0 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Próximos turnos</h3>
          <button className="text-sm font-medium text-red-600 hover:text-red-700">
            Ver todos
          </button>
        </div>
        <div className="overflow-x-auto -mx-6 px-6 scrollbar-thin">
          <div className="flex gap-4 min-w-max pb-2">
            {[
              { time: '09:00', patient: 'María García', type: 'Consulta general', status: 'confirmed' },
              { time: '09:30', patient: 'Juan Pérez', type: 'Control', status: 'pending' },
              { time: '10:00', patient: 'Ana López', type: 'Primera visita', status: 'confirmed' },
              { time: '10:30', patient: 'Carlos Ruiz', type: 'Seguimiento', status: 'confirmed' },
              { time: '11:00', patient: 'Laura Martín', type: 'Consulta', status: 'pending' },
            ].map((appointment, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-48 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    {appointment.time}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      appointment.status === 'confirmed'
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
                <p className="font-medium text-gray-900 truncate">
                  {appointment.patient}
                </p>
                <p className="text-sm text-gray-500 truncate">{appointment.type}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
