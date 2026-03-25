import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ConditionalChatbot from '@/components/ConditionalChatbot'; // Importa el nuevo componente

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ENSIGNA - Centro Médico | Tecnología y Excelencia en Salud',
  description:
    'Centro médico de vanguardia que combina excelencia profesional con tecnología avanzada para brindarte la mejor atención médica.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="w-full overflow-x-hidden">
      <body className={`${inter.className} w-full overflow-x-hidden`}>
        <AuthProvider>
          {children}
          {/* El componente ahora decide internamente si mostrarse o no */}
          <ConditionalChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}