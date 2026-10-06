import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { AppointmentsView } from '@/src/frontend/modules/appointments/presentation/components/appointments-view';

export const metadata: Metadata = {
  title: 'Citas & Reservas | AuraSpa Suite',
  description: 'Gestión de citas paginadas para propietarios y colaboradoras del spa.',
};

export default function CitasPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <AppointmentsView />
      </div>
    </MainLayout>
  );
}
