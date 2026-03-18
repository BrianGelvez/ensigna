'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        {/* Logo + Volver al inicio */}
        <div className="flex flex-col items-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-3 mb-6"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
              <Image
                src="/ensigna.png"
                alt="ENSIGNA - Centro Médico"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              ENSIGNA
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 sm:px-8 pt-8 pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-center text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
          <div className="px-6 sm:px-8 pb-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
