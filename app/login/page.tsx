import { Metadata } from 'next';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { LoginCard } from '@/src/frontend/modules/auth/presentation/components/login-card';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - AuraSpa Management Suite',
  description: 'Inicia sesión como dueño de Spa o como Trabajadora en AuraSpa.',
};

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex items-center justify-center">
        <LoginCard />
      </div>
    </MainLayout>
  );
}
