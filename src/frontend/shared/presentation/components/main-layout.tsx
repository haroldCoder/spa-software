import * as React from 'react';
import { Navbar } from './navbar';
import { Sparkles, Heart } from 'lucide-react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />

      {/* Main Content Body */}
      <main className="flex-1 relative">
        {/* Subtle decorative background glow with spa palette */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-spa-rose/10 via-spa-blush/5 to-transparent -z-10 blur-3xl pointer-events-none" />

        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card/60 backdrop-blur-sm py-8 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Sparkles className="h-3.5 w-3.5 text-spa-rose" />
            <span>&copy; {new Date().getFullYear()} AuraSpa Suite. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Hecho con</span>
            <Heart className="h-3 w-3 text-spa-rose fill-spa-rose inline" />
            <span>para Spas y Salones de Belleza</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
