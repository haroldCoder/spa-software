import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { ServicesView } from '@/src/frontend/modules/catalog/presentation/components/services-view';

export const metadata: Metadata = {
  title: 'Servicios & Productos - Catálogo del Spa | AuraSpa',
  description:
    'Visualiza en tarjetas y gestiona todos los servicios (arreglo de uñas, faciales, masajes) y productos de belleza de tu Spa con fotografías en Supabase Storage.',
};

export default function ServiciosPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ServicesView />
      </div>
    </MainLayout>
  );
}
