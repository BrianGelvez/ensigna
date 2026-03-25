"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  Calendar,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Sparkles,
  BarChart3,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import {
  NotificationDropdown,
  type NotificationItem,
} from "./NotificationDropdown";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  roles: string[];
  badge?: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Resumen",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/dashboard",
    roles: ["OWNER", "ADMIN", "STAFF"],
  },
  {
    id: "clinic",
    label: "Mi Clínica",
    icon: <Building2 className="w-5 h-5" />,
    href: "/dashboard?section=clinic",
    roles: ["OWNER", "ADMIN"],
  },
  {
    id: "team",
    label: "Equipo",
    icon: <Users className="w-5 h-5" />,
    href: "/dashboard?section=team",
    roles: ["OWNER", "ADMIN"],
  },
  {
    id: "invite",
    label: "Invitaciones",
    icon: <UserPlus className="w-5 h-5" />,
    href: "/dashboard?section=invite",
    roles: ["OWNER", "ADMIN"],
  },
  {
    id: "availability",
    label: "Disponibilidad",
    icon: <Clock className="w-5 h-5" />,
    href: "/dashboard?section=availability",
    roles: ["OWNER", "ADMIN", "STAFF"],
  },
  {
    id: "schedule",
    label: "Agenda",
    icon: <Calendar className="w-5 h-5" />,
    href: "/dashboard/agenda",
    roles: ["OWNER", "ADMIN", "STAFF"],
  },
  {
    id: "patients",
    label: "Pacientes",
    icon: <Users className="w-5 h-5" />,
    href: "/dashboard/patients",
    roles: ["OWNER", "ADMIN", "STAFF"],
  },
  {
    id: "finanzas",
    label: "Finanzas",
    icon: <Wallet className="w-5 h-5" />,
    href: "/dashboard/finanzas",
    roles: ["OWNER", "ADMIN", "STAFF"],
  },
  {
    id: "reports",
    label: "Reportes",
    icon: <BarChart3 className="w-5 h-5" />,
    href: "/dashboard/reports",
    roles: ["OWNER", "ADMIN", "STAFF"],
  },
  {
    id: "settings",
    label: "Configuración",
    icon: <Settings className="w-5 h-5" />,
    href: "/dashboard?section=settings",
    roles: ["OWNER", "ADMIN", "STAFF"],
  },
];

export default function DashboardLayout({
  children,
  activeSection = "overview",
}: DashboardLayoutProps) {
  const { user, clinic, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Notifications
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setNotificationLoading(true);
    try {
      const res = await apiClient.getNotifications();
      setNotifications(res.notifications);
      setNotificationUnreadCount(res.unreadCount);
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    await apiClient.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    await apiClient.markAllNotificationsAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
    setNotificationUnreadCount(0);
  }, []);

  // Initial unread count for badge
  useEffect(() => {
    apiClient
      .getNotifications()
      .then((res) => setNotificationUnreadCount(res.unreadCount))
      .catch(() => {});
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter nav items by user role
  const filteredNavItems = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role),
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "from-red-500 to-rose-600";
      case "ADMIN":
        return "from-amber-500 to-orange-600";
      case "STAFF":
        return "from-emerald-500 to-teal-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Propietario";
      case "ADMIN":
        return "Administrador";
      case "STAFF":
        return "Profesional";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen hidden lg:flex flex-col bg-white border-r border-gray-200/80 shadow-sm transition-all duration-300 ${
          isSidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/ensigna.png"
                alt="ENSIGNA"
                fill
                className="object-contain"
                priority
              />
            </div>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-gray-900"
              >
                ENSIGNA
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronRight
              className={`w-5 h-5 transition-transform duration-300 ${
                isSidebarCollapsed ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* User Profile Card */}
        <div className={`p-4 ${isSidebarCollapsed ? "px-2" : ""}`}>
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getRoleColor(
              user?.role || "",
            )} p-4 text-white ${isSidebarCollapsed ? "p-3" : ""}`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              {isSidebarCollapsed ? (
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold">
                  {user?.name?.[0]}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
                      {user?.name?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">
                        {user?.name} {user?.lastName}
                      </p>
                      <p className="text-sm text-white/80 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {getRoleName(user?.role || "")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? "bg-red-50 text-red-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } ${isSidebarCollapsed ? "justify-center" : ""}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 inset-y-2 w-1 bg-red-600 rounded-r-full"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`flex-shrink-0 ${
                        isActive
                          ? "text-red-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <>
                        <span className="font-medium flex-1 text-left">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {isSidebarCollapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Clinic Info & Logout */}
        <div className="p-4 border-t border-gray-100">
          {!isSidebarCollapsed && clinic && (
            <div className="mb-4 p-3 rounded-xl bg-gray-50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Clínica
              </p>
              <p className="font-semibold text-gray-900 truncate">
                {clinic.name}
              </p>
            </div>
          )}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors ${
              isSidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && (
              <span className="font-medium">Cerrar sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/ensigna.png"
                alt="ENSIGNA"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold text-gray-900">ENSIGNA</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 relative"
            >
              <Bell className="w-5 h-5" />
              {notificationUnreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                  {notificationUnreadCount > 99
                    ? "99+"
                    : notificationUnreadCount}
                </span>
              )}
            </button>
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRoleColor(
                user?.role || "",
              )} flex items-center justify-center text-white text-sm font-bold`}
            >
              {user?.name?.[0]}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-80 bg-white shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src="/ensigna.png"
                      alt="ENSIGNA"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    ENSIGNA
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile User Card */}
              <div className="p-4">
                <div
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getRoleColor(
                    user?.role || "",
                  )} p-4 text-white`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
                      {user?.name?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">
                        {user?.name} {user?.lastName}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-white/80">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{getRoleName(user?.role || "")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Nav */}
              <nav className="px-3 py-2 overflow-y-auto max-h-[calc(100vh-280px)]">
                <ul className="space-y-1">
                  {filteredNavItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive
                              ? "bg-red-50 text-red-600"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {item.icon}
                          <span className="font-medium flex-1 text-left">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Mobile Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                {clinic && (
                  <div className="mb-3 p-3 rounded-xl bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clínica
                    </p>
                    <p className="font-semibold text-gray-900">{clinic.name}</p>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {filteredNavItems.slice(0, 5).map((item) => {
            const isActive = activeSection === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNav"
                    className="absolute inset-0 bg-red-50 rounded-xl"
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`relative z-10 text-[10px] font-medium ${
                    isActive ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content: ancho = viewport - sidebar para no desbordar a la derecha */}
      <main
        className={`transition-all duration-300 overflow-x-hidden min-w-0 ${
          isSidebarCollapsed
            ? "lg:ml-20 lg:w-[calc(100vw-5rem)]"
            : "lg:ml-72 lg:w-[calc(100vw-18rem)]"
        } pt-16 lg:pt-0 pb-20 lg:pb-0`}
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-6 lg:px-8 h-16 bg-white border-b border-gray-200/80 min-w-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {filteredNavItems.find((item) => item.id === activeSection)
                ?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-64 pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificationUnreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                  {notificationUnreadCount > 99
                    ? "99+"
                    : notificationUnreadCount}
                </span>
              )}
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {currentTime.toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor(
                  user?.role || "",
                )} flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/20`}
              >
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content: min-w-0 para que grid/flex hijos puedan reducir y no provoquen overflow */}
        <div className="p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">{children}</div>
      </main>

      <NotificationDropdown
        open={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        unreadCount={notificationUnreadCount}
        loading={notificationLoading}
        onFetch={fetchNotifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onUnreadCountChange={setNotificationUnreadCount}
      />
    </div>
  );
}
