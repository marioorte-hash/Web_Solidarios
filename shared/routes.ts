import { z } from 'zod';
import { insertContactMessageSchema, news, activities, products } from './schema';

export const api = {
  contact: {
    submit: {
      method: 'POST' as const,
      path: '/api/contact',
      input: insertContactMessageSchema,
      responses: {
        200: z.object({ success: z.boolean() }),
        400: z.object({ message: z.string() })
      }
    }
  },
  news: {
    list: {
      method: 'GET' as const,
      path: '/api/news',
      responses: {
        200: z.array(z.custom<typeof news.$inferSelect>())
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/news/:id',
      responses: {
        200: z.custom<typeof news.$inferSelect>(),
        404: z.object({ message: z.string() })
      }
    }
  },
  activities: {
    list: {
      method: 'GET' as const,
      path: '/api/activities',
      responses: {
        200: z.array(z.custom<typeof activities.$inferSelect>())
      }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>())
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
    }
  },
  auth: {
    me: { method: 'GET' as const, path: '/api/auth/me' },
    login: { method: 'POST' as const, path: '/api/auth/login' },
    register: { method: 'POST' as const, path: '/api/auth/register' },
    logout: { method: 'POST' as const, path: '/api/auth/logout' },
  },
  cart: {
    get: { method: 'GET' as const, path: '/api/cart' },
    add: { method: 'POST' as const, path: '/api/cart' },
    update: { method: 'PUT' as const, path: '/api/cart/:id' },
    remove: { method: 'DELETE' as const, path: '/api/cart/:id' },
    clear: { method: 'DELETE' as const, path: '/api/cart' },
  },
  orders: {
    create: { method: 'POST' as const, path: '/api/orders' },
    list: { method: 'GET' as const, path: '/api/orders' },
  },
  search: {
    query: { method: 'GET' as const, path: '/api/search' },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
