export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Spa Management API',
    version: '1.0.0',
    description: `API Backend para la gestión integral de un Spa / Salón de belleza.
    
### Arquitectura y Principios
- **Arquitectura Modular**: Organizada por dominios independientes (Business, Workers, Clients, Catalog).
- **SOLID**: Principios de responsabilidad única, inversión de dependencias y segregación de interfaces.
- **Capas**: Domain, Application, Infrastructure, Presentation.
- **Base de datos**: Supabase (PostgreSQL).
- **Manejo de errores**: Respuestas estandarizadas con códigos HTTP semánticos (400 BadRequestError, 404 NotFoundError, 409 ConflictError, 500 ServerError).`,
    contact: {
      name: 'Spa Software Engineering Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local de Desarrollo',
    },
  ],
  tags: [
    {
      name: 'Autenticación (Auth)',
      description: 'Módulo de autenticación con JWT y sesiones para Spa (Administrador) y Trabajadoras',
    },
    {
      name: 'Negocio (Business)',
      description: 'Gestión de Spas / Salones y sucursales',
    },
    {
      name: 'Trabajadoras (Workers)',
      description: 'Gestión del personal del spa (masoterapeutas, estilistas, etc.)',
    },
    {
      name: 'Clientes (Clients)',
      description: 'Gestión de clientes y asignación a trabajadoras del spa',
    },
    {
      name: 'Catálogo (Catalog)',
      description: 'Servicios ofrecidos (con duración) y productos en stock (con SKU)',
    },
    {
      name: 'Citas (Appointments)',
      description: 'Gestión y reserva de citas entre usuarios (Dueño del Spa o Trabajadoras) y Clientes',
    },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Autenticación (Auth)'],
        summary: 'Registrar un nuevo Spa / Negocio',
        description: 'Crea un spa con sus credenciales maestras (email y contraseña), crea la primera sesión y retorna el JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterBusinessDTO' },
            },
          },
        },
        responses: {
          201: {
            description: 'Spa registrado exitosamente y sesión iniciada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponseDTO' },
              },
            },
          },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
          409: { description: 'Email ya registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
        },
      },
    },
    '/api/auth/business/login': {
      post: {
        tags: ['Autenticación (Auth)'],
        summary: 'Iniciar sesión como Spa / Administrador',
        description: 'Autentica al dueño o administrador del spa con email y password, genera sesión persistida y JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginBusinessDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponseDTO' },
              },
            },
          },
          401: { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
        },
      },
    },
    '/api/auth/worker/register': {
      post: {
        tags: ['Autenticación (Auth)'],
        summary: 'Registrar una nueva Trabajadora',
        description: 'Registra a una trabajadora en un spa asignándole email, contraseña y rol WORKER, creando sesión activa y retornando JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterWorkerDTO' },
            },
          },
        },
        responses: {
          201: {
            description: 'Trabajadora registrada exitosamente y sesión iniciada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponseDTO' },
              },
            },
          },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
          404: { description: 'Negocio no encontrado o inactivo', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
          409: { description: 'Email ya registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
        },
      },
    },
    '/api/auth/worker/login': {
      post: {
        tags: ['Autenticación (Auth)'],
        summary: 'Iniciar sesión como Trabajadora',
        description: 'Autentica a una trabajadora con email y password, genera sesión y JWT con rol WORKER.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginWorkerDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponseDTO' },
              },
            },
          },
          401: { description: 'Credenciales inválidas o trabajadora inactiva', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticación (Auth)'],
        summary: 'Inicio de sesión unificado',
        description: 'Endpoint inteligente que valida credenciales tanto de Administrador de Spa como de Trabajadora.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginUnifiedDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponseDTO' },
              },
            },
          },
          401: { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Autenticación (Auth)'],
        summary: 'Renovar Access Token (JWT)',
        description: 'Renueva el JWT de acceso utilizando el refreshToken (enviado en body o cookie) y rota el refreshToken.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Token renovado con éxito',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokensDTO' },
              },
            },
          },
          401: { description: 'Sesión expirada o token inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Autenticación (Auth)'],
        summary: 'Cerrar sesión',
        description: 'Revoca la sesión activa en base de datos y borra las cookies HTTP-Only de autenticación.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Sesión cerrada exitosamente' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Autenticación (Auth)'],
        summary: 'Obtener perfil del usuario autenticado',
        description: 'Retorna los datos del usuario en sesión (Spa o Trabajadora) validando el JWT y la sesión activa en BD.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil de usuario obtenido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthenticatedUserDTO' },
              },
            },
          },
          401: { description: 'No autenticado o token inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorResponse' } } } },
        },
      },
    },
    '/api/businesses': {
      get: {
        tags: ['Negocio (Business)'],
        summary: 'Listar todos los negocios',
        description: 'Obtiene el listado de negocios o spas registrados con filtro opcional por estado activo.',
        parameters: [
          {
            name: 'isActive',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filtrar por estado activo (true/false)',
          },
        ],
        responses: {
          200: {
            description: 'Lista de negocios obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/BusinessResponseDTO' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/businesses/{id}': {
      get: {
        tags: ['Negocio (Business)'],
        summary: 'Obtener negocio por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID del negocio',
          },
        ],
        responses: {
          200: {
            description: 'Negocio encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/BusinessResponseDTO' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Negocio no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Negocio (Business)'],
        summary: 'Actualizar negocio por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateBusinessDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Negocio actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/BusinessResponseDTO' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos (BadRequestError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
          404: {
            description: 'Negocio no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Negocio (Business)'],
        summary: 'Actualización parcial de negocio',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateBusinessDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Negocio actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/BusinessResponseDTO' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/businesses/{id}/workers': {
      get: {
        tags: ['Trabajadoras (Workers)'],
        summary: 'Listar trabajadoras de un negocio',
        description: 'Relación: Negocio -> varias trabajadoras.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID del negocio',
          },
          {
            name: 'isActive',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filtrar por trabajadoras activas',
          },
        ],
        responses: {
          200: {
            description: 'Lista de trabajadoras del negocio',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/WorkerResponseDTO' },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Negocio no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/workers/{id}': {
      get: {
        tags: ['Trabajadoras (Workers)'],
        summary: 'Obtener trabajadora por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Trabajadora encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/WorkerResponseDTO' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Trabajadora no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Trabajadoras (Workers)'],
        summary: 'Actualizar trabajadora por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateWorkerDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Trabajadora actualizada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/WorkerResponseDTO' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos (BadRequestError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Trabajadoras (Workers)'],
        summary: 'Actualización parcial de trabajadora',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateWorkerDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Trabajadora actualizada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/WorkerResponseDTO' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/workers/{id}/clients': {
      get: {
        tags: ['Clientes (Clients)'],
        summary: 'Listar clientes de una trabajadora',
        description: 'Relación: Trabajadoras -> clientes. Retorna los clientes atendidos o asignados a la trabajadora.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID de la trabajadora',
          },
          {
            name: 'isActive',
            in: 'query',
            schema: { type: 'boolean' },
          },
        ],
        responses: {
          200: {
            description: 'Lista de clientes de la trabajadora',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ClientResponseDTO' },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Trabajadora no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Clientes (Clients)'],
        summary: 'Crear cliente asociado a una trabajadora',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID de la trabajadora a la cual se asigna el cliente',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateClientDTO' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cliente creado y vinculado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ClientResponseDTO' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos (BadRequestError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/businesses/{id}/clients': {
      get: {
        tags: ['Clientes (Clients)'],
        summary: 'Listar todos los clientes de un negocio',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID del negocio',
          },
          {
            name: 'isActive',
            in: 'query',
            schema: { type: 'boolean' },
          },
        ],
        responses: {
          200: {
            description: 'Lista de clientes del negocio',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ClientResponseDTO' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Clientes (Clients)'],
        summary: 'Crear cliente en un negocio',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID del negocio',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateClientDTO' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cliente registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ClientResponseDTO' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/clients/{id}': {
      get: {
        tags: ['Clientes (Clients)'],
        summary: 'Obtener cliente por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Cliente encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ClientResponseDTO' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Cliente no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Clientes (Clients)'],
        summary: 'Actualizar cliente por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateClientDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Cliente actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ClientResponseDTO' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Clientes (Clients)'],
        summary: 'Actualización parcial de cliente',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateClientDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Cliente actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ClientResponseDTO' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/businesses/{id}/catalog': {
      get: {
        tags: ['Catálogo (Catalog)'],
        summary: 'Listar catálogo de un negocio',
        description: 'Relación: Negocio -> catálogo o productos. Retorna tanto servicios como productos del spa.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID del negocio',
          },
          {
            name: 'itemType',
            in: 'query',
            schema: { type: 'string', enum: ['SERVICE', 'PRODUCT'] },
            description: 'Filtrar por tipo (SERVICE o PRODUCT)',
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtrar por categoría (ej. Faciales, Masajes, Cremas)',
          },
          {
            name: 'isActive',
            in: 'query',
            schema: { type: 'boolean' },
          },
        ],
        responses: {
          200: {
            description: 'Catálogo obtenido exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CatalogItemResponseDTO' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Catálogo (Catalog)'],
        summary: 'Crear servicio o producto en el catálogo del negocio',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID del negocio',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCatalogItemDTO' },
            },
          },
        },
        responses: {
          201: {
            description: 'Artículo del catálogo registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/CatalogItemResponseDTO' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos: servicios sin duración, precios negativos, etc. (BadRequestError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/businesses/{id}/catalog/upload': {
      post: {
        tags: ['Catálogo (Catalog)'],
        summary: 'Subir imagen para producto o servicio (Bucket: products)',
        description: 'Sube un archivo de imagen en formato multipart/form-data al bucket "products" en Supabase Storage y retorna la URL pública.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID del negocio o Spa',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo de imagen (JPG, PNG, WEBP, GIF, AVIF hasta 10MB)',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Imagen subida exitosamente al bucket products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UploadCatalogImageResponseDTO' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Archivo inválido o tamaño mayor a 10MB (BadRequestError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
          401: {
            description: 'No autorizado (Token JWT requerido)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
          404: {
            description: 'Negocio no encontrado (NotFoundError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/catalog/{id}': {
      get: {
        tags: ['Catálogo (Catalog)'],
        summary: 'Obtener artículo del catálogo por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Artículo encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/CatalogItemResponseDTO' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Artículo no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Catálogo (Catalog)'],
        summary: 'Actualizar artículo del catálogo por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCatalogItemDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Artículo actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/CatalogItemResponseDTO' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos (BadRequestError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Catálogo (Catalog)'],
        summary: 'Actualización parcial de artículo del catálogo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCatalogItemDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Artículo actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/CatalogItemResponseDTO' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Catálogo (Catalog)'],
        summary: 'Eliminar artículo del catálogo por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          204: {
            description: 'Artículo eliminado exitosamente (No Content)',
          },
          404: {
            description: 'Artículo no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/catalog/upload': {
      post: {
        tags: ['Catálogo (Catalog)'],
        summary: 'Subir imagen para producto o servicio a Supabase Storage (Bucket: products)',
        description: 'Sube un archivo de imagen indicando businessId en el form-data o en la cabecera x-business-id al bucket "products" de Supabase Storage.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo de imagen del producto o servicio (ej. arreglo de uñas, corte, exfoliación, producto cosmético)',
                  },
                  businessId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID del Spa / Negocio (opcional si se incluye en header)',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Imagen subida exitosamente al bucket products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UploadCatalogImageResponseDTO' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Faltan parámetros o archivo no válido (BadRequestError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
          401: {
            description: 'No autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/appointments': {
      post: {
        tags: ['Citas (Appointments)'],
        summary: 'Reservar o agendar una nueva cita',
        description: 'Crea una cita entre usuario (dueño o trabajadora) y un cliente. Permite asignar servicio del catálogo, fecha, hora, duración y notas. Valida que no existan conflictos o solapamientos de horario para la trabajadora.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAppointmentDTO' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cita reservada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AppointmentResponseDTO' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos (BadRequestError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
          409: {
            description: 'Conflicto de horario / solapamiento (ConflictError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Citas (Appointments)'],
        summary: 'Listar citas con filtros',
        description: 'Obtiene las citas del negocio del usuario autenticado con filtros opcionales por trabajadora, cliente, estado o rango de fechas.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'workerId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar citas de una trabajadora en específico',
          },
          {
            name: 'clientId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar citas de un cliente en específico',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtrar por estado (PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)',
          },
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
            description: 'Fecha mínima de inicio',
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
            description: 'Fecha máxima de inicio',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1, minimum: 1 },
            description: 'Número de página para paginación',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
            description: 'Cantidad de registros por página',
          },
        ],
        responses: {
          200: {
            description: 'Lista paginada de citas obtenida exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/PaginatedAppointmentsResponseDTO' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/appointments/{id}': {
      get: {
        tags: ['Citas (Appointments)'],
        summary: 'Consultar cita por ID',
        description: 'Obtiene el detalle completo de una cita incluyendo información del cliente, trabajadora y servicio asociado.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Cita encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AppointmentResponseDTO' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Cita no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Citas (Appointments)'],
        summary: 'Actualizar cita por ID',
        description: 'Permite reprogramar la cita (fecha/hora), reasignar trabajadora, cambiar servicio, precio o notas.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAppointmentDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Cita actualizada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AppointmentResponseDTO' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Citas (Appointments)'],
        summary: 'Eliminar cita por ID',
        description: 'Elimina permanentemente una cita del sistema.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          204: {
            description: 'Cita eliminada exitosamente (No Content)',
          },
        },
      },
    },
    '/api/appointments/{id}/status': {
      patch: {
        tags: ['Citas (Appointments)'],
        summary: 'Cambiar estado de una cita',
        description: 'Actualiza el estado de la cita (CONFIRMED, COMPLETED, CANCELLED, NO_SHOW). Si se cancela, se puede registrar el motivo.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAppointmentStatusDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Estado de la cita actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AppointmentResponseDTO' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/businesses/{id}/appointments': {
      get: {
        tags: ['Citas (Appointments)'],
        summary: 'Listar citas del negocio',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Citas del negocio obtenidas exitosamente',
          },
        },
      },
      post: {
        tags: ['Citas (Appointments)'],
        summary: 'Agendar cita en el negocio',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAppointmentDTO' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cita agendada exitosamente',
          },
        },
      },
    },
    '/api/workers/{id}/appointments': {
      get: {
        tags: ['Citas (Appointments)'],
        summary: 'Listar citas de una trabajadora',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Citas de la trabajadora obtenidas exitosamente',
          },
        },
      },
      post: {
        tags: ['Citas (Appointments)'],
        summary: 'Agendar cita con la trabajadora',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAppointmentDTO' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cita agendada exitosamente',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CreateBusinessDTO: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', example: 'Serenity Luxury Spa' },
          legalName: { type: 'string', nullable: true, example: 'Serenity Spa SAS' },
          taxId: { type: 'string', nullable: true, example: '901234567-8' },
          email: { type: 'string', format: 'email', example: 'contacto@serenityspa.com' },
          phone: { type: 'string', nullable: true, example: '+57 300 123 4567' },
          address: { type: 'string', nullable: true, example: 'Calle 100 # 15-20' },
          city: { type: 'string', nullable: true, example: 'Bogotá' },
          country: { type: 'string', default: 'CO', example: 'CO' },
          currency: { type: 'string', default: 'COP', example: 'COP' },
        },
      },
      UpdateBusinessDTO: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          legalName: { type: 'string', nullable: true },
          taxId: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          country: { type: 'string' },
          currency: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      BusinessResponseDTO: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'b0e008cb-312f-48d6-95df-32ef093a8934' },
          name: { type: 'string', example: 'Serenity Luxury Spa' },
          legalName: { type: 'string', nullable: true },
          taxId: { type: 'string', nullable: true },
          email: { type: 'string' },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          country: { type: 'string' },
          currency: { type: 'string' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateWorkerDTO: {
        type: 'object',
        required: ['businessId', 'firstName', 'lastName', 'phone'],
        properties: {
          businessId: { type: 'string', format: 'uuid', example: 'b0e008cb-312f-48d6-95df-32ef093a8934' },
          firstName: { type: 'string', example: 'Valentina' },
          lastName: { type: 'string', example: 'Morales' },
          email: { type: 'string', format: 'email', nullable: true, example: 'valentina@serenityspa.com' },
          phone: { type: 'string', example: '+57 312 987 6543' },
          specialty: { type: 'string', nullable: true, example: 'Masoterapia y Drenaje Linfático' },
          commissionPercentage: { type: 'number', minimum: 0, maximum: 100, default: 0, example: 35.0 },
        },
      },
      UpdateWorkerDTO: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email', nullable: true },
          phone: { type: 'string' },
          specialty: { type: 'string', nullable: true },
          commissionPercentage: { type: 'number', minimum: 0, maximum: 100 },
          isActive: { type: 'boolean' },
        },
      },
      WorkerResponseDTO: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'f3a41b52-6e2c-461d-a329-873d63c5a142' },
          businessId: { type: 'string', format: 'uuid' },
          firstName: { type: 'string', example: 'Valentina' },
          lastName: { type: 'string', example: 'Morales' },
          fullName: { type: 'string', example: 'Valentina Morales' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string', example: '+57 312 987 6543' },
          specialty: { type: 'string', nullable: true },
          commissionPercentage: { type: 'number', example: 35 },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateClientDTO: {
        type: 'object',
        required: ['businessId', 'firstName', 'lastName', 'phone'],
        properties: {
          businessId: { type: 'string', format: 'uuid' },
          primaryWorkerId: { type: 'string', format: 'uuid', nullable: true, description: 'Trabajadora preferida o asignada' },
          firstName: { type: 'string', example: 'Camila' },
          lastName: { type: 'string', example: 'Restrepo' },
          email: { type: 'string', format: 'email', nullable: true, example: 'camila.restrepo@example.com' },
          phone: { type: 'string', example: '+57 320 555 1234' },
          identificationNumber: { type: 'string', nullable: true, example: '1020304050' },
          birthDate: { type: 'string', format: 'date', nullable: true, example: '1995-08-20' },
          notes: { type: 'string', nullable: true, example: 'Alergia al aceite de almendras. Prefiere masajes suaves.' },
        },
      },
      UpdateClientDTO: {
        type: 'object',
        properties: {
          primaryWorkerId: { type: 'string', format: 'uuid', nullable: true },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email', nullable: true },
          phone: { type: 'string' },
          identificationNumber: { type: 'string', nullable: true },
          birthDate: { type: 'string', format: 'date', nullable: true },
          notes: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      ClientResponseDTO: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          businessId: { type: 'string', format: 'uuid' },
          primaryWorkerId: { type: 'string', format: 'uuid', nullable: true },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          fullName: { type: 'string' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string' },
          identificationNumber: { type: 'string', nullable: true },
          birthDate: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateCatalogItemDTO: {
        type: 'object',
        required: ['businessId', 'name', 'itemType', 'price'],
        properties: {
          businessId: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Arreglo de Uñas Spa Semipermanente' },
          description: { type: 'string', nullable: true, example: 'Manicura completa, exfoliación de manos, hidratación y esmaltado semipermanente de larga duración.' },
          itemType: { type: 'string', enum: ['SERVICE', 'PRODUCT'], example: 'SERVICE' },
          category: { type: 'string', nullable: true, example: 'Uñas' },
          price: { type: 'number', minimum: 0, example: 55000.0 },
          cost: { type: 'number', minimum: 0, default: 0, example: 12000.0 },
          durationMinutes: { type: 'integer', minimum: 1, nullable: true, example: 60, description: 'Requerido para servicios' },
          stockQuantity: { type: 'integer', minimum: 0, nullable: true, example: null, description: 'Requerido para productos físicos' },
          sku: { type: 'string', nullable: true, example: null },
          imageUrl: {
            type: 'string',
            format: 'uri',
            nullable: true,
            example: 'https://xyz.supabase.co/storage/v1/object/public/products/b0e008cb-312f-48d6-95df-32ef093a8934/1728123456-unas-spa.jpg',
            description: 'URL pública de la imagen almacenada en el bucket products de Supabase Storage',
          },
        },
      },
      UpdateCatalogItemDTO: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          itemType: { type: 'string', enum: ['SERVICE', 'PRODUCT'] },
          category: { type: 'string', nullable: true },
          price: { type: 'number', minimum: 0 },
          cost: { type: 'number', minimum: 0 },
          durationMinutes: { type: 'integer', minimum: 1, nullable: true },
          stockQuantity: { type: 'integer', minimum: 0, nullable: true },
          sku: { type: 'string', nullable: true },
          imageUrl: {
            type: 'string',
            format: 'uri',
            nullable: true,
            example: 'https://xyz.supabase.co/storage/v1/object/public/products/b0e008cb-312f-48d6-95df-32ef093a8934/1728123456-unas-spa.jpg',
          },
          isActive: { type: 'boolean' },
        },
      },
      CatalogItemResponseDTO: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          businessId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          itemType: { type: 'string', enum: ['SERVICE', 'PRODUCT'] },
          category: { type: 'string', nullable: true },
          price: { type: 'number' },
          cost: { type: 'number' },
          durationMinutes: { type: 'integer', nullable: true },
          stockQuantity: { type: 'integer', nullable: true },
          sku: { type: 'string', nullable: true },
          imageUrl: { type: 'string', format: 'uri', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UploadCatalogImageResponseDTO: {
        type: 'object',
        properties: {
          imageUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://xyz.supabase.co/storage/v1/object/public/products/b0e008cb-312f-48d6-95df-32ef093a8934/1728123456-unas-spa.jpg',
          },
          fileName: {
            type: 'string',
            example: 'unas-spa.jpg',
          },
        },
      },
      RegisterBusinessDTO: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Spa Bienestar & Armonía' },
          legalName: { type: 'string', nullable: true, example: 'Bienestar S.A.S' },
          taxId: { type: 'string', nullable: true, example: '900123456-7' },
          email: { type: 'string', format: 'email', example: 'contacto@spabienestar.com' },
          password: { type: 'string', format: 'password', minLength: 6, example: 'Secret123*' },
          phone: { type: 'string', nullable: true, example: '+57 300 1234567' },
          address: { type: 'string', nullable: true, example: 'Cra 43A # 1-50' },
          city: { type: 'string', nullable: true, example: 'Medellín' },
          country: { type: 'string', default: 'CO' },
          currency: { type: 'string', default: 'COP' },
        },
      },
      RegisterWorkerDTO: {
        type: 'object',
        required: ['businessId', 'firstName', 'lastName', 'email', 'password', 'phone'],
        properties: {
          businessId: { type: 'string', format: 'uuid', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
          firstName: { type: 'string', example: 'Camila' },
          lastName: { type: 'string', example: 'Gómez' },
          email: { type: 'string', format: 'email', example: 'camila.terapeuta@spabienestar.com' },
          password: { type: 'string', format: 'password', minLength: 6, example: 'Trabajadora2026*' },
          phone: { type: 'string', example: '+57 312 9876543' },
          specialty: { type: 'string', nullable: true, example: 'Masoterapeuta & Cosmiatra' },
          commissionPercentage: { type: 'number', minimum: 0, maximum: 100, default: 0, example: 30 },
        },
      },
      LoginBusinessDTO: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'contacto@spabienestar.com' },
          password: { type: 'string', format: 'password', example: 'Secret123*' },
        },
      },
      LoginWorkerDTO: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'terapeuta@spabienestar.com' },
          password: { type: 'string', format: 'password', example: 'Trabajadora2026*' },
        },
      },
      LoginUnifiedDTO: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'contacto@spabienestar.com' },
          password: { type: 'string', format: 'password', example: 'Secret123*' },
          userType: { type: 'string', enum: ['BUSINESS', 'WORKER'], nullable: true },
        },
      },
      RefreshTokenDTO: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      AuthenticatedUserDTO: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          businessId: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['BUSINESS_OWNER', 'WORKER'] },
          userType: { type: 'string', enum: ['BUSINESS', 'WORKER'] },
        },
      },
      AuthTokensDTO: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'string', example: '2h' },
          tokenType: { type: 'string', example: 'Bearer' },
        },
      },
      AuthResponseDTO: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/AuthenticatedUserDTO' },
          tokens: { $ref: '#/components/schemas/AuthTokensDTO' },
          session: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      CreateAppointmentDTO: {
        type: 'object',
        required: ['businessId', 'clientId', 'scheduledAt'],
        properties: {
          businessId: { type: 'string', format: 'uuid', example: 'd3b07384-d113-400a-b3e3-784f183c5093' },
          clientId: { type: 'string', format: 'uuid', example: 'e7b07384-d113-400a-b3e3-784f183c5094' },
          workerId: { type: 'string', format: 'uuid', nullable: true, example: 'a1b07384-d113-400a-b3e3-784f183c5095' },
          serviceId: { type: 'string', format: 'uuid', nullable: true, example: 'c2b07384-d113-400a-b3e3-784f183c5096' },
          scheduledAt: { type: 'string', format: 'date-time', example: '2026-10-10T15:00:00Z' },
          durationMinutes: { type: 'integer', example: 60 },
          price: { type: 'number', example: 85000.0 },
          notes: { type: 'string', nullable: true, example: 'Cliente prefiere esmalte semipermanente tono pastel.' },
        },
      },
      UpdateAppointmentDTO: {
        type: 'object',
        properties: {
          workerId: { type: 'string', format: 'uuid', nullable: true },
          serviceId: { type: 'string', format: 'uuid', nullable: true },
          scheduledAt: { type: 'string', format: 'date-time', example: '2026-10-10T16:00:00Z' },
          durationMinutes: { type: 'integer', example: 90 },
          price: { type: 'number', example: 95000.0 },
          notes: { type: 'string', nullable: true },
        },
      },
      UpdateAppointmentStatusDTO: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            example: 'CONFIRMED',
          },
          cancellationReason: { type: 'string', nullable: true, example: 'El cliente canceló por viaje.' },
        },
      },
      AppointmentResponseDTO: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'f4b07384-d113-400a-b3e3-784f183c5097' },
          businessId: { type: 'string', format: 'uuid' },
          workerId: { type: 'string', format: 'uuid', nullable: true },
          clientId: { type: 'string', format: 'uuid' },
          serviceId: { type: 'string', format: 'uuid', nullable: true },
          scheduledAt: { type: 'string', format: 'date-time' },
          durationMinutes: { type: 'integer', example: 60 },
          endTime: { type: 'string', format: 'date-time' },
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            example: 'CONFIRMED',
          },
          price: { type: 'number', example: 85000.0 },
          notes: { type: 'string', nullable: true },
          cancellationReason: { type: 'string', nullable: true },
          createdById: { type: 'string', nullable: true },
          createdByRole: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          client: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string', example: 'Camila' },
              lastName: { type: 'string', example: 'Gómez' },
              phone: { type: 'string', example: '+57 310 987 6543' },
              email: { type: 'string', nullable: true, example: 'camila@gmail.com' },
            },
          },
          worker: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string', example: 'Valeria' },
              lastName: { type: 'string', example: 'Restrepo' },
              specialty: { type: 'string', nullable: true, example: 'Manicurista' },
              phone: { type: 'string', example: '+57 320 123 4567' },
            },
          },
          service: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Manicura Rusa Spa' },
              category: { type: 'string', nullable: true, example: 'Uñas' },
              price: { type: 'number', example: 85000.0 },
              durationMinutes: { type: 'integer', nullable: true, example: 60 },
              imageUrl: { type: 'string', nullable: true },
            },
          },
        },
      },
      PaginatedAppointmentsResponseDTO: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/AppointmentResponseDTO' },
          },
          total: { type: 'integer', example: 45 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean', example: true },
          hasPrevPage: { type: 'boolean', example: false },
        },
      },
      ApiErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'BadRequestError' },
              message: { type: 'string', example: 'El nombre del negocio o spa es obligatorio.' },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce el JWT de acceso devuelto en el login o registro.',
      },
    },
  },
};
