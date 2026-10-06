'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, X, AlertTriangle, RefreshCw, Lock, LayoutDashboard, Calendar } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';
import { useCatalog } from '../../application/use-catalog';
import { ServicesHeader } from './services-header';
import { CatalogCardsGrid } from './catalog-cards-grid';
import { RegisterCatalogForm } from './register-catalog-form';

export function ServicesView() {
  const { user, isAuthenticated } = useCurrentUser();
  const isOwner = user?.role === 'BUSINESS_OWNER' || user?.userType === 'BUSINESS';

  const {
    items,
    filteredItems,
    isLoading,
    error,
    metrics,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    reload,
  } = useCatalog();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Restrict view if user is a worker
  if (isAuthenticated && !isOwner) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center px-4">
        <Card className="border-border/80 shadow-xl p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">
            Acceso Restringido
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            La administración del catálogo de servicios y productos está reservada para el propietario del spa. Como colaboradora, tu acceso está habilitado únicamente para el <strong>Panel de Control</strong> y la <strong>Agenda de Citas</strong>.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="sm" variant="default" className="w-full gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Panel del Spa</span>
              </Button>
            </Link>
            <Link href="/citas" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                <span>Ver Mis Citas</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleCreated = () => {
    setIsCreateOpen(false);
    reload();
  };

  const handleResetFilters = () => {
    setActiveTab('ALL');
    setSearchQuery('');
    setSelectedCategory('ALL');
  };

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <ServicesHeader
        metrics={metrics}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        isCreateOpen={isCreateOpen}
        onToggleCreate={() => setIsCreateOpen((prev) => !prev)}
      />

      {/* Global Fetch Error Banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => reload()} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar</span>
          </Button>
        </div>
      )}

      {/* Expandable Registration Panel */}
      {isCreateOpen && (
        <section
          id="register-service-section"
          aria-label="Formulario de registro de servicio o producto"
          className="relative overflow-hidden rounded-3xl border border-spa-rose/30 bg-card/95 p-6 sm:p-8 shadow-xl shadow-spa-rose/5 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300"
        >
          {/* Header of the Form */}
          <div className="flex items-start justify-between pb-6 mb-6 border-b border-border/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-spa-rose/15 text-spa-rose">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-semibold text-spa-rose tracking-wider uppercase">
                  Nuevo Ítem
                </span>
              </div>
              <h2 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-foreground">
                Registrar Servicio o Producto
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Define el nombre, categoría, precio, duración y sube una fotografía que se alojará en el bucket <code className="text-spa-rose font-mono">products</code>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Cerrar formulario"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <RegisterCatalogForm
            onSuccess={handleCreated}
            onCancel={() => setIsCreateOpen(false)}
          />
        </section>
      )}

      {/* Cards Grid */}
      <section aria-label="Listado de servicios y productos en tarjetas">
        <CatalogCardsGrid
          items={filteredItems}
          isLoading={isLoading}
          totalCatalogCount={items.length}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onResetFilters={handleResetFilters}
        />
      </section>
    </div>
  );
}
