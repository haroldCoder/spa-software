import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { InversionView } from '@/src/frontend/modules/supplies/presentation/components/inversion-view';

export const metadata: Metadata = {
  title: 'Inversión & Insumos | AuraSpa Suite',
  description:
    'Gestión interactiva de utilidades, herramientas e insumos con hoja de cálculo en tiempo real para el dueño del negocio.',
};

export default function InversionPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <InversionView />
      </div>
    </MainLayout>
  );
}
