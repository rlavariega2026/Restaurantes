import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure server data directory exists for persistent JSON storage
const DATA_DIR = path.join(__dirname, 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const RESTAURANTS_FILE = path.join(DATA_DIR, 'restaurants.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

import { INITIAL_RESTAURANTS } from './src/data/initialRestaurants.ts';

// Helper to read / write restaurants JSON
function readRestaurants(): any[] {
  try {
    if (fs.existsSync(RESTAURANTS_FILE)) {
      const data = fs.readFileSync(RESTAURANTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading restaurants file:', err);
  }
  // Auto-seed with default 20 restaurants
  writeRestaurants(INITIAL_RESTAURANTS);
  return INITIAL_RESTAURANTS;
}

function writeRestaurants(list: any[]) {
  try {
    fs.writeFileSync(RESTAURANTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving restaurants file:', err);
  }
}

// Helper to read / write orders JSON
function readOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return [];
}

function writeOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving orders file:', err);
  }
}

// REST API ENDPOINTS

// 1. GET /api/restaurants
app.get('/api/restaurants', (req, res) => {
  const list = readRestaurants();
  res.json(list);
});

// 2. GET /api/restaurants/:slug
app.get('/api/restaurants/:slug', (req, res) => {
  const list = readRestaurants();
  const found = list.find((r) => r.slug === req.params.slug || r.id === req.params.slug);
  if (!found) {
    return res.status(404).json({ error: 'Restaurante no encontrado' });
  }
  res.json(found);
});

// 3. POST /api/restaurants
app.post('/api/restaurants', (req, res) => {
  const restaurant = req.body;
  if (!restaurant || !restaurant.name) {
    return res.status(400).json({ error: 'Nombre comercial requerido' });
  }
  const list = readRestaurants();
  list.unshift(restaurant);
  writeRestaurants(list);
  res.status(201).json(restaurant);
});

// 4. PUT /api/restaurants/:slug
app.put('/api/restaurants/:slug', (req, res) => {
  const updated = req.body;
  const list = readRestaurants();
  const index = list.findIndex(
    (r) => r.slug === req.params.slug || r.id === req.params.slug || (updated && updated.id && r.id === updated.id)
  );
  if (index >= 0) {
    list[index] = { ...list[index], ...updated, updatedAt: new Date().toISOString() };
  } else {
    list.push(updated);
  }
  writeRestaurants(list);
  res.json(updated);
});

// 5. DELETE /api/restaurants/:slug
app.delete('/api/restaurants/:slug', (req, res) => {
  let list = readRestaurants();
  list = list.filter((r) => r.slug !== req.params.slug && r.id !== req.params.slug);
  writeRestaurants(list);
  res.json({ success: true });
});

// 6. GET /api/orders
app.get('/api/orders', (req, res) => {
  let orders = readOrders();
  const slug = req.query.slug as string;
  if (slug) {
    orders = orders.filter((o) => o.restaurantSlug === slug);
  }
  res.json(orders);
});

// 7. POST /api/orders
app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  const orders = readOrders();
  orders.unshift(newOrder);
  writeOrders(orders);
  res.status(201).json(newOrder);
});

// 8. PATCH /api/orders/:orderId
app.patch('/api/orders/:orderId', (req, res) => {
  const { orderStatus } = req.body;
  const orders = readOrders();
  const order = orders.find((o) => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  order.orderStatus = orderStatus;
  order.updatedAt = new Date().toISOString();
  writeOrders(orders);
  res.json(order);
});

// 9. POST /api/mercadopago/create-preference
app.post('/api/mercadopago/create-preference', async (req, res) => {
  try {
    const { title, price, quantity, currency_id, external_reference } = req.body;
    
    // Check if live access token is provided in headers or env
    const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (mpAccessToken && !mpAccessToken.startsWith('TEST-')) {
      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              title: title || 'Pedido en Restaurante',
              quantity: Number(quantity) || 1,
              unit_price: Number(price) || 100,
              currency_id: currency_id || 'MXN',
            },
          ],
          external_reference: external_reference || 'REF-' + Date.now(),
          back_urls: {
            success: `${req.protocol}://${req.get('host')}/payment-result?status=approved`,
            failure: `${req.protocol}://${req.get('host')}/payment-result?status=failure`,
            pending: `${req.protocol}://${req.get('host')}/payment-result?status=pending`,
          },
          auto_return: 'approved',
        }),
      });

      if (mpResponse.ok) {
        const prefData = await mpResponse.json();
        return res.json({ id: prefData.id, init_point: prefData.init_point });
      }
    }

    // Default sandbox demo preference fallback
    const demoId = 'PREF-' + Math.random().toString(36).substr(2, 9);
    res.json({
      id: demoId,
      init_point: `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${demoId}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.mx/checkout/v1/redirect?pref_id=${demoId}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error al procesar Mercado Pago' });
  }
});

// 10. POST /api/mercadopago/webhook
app.post('/api/mercadopago/webhook', (req, res) => {
  console.log('Mercado Pago Webhook notification received:', req.body);
  res.status(200).send('OK');
});

// 11. POST /api/analytics/:slug/event
app.post('/api/analytics/:slug/event', (req, res) => {
  const { event } = req.body;
  const list = readRestaurants();
  const rest = list.find((r) => r.slug === req.params.slug);
  if (rest && event) {
    if (!rest.analytics) {
      rest.analytics = { views: 0, whatsappClicks: 0, menuViews: 0, qrScans: 0, ordersCount: 0 };
    }
    rest.analytics[event] = (rest.analytics[event] || 0) + 1;
    writeRestaurants(list);
  }
  res.json({ success: true });
});

// Start dev or prod server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static files from dist
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LAV Restaurantes server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
