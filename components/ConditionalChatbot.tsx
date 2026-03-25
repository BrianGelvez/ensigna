'use client'; // Importante para usar usePathname

import { usePathname } from 'next/navigation';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function ConditionalChatbot() {
  const pathname = usePathname();

  // Define las rutas donde NO quieres que aparezca el chatbot
  // Esto cubrirá /dashboard, /dashboard/perfil, etc.
  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) return null;

  return <ChatbotWidget />;
}
