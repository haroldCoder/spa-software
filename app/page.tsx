import Link from 'next/link';
import { MainLayout } from '@/src/frontend/shared/presentation/components/main-layout';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  Sparkles,
  UserPlus,
  BookOpen,
  Building2,
  Users,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Building2,
      title: 'Spas & Salones',
      description: 'Gestión administrativa completa, datos fiscales y configuración para múltiples sedes.',
    },
    {
      icon: Users,
      title: 'Trabajadoras & Terapeutas',
      description: 'Cuentas independientes, cálculo automático de comisiones y asignación de clientes.',
    },
    {
      icon: CalendarCheck,
      title: 'Catálogo de Servicios & Stock',
      description: 'Control de tiempos en cabina por servicio y seguimiento de inventario de productos.',
    },
    {
      icon: ShieldCheck,
      title: 'Seguridad Hexagonal',
      description: 'Tokens JWT con sesiones persistidas en Supabase, hashing Bcrypt y roles estrictos.',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Gestión integral y elegante para tu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-spa-rose via-spa-blush to-spa-gold">
              Spa o Salón
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Plataforma moderna diseñada para la administración de terapeutas, clientes, servicios y comisiones con autenticación robusta y diseño de alta gama.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2.5 text-base shadow-lg shadow-spa-rose/25">
                <UserPlus className="h-5 w-5" />
                <span>Registrar Spa o Trabajadora</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/docs" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-base">
                <BookOpen className="h-5 w-5 text-spa-rose" />
                <span>Explorar API (Swagger)</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card
                  key={idx}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/70"
                >
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-spa-rose/10 flex items-center justify-center text-spa-rose mb-4 border border-spa-rose/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
