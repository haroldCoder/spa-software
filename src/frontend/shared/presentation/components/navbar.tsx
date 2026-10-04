'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Menu,
  X,
  BookOpen,
  UserPlus,
  LogIn,
  LogOut,
  LayoutDashboard,
  User,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoggingOut } = useCurrentUser();

  const isOwner = user?.role === 'BUSINESS_OWNER' || user?.userType === 'BUSINESS';

  const navLinks = [
    { href: '/', label: 'Inicio' },
    ...(isAuthenticated && isOwner
      ? [{ href: '/dashboard', label: 'Panel del Spa', icon: LayoutDashboard }]
      : []),
    { href: '/docs', label: 'Documentación API', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group transition-transform active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-spa-rose to-spa-blush text-white shadow-md shadow-spa-rose/25 group-hover:shadow-spa-rose/40 transition-shadow">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                AuraSpa
              </span>
              <Badge variant="spa" className="text-[10px] px-1.5 py-0 font-semibold">
                PRO
              </Badge>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground -mt-1 tracking-wider uppercase">
              Management Suite
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA / Profile section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/70 text-xs">
                <div className="h-6 w-6 rounded-full bg-spa-rose/15 text-spa-rose flex items-center justify-center font-bold text-[11px]">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground truncate max-w-[130px] leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {isOwner ? 'Dueño del Spa' : 'Trabajadora'}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}</span>
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar Sesión</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Registrarse</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-base font-medium ${
                  pathname === link.href
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-accent/40 border border-border text-sm">
                  <div className="h-8 w-8 rounded-full bg-spa-rose/15 text-spa-rose flex items-center justify-center font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  disabled={isLoggingOut}
                  className="w-full gap-2 justify-center text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 justify-center">
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gap-2 justify-center">
                    <UserPlus className="h-4 w-4" />
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
