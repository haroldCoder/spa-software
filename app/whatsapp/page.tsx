import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { WhatsAppView } from '@/src/frontend/modules/whatsapp/presentation/components/whatsapp-view';

export const metadata: Metadata = {
  title: 'WhatsApp Webhook & Captura | AuraSpa Suite',
  description: 'Recepción y visualización en tiempo real de conversaciones capturadas desde la extensión del navegador (Nombre, Teléfono y Mensaje).',
};

export default function WhatsAppPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <WhatsAppView />
      </div>
    </MainLayout>
  );
}
