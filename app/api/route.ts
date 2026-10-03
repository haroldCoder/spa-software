import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    name: 'Spa Management API Backend',
    version: '1.0.0',
    architecture: {
      pattern: 'Clean Architecture (Modular + SOLID)',
      layers: ['domain', 'application', 'infrastructure', 'presentation'],
      database: 'Supabase (PostgreSQL)',
    },
    modules: [
      {
        name: 'Business (Negocio / Spa)',
        endpoints: [
          'GET    /api/businesses',
          'POST   /api/businesses',
          'GET    /api/businesses/:id',
          'PUT    /api/businesses/:id',
        ],
      },
      {
        name: 'Workers (Trabajadoras)',
        relationship: 'Negocio -> varias trabajadoras',
        endpoints: [
          'GET    /api/businesses/:id/workers',
          'POST   /api/businesses/:id/workers',
          'GET    /api/workers/:id',
          'PUT    /api/workers/:id',
        ],
      },
      {
        name: 'Clients (Clientes)',
        relationship: 'Trabajadoras -> clientes',
        endpoints: [
          'GET    /api/businesses/:id/clients',
          'POST   /api/businesses/:id/clients',
          'GET    /api/workers/:id/clients',
          'POST   /api/workers/:id/clients',
          'GET    /api/clients/:id',
          'PUT    /api/clients/:id',
        ],
      },
      {
        name: 'Catalog (Servicios y Productos)',
        relationship: 'Negocio -> catálogo o productos',
        endpoints: [
          'GET    /api/businesses/:id/catalog',
          'POST   /api/businesses/:id/catalog',
          'GET    /api/catalog/:id',
          'PUT    /api/catalog/:id',
          'DELETE /api/catalog/:id',
        ],
      },
    ],
  });
}
