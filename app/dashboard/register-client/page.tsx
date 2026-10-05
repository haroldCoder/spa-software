import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { RegisterClientView } from '@/src/frontend/modules/clients/presentation/components/register-client-view';

export const metadata: Metadata = {
  title: 'Registrar Cliente - AuraSpa Management Suite',
  description: 'Vincula y gestiona la información, contacto y preferencias de un nuevo cliente en tu Spa.',
};

export default function RegisterClientPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <RegisterClientView />
      </div>
    </MainLayout>
  );
}
