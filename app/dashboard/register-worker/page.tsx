import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { OwnerRegisterWorkerView } from '@/src/frontend/modules/dashboard/presentation/components/owner-register-worker-view';

export const metadata: Metadata = {
  title: 'Registrar Trabajadora - AuraSpa Management Suite',
  description: 'Vincula una colaboradora o terapeuta a tu Spa con credenciales de acceso.',
};

export default function RegisterWorkerPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <OwnerRegisterWorkerView />
      </div>
    </MainLayout>
  );
}
