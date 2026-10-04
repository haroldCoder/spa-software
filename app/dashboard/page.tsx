import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { OwnerDashboardView } from '@/src/frontend/modules/dashboard/presentation/components/owner-dashboard-view';

export const metadata: Metadata = {
  title: 'Panel del Spa - Métricas & Equipo | AuraSpa',
  description: 'Panel de control para propietarios de Spa: visualiza métricas de colaboradoras, clientes y estado operativo.',
};

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <OwnerDashboardView />
      </div>
    </MainLayout>
  );
}
