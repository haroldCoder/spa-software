import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { ServicesView } from '@/src/frontend/modules/catalog/presentation/components/services-view';

export const metadata: Metadata = {
  title: 'Servicios & Productos - Panel del Spa | AuraSpa',
  description:
    'Visualiza en tarjetas y gestiona todos los servicios y productos de tu Spa con fotografías en Supabase Storage.',
};

export default function DashboardServiciosPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ServicesView />
      </div>
    </MainLayout>
  );
}
