import { INITIAL_RESTAURANTS } from '../data/initialRestaurants';
import { Restaurant, Order, OrderStatus } from '../types/restaurant';

const STORAGE_KEY_RESTAURANTS = 'lav_restaurantes_data_v1';
const STORAGE_KEY_ORDERS = 'lav_restaurantes_orders_v1';
const STORAGE_KEY_ACTIVE_SLUG = 'lav_active_restaurant_slug';
const API_BASE = '/Restaurantes/api';
export const lavAuthorizedFetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  const csrf = sessionStorage.getItem('lav_restaurantes_csrf') || '';
  if (csrf) headers.set('X-LAV-CSRF', csrf);
  return fetch(input, { ...init, headers, credentials: 'same-origin' });
};


export async function uploadRestaurantImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error('La fotografía está vacía.');
  const chunkSize = 1024 * 1024;
  const total = Math.ceil(file.size / chunkSize);
  const uploadId = crypto.randomUUID();
  for (let index = 0; index < total; index++) {
    const part = file.slice(index * chunkSize, Math.min((index + 1) * chunkSize, file.size));
    const body = new FormData();
    body.append('part', part, file.name);
    body.append('uploadId', uploadId);
    body.append('index', String(index));
    body.append('total', String(total));
    body.append('size', String(file.size));
    let lastError = 'Error de transferencia';
    let completed = false;
    for (let attempt = 0; attempt < 3 && !completed; attempt++) {
      try {
        const response = await lavAuthorizedFetch('/Restaurantes/lav-media.php', { method: 'POST', body });
        const data = await apiJson<{ success: boolean; url?: string }>(response);
        if (!data.success) throw new Error('El servidor no confirmó la imagen.');
        if (index === total - 1) {
          if (!data.url) throw new Error('Falta el enlace confirmado de la imagen.');
          return data.url;
        }
        completed = true;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Error de carga';
        if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
    if (!completed) throw new Error(lastError);
  }
  throw new Error('La imagen no quedó confirmada por el servidor');
}

async function apiJson<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { /* include response details below */ }
  if (!response.ok) {
    throw new Error(data?.error || data?.detail || `Error HTTP ${response.status}: ${raw.slice(0, 180) || response.statusText}`);
  }
  if (data === null) throw new Error('El servidor no devolvió una respuesta JSON válida.');
  return data as T;
}

export class RestaurantService {
  // Load all restaurants
  static async getRestaurants(): Promise<Restaurant[]> {
    try {
      const res = await fetch(`${API_BASE}/restaurants`);
      if (res.ok) {
        const data = await apiJson<Restaurant[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          // El servidor es la fuente de verdad; no duplicar fotografías en localStorage.
          return data;
        }
      }
    } catch {
      // Backend not reached or offline, fallback to localStorage
    }

    const local = localStorage.getItem(STORAGE_KEY_RESTAURANTS);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore parse error
      }
    }

    // Seed initial
    // Los datos iniciales se usan en memoria, sin duplicarlos en el navegador.
    return INITIAL_RESTAURANTS;
  }

  // Get restaurant by slug
  static async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    const list = await this.getRestaurants();
    return list.find((r) => r.slug === slug || r.id === slug) || null;
  }

  // Save / Update restaurant
  static async saveRestaurant(restaurant: Restaurant): Promise<Restaurant> {
    const list = await this.getRestaurants();
    const index = list.findIndex((r) => r.id === restaurant.id || r.slug === restaurant.slug);
    
    const updated: Restaurant = {
      ...restaurant,
      updatedAt: new Date().toISOString(),
      version: (restaurant.version || 1) + 1,
    };

    if (index >= 0) {
      list[index] = updated;
    } else {
      list.push(updated);
    }

    const response = await lavAuthorizedFetch(`${API_BASE}/restaurants`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(list) });
    const persisted = await apiJson<Restaurant[]>(response);
    if (!Array.isArray(persisted)) throw new Error('El servidor no confirmó el guardado de la tarjeta.');
    // Persistencia confirmada por API; sin copia local de imágenes.
    const saved = persisted.find((item) => item.id === updated.id) || updated;
    return { ...saved, mercadoPagoConfig: { ...saved.mercadoPagoConfig, accessToken: restaurant.mercadoPagoConfig.accessToken } };
  }

  // Save as a brand new restaurant / template card with user-assigned names and slug
  static async saveAsNewRestaurant(
    sourceData: Restaurant,
    newName: string,
    customSlug?: string,
    customTemplateName?: string
  ): Promise<Restaurant> {
    const list = await this.getRestaurants();

    const cleanSlug = (customSlug || newName)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Ensure unique slug
    let finalSlug = cleanSlug || `restaurante-${Date.now().toString().slice(-4)}`;
    let counter = 1;
    while (list.some((r) => r.slug === finalSlug)) {
      finalSlug = `${cleanSlug}-${counter}`;
      counter++;
    }

    const newRestaurant: Restaurant = {
      ...JSON.parse(JSON.stringify(sourceData)),
      id: 'rest-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      slug: finalSlug,
      name: newName.trim() || 'Nuevo Restaurante',
      branding: {
        ...sourceData.branding,
        customTemplateName: customTemplateName?.trim() || sourceData.branding.customTemplateName,
      },
      analytics: {
        views: 0,
        whatsappClicks: 0,
        menuViews: 0,
        qrScans: 0,
        ordersCount: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    const response = await lavAuthorizedFetch(`${API_BASE}/restaurants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRestaurant) });
    const persisted = await apiJson<Restaurant>(response);
    const updatedList = [persisted, ...list.filter((item) => item.slug !== finalSlug)];
    // Persistencia confirmada por API; sin copia local de imágenes.
    localStorage.setItem(STORAGE_KEY_ACTIVE_SLUG, finalSlug);
    return { ...persisted, mercadoPagoConfig: { ...persisted.mercadoPagoConfig, accessToken: newRestaurant.mercadoPagoConfig.accessToken } };
  }

  // Duplicate restaurant
  static async duplicateRestaurant(sourceSlug: string, newName: string): Promise<Restaurant> {
    const list = await this.getRestaurants();
    const source = list.find((r) => r.slug === sourceSlug);
    if (!source) throw new Error('Restaurante original no encontrado');

    const cleanSlug = newName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newRestaurant: Restaurant = {
      ...JSON.parse(JSON.stringify(source)),
      id: 'rest-' + Date.now(),
      slug: cleanSlug || `copia-${source.slug}-${Date.now().toString().slice(-4)}`,
      name: newName,
      analytics: {
        views: 0,
        whatsappClicks: 0,
        menuViews: 0,
        qrScans: 0,
        ordersCount: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    const response = await lavAuthorizedFetch(`${API_BASE}/restaurants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRestaurant) });
    const persisted = await apiJson<Restaurant>(response);
    // No duplicar el catálogo en localStorage.
    return persisted;
  }

  // Delete restaurant
  static async deleteRestaurant(idOrSlug: string): Promise<void> {
    const list = await this.getRestaurants();
    const response = await lavAuthorizedFetch(`${API_BASE}/restaurants/${encodeURIComponent(idOrSlug)}`, { method: 'DELETE' });
    await apiJson<{success:boolean}>(response);
    const filtered = list.filter((r) => r.id !== idOrSlug && r.slug !== idOrSlug);
    // No duplicar el catálogo en localStorage.
  }

  // Record an analytical event
  static async recordEvent(slug: string, event: 'views' | 'whatsappClicks' | 'menuViews' | 'qrScans'): Promise<void> {
    const list = await this.getRestaurants();
    const item = list.find((r) => r.slug === slug);
    if (!item) return;

    if (!item.analytics) {
      item.analytics = { views: 0, whatsappClicks: 0, menuViews: 0, qrScans: 0, ordersCount: 0 };
    }
    item.analytics[event] = (item.analytics[event] || 0) + 1;
    // No duplicar el catálogo en localStorage.

    try {
      fetch(`${API_BASE}/analytics/${encodeURIComponent(slug)}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  // Active restaurant selection in Admin
  static getActiveSlug(): string {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_SLUG) || 'lumbre-alta-cocina';
  }

  static setActiveSlug(slug: string): void {
    localStorage.setItem(STORAGE_KEY_ACTIVE_SLUG, slug);
  }

  // Reset to default 20 restaurants
  static resetToDefault(): Restaurant[] {
    // Los datos iniciales se usan en memoria, sin duplicarlos en el navegador.
    return INITIAL_RESTAURANTS;
  }
}

// Order Management Service
export class OrderService {
  static async getOrders(restaurantSlug?: string): Promise<Order[]> {
    let orders: Order[] = [];
    try {
      const res = await fetch(`${API_BASE}/orders${restaurantSlug ? `?slug=${encodeURIComponent(restaurantSlug)}` : ''}`);
      if (res.ok) {
        orders = await res.json();
      }
    } catch {
      // fallback to localStorage
    }

    if (!orders || orders.length === 0) {
      const local = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (local) {
        try {
          orders = JSON.parse(local);
        } catch {
          orders = [];
        }
      }
    }

    if (restaurantSlug) {
      return orders.filter((o) => o.restaurantSlug === restaurantSlug);
    }
    return orders;
  }

  static async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: 'ord-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = await this.getOrders();
    current.unshift(newOrder);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(current));

    try {
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch {
      // offline fallback ok
    }

    return newOrder;
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const current = await this.getOrders();
    const order = current.find((o) => o.id === orderId);
    if (!order) return null;

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(current));

    try {
      await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
    } catch {
      // ok
    }

    return order;
  }
}

// Helper to generate vCard file (.vcf)
export function downloadVCard(restaurant: Restaurant) {
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:;${restaurant.name};;;
FN:${restaurant.name}
ORG:${restaurant.name}
TITLE:${restaurant.cuisineType}
NOTE:${restaurant.tagline} - ${restaurant.description}
TEL;TYPE=WORK,VOICE:${restaurant.contact.phone}
TEL;TYPE=CELL,VOICE:${restaurant.contact.whatsapp}
EMAIL;TYPE=PREF,INTERNET:${restaurant.contact.email}
ADR;TYPE=WORK:;;${restaurant.contact.address};${restaurant.contact.city};;;
URL:${restaurant.socialLinks?.website || window.location.href}
END:VCARD`;

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${restaurant.slug}-contacto.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper to generate formatted WhatsApp message
export function buildWhatsAppOrderMessage(
  restaurant: Restaurant,
  items: { name: string; quantity: number; price: number; notes?: string; variant?: string; extras?: string[] }[],
  orderType: 'pickup' | 'delivery' | 'dine_in',
  customerName: string,
  deliveryAddress?: string,
  paymentMethod?: string
): string {
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  let msg = `🍽️ *NUEVO PEDIDO DESDE TARJETA DIGITAL*\n`;
  msg += `📍 *Restaurante:* ${restaurant.name}\n\n`;
  msg += `👤 *Cliente:* ${customerName}\n`;
  msg += `📦 *Tipo de Entrega:* ${orderType === 'delivery' ? '🛵 A Domicilio' : orderType === 'pickup' ? '🛍️ Recoger en Sucursal' : '🪑 En el Establecimiento'}\n`;

  if (orderType === 'delivery' && deliveryAddress) {
    msg += `📍 *Dirección de Entrega:* ${deliveryAddress}\n`;
  }

  msg += `\n📋 *DETALLE DEL PEDIDO:*\n`;
  items.forEach((item, index) => {
    msg += `${index + 1}. *${item.quantity}x ${item.name}*`;
    if (item.variant) msg += ` (${item.variant})`;
    msg += ` — $${item.price * item.quantity} MXN\n`;
    if (item.extras && item.extras.length > 0) {
      msg += `   └ Extras: ${item.extras.join(', ')}\n`;
    }
    if (item.notes) {
      msg += `   └ Nota de cocina: "${item.notes}"\n`;
    }
  });

  msg += `\n💰 *Total Estimado:* $${subtotal} MXN\n`;
  msg += `💳 *Método de Pago Preferido:* ${paymentMethod || 'A acordar con el restaurante'}\n\n`;
  msg += `_Mensaje generado automáticamente desde la Tarjeta Digital Inteligente de LAV Digital MKT_`;

  return encodeURIComponent(msg);
}
