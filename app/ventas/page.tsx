import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { SalesView } from '@/src/frontend/modules/sales/presentation/components/sales-view';

export const metadata: Metadata = {
  title: 'Ventas de Productos & Servicios | AuraSpa Suite',
  description: 'Gestión y registro de ventas de productos físicos y servicios del spa con paginación.',
};

export default function VentasPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <SalesView />
      </div>
    </MainLayout>
  );
}
