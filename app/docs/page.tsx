'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Lock } from 'lucide-react';
import { swaggerSpec } from '@/src/docs/swagger-spec';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';

export default function SwaggerDocsPage() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const isOwner = user?.role === 'BUSINESS_OWNER' || user?.userType === 'BUSINESS';

  const initSwagger = () => {
    if (typeof window !== 'undefined' && (window as unknown as { SwaggerUIBundle?: (config: unknown) => void }).SwaggerUIBundle) {
      const SwaggerUIBundle = (window as unknown as { SwaggerUIBundle: (config: unknown) => void }).SwaggerUIBundle;
      SwaggerUIBundle({
        spec: swaggerSpec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          (window as unknown as { SwaggerUIBundle: { presets: { apis: unknown } } }).SwaggerUIBundle.presets.apis,
          (window as unknown as { SwaggerUIStandalonePreset?: unknown }).SwaggerUIStandalonePreset,
        ],
        layout: 'BaseLayout',
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
      });
    }
  };

  useEffect(() => {
    if (isOwner || !isAuthenticated) {
      initSwagger();
    }
  }, [isOwner, isAuthenticated]);

  if (!isLoading && isAuthenticated && !isOwner) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Acceso Restringido</h2>
          <p className="mt-2 text-sm text-slate-400">
            La documentación técnica de la API está reservada para la administración del spa. Como colaboradora, tu acceso está habilitado para el Panel del Spa y la Agenda de Citas.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
            >
              Panel del Spa
            </Link>
            <Link
              href="/citas"
              className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Ver Citas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Swagger UI styles */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css"
      />
      <style jsx global>{`
        .swagger-ui {
          color: #e2e8f0;
          font-family: inherit;
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-ui .info .title {
          color: #f8fafc;
        }
        .swagger-ui .info p,
        .swagger-ui .info li {
          color: #cbd5e1;
        }
        .swagger-ui .scheme-container {
          background: #1e293b;
          box-shadow: none;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .swagger-ui .opblock {
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #1e293b !important;
        }
        .swagger-ui .opblock .opblock-summary {
          border-color: rgba(255, 255, 255, 0.08);
        }
        .swagger-ui .opblock .opblock-summary-path {
          color: #f8fafc;
        }
        .swagger-ui .opblock .opblock-summary-description {
          color: #94a3b8;
        }
        .swagger-ui section.models {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: #1e293b;
        }
        .swagger-ui section.models h4 {
          color: #f8fafc;
        }
        .swagger-ui .model-box {
          background: #0f172a;
        }
        .swagger-ui .model {
          color: #e2e8f0;
        }
        .swagger-ui .prop-type {
          color: #38bdf8;
        }
        .swagger-ui table thead tr th,
        .swagger-ui table thead tr td {
          color: #94a3b8;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .swagger-ui .parameters-col_name {
          color: #f8fafc;
        }
        .swagger-ui .parameter__name {
          color: #f8fafc;
        }
        .swagger-ui .parameter__type {
          color: #38bdf8;
        }
        .swagger-ui .response-col_status {
          color: #f8fafc;
        }
        .swagger-ui textarea,
        .swagger-ui input[type='text'] {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #334155;
          border-radius: 6px;
        }
      `}</style>

      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
              Spa
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Spa Management API</h1>
              <p className="text-xs text-slate-400">OpenAPI 3.0 Documentation</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              API v1.0.0
            </span>
            <a
              href="/api/openapi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition underline"
            >
              Raw OpenAPI JSON
            </a>
          </div>
        </div>
      </header>

      {/* Swagger UI Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div id="swagger-ui" className="bg-slate-900 rounded-xl p-4 shadow-xl border border-slate-800/80" />
      </main>

      {/* Load Swagger UI Scripts */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"
        strategy="afterInteractive"
        onLoad={initSwagger}
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"
        strategy="afterInteractive"
        onLoad={initSwagger}
      />
    </div>
  );
}
