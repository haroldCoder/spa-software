import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { RegisterCard } from '@/src/frontend/modules/auth/presentation/components/register-card';

export const metadata: Metadata = {
  title: 'Registro - AuraSpa Management Suite',
  description: 'Regístrate como dueño de un Spa o como Trabajadora en la plataforma AuraSpa.',
};

export default function RegisterPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <RegisterCard />
      </div>
    </MainLayout>
  );
}
