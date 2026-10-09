import { QuickMessageTemplate } from './whatsapp.types';

export const WHATSAPP_POLLING_INTERVAL_MS = 4000;

export const WHATSAPP_API_ENDPOINTS = {
  CONVERSATIONS: '/api/whatsapp/conversations',
  CONVERSATION_MESSAGES: (conversationId: string) => `/api/whatsapp/conversations/${conversationId}/messages`,
  WEBHOOK: '/api/whatsapp/webhook',
} as const;

export const DEFAULT_QUICK_TEMPLATES: QuickMessageTemplate[] = [
  {
    id: 'confirm-appointment',
    label: 'Confirmación ✨',
    text: (name) => `¡Hola ${name || 'cliente'}! 🌸 Confirmamos con gusto tu cita en AuraSpa. ¿Nos vemos a la hora programada?`,
  },
  {
    id: 'appointment-reminder',
    label: 'Recordatorio ⏰',
    text: () => `Hola ⏰ Te recordamos tu cita agendada en AuraSpa. Por favor llega 5 minutos antes para una mejor experiencia.`,
  },
  {
    id: 'post-service-thanks',
    label: 'Agradecimiento 🌸',
    text: () => `¡Gracias por tu visita hoy! 💖 Esperamos que hayas disfrutado tu experiencia. ¿Cómo te sentiste con nuestro servicio?`,
  },
];
