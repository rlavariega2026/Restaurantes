export type TemplateId =
  | 'alta-cocina'
  | 'steakhouse'
  | 'pizzeria'
  | 'taqueria'
  | 'cafeteria'
  | 'brunch'
  | 'sushi'
  | 'marisqueria'
  | 'hamburgueseria'
  | 'mexicana-premium'
  | 'mediterraneo'
  | 'reposteria'
  | 'vegana'
  | 'cocteleria'
  | 'foodtruck'
  | 'familiar'
  | 'autor'
  | 'campestre'
  | 'fastfood'
  | 'boutique'
  | 'portada-inmersiva';

export type ButtonStyle = 'rounded' | 'pill' | 'sharp' | 'minimal' | 'glass';

export type ProductTag = 'nuevo' | 'favorito' | 'vegetariano' | 'picante' | 'promo' | 'chef';

export interface ProductVariant {
  name: string;
  price: number;
}

export interface ProductExtra {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  tags?: ProductTag[];
  variants?: ProductVariant[];
  extras?: ProductExtra[];
  calories?: string;
  prepTime?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  category?: 'platillos' | 'ambiente' | 'bebidas' | 'equipo';
}

export interface DaySchedule {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  open: string;
  close: string;
  closed: boolean;
}

export interface SocialLinks {
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  messenger?: string;
  telegram?: string;
  pinterest?: string;
  website?: string;
  rappi?: string;
  ubereats?: string;
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  clabe: string;
  accountNumber: string;
  referenceNote: string;
  transferInstructions: string;
}

export interface MercadoPagoConfig {
  publicKey: string;
  accessToken: string;
  sandboxMode: boolean;
  currency: string;
  verified: boolean;
}

export interface RestaurantBranding {
  logoUrl: string;
  coverUrl: string;
  accentColor: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  fontDisplay: string;
  fontBody: string;
  buttonStyle: ButtonStyle;
  gallery: GalleryPhoto[];
  videoUrl?: string;
  customTemplateName?: string;
  // Configuración especial de Portada Inmersiva (100dvh)
  heroDisplayMode?: 'cover' | 'contain';
  heroContentPosition?: 'bottom' | 'center' | 'top';
  heroScrimIntensity?: 'none' | 'soft' | 'medium' | 'high';
  heroScrollText?: string;
  heroButtons?: {
    showMenuBtn?: boolean;
    showOrderBtn?: boolean;
    showReserveBtn?: boolean;
  };
}

export interface RestaurantFeatures {
  whatsappOrders: boolean;
  tableReservations: boolean;
  pickupOrders: boolean;
  deliveryOrders: boolean;
  bankTransfer: boolean;
  mercadoPago: boolean;
  googleReviews: boolean;
  photoGallery: boolean;
  socialLinks: boolean;
  specialNotice: boolean;
  ratingsBadge: boolean;
}

export interface RestaurantContact {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  postalCode?: string;
  googleMapsUrl: string;
  googleMapsQuery: string;
  googleReviewsUrl: string;
}

export interface RestaurantAnalytics {
  views: number;
  whatsappClicks: number;
  menuViews: number;
  qrScans: number;
  ordersCount: number;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cuisineType: string;
  templateId: TemplateId;
  branding: RestaurantBranding;
  contact: RestaurantContact;
  socialLinks: SocialLinks;
  schedule: DaySchedule[];
  specialNoticeText?: string;
  features: RestaurantFeatures;
  bankDetails: BankDetails;
  mercadoPagoConfig: MercadoPagoConfig;
  categories: MenuCategory[];
  products: MenuItem[];
  sectionOrder: string[];
  analytics: RestaurantAnalytics;
  hostingerConfig?: {
    published: boolean;
    folder: string;
    customDomain?: string;
    publishedAt?: string;
    liveUrl?: string;
    publicationSlug?: string;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CartItem {
  product: MenuItem;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedExtras?: ProductExtra[];
  notes?: string;
  itemTotal: number;
}

export type OrderStatus =
  | 'recibido'
  | 'pendiente_pago'
  | 'confirmado'
  | 'en_preparacion'
  | 'listo'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export interface Order {
  id: string;
  restaurantId: string;
  restaurantSlug: string;
  customerName: string;
  customerPhone: string;
  orderType: 'pickup' | 'delivery' | 'dine_in';
  deliveryAddress?: string;
  deliveryNotes?: string;
  tableNumber?: string;
  items: {
    productId: string;
    productName: string;
    variantName?: string;
    extras?: string[];
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'whatsapp' | 'transferencia' | 'mercadopago' | 'efectivo';
  paymentStatus: 'pendiente' | 'aprobado' | 'en_revision' | 'rechazado';
  transferReceiptUrl?: string;
  mercadoPagoPaymentId?: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  category: 'Fine Dining' | 'Street Food' | 'Café & Panadería' | 'Casual & Familiar' | 'Bares & Copas' | 'Especialidad' | 'Edición Especial';
  concept: string;
  fontDisplay: string;
  fontBody: string;
  defaultColors: {
    accent: string;
    bg: string;
    surface: string;
    text: string;
  };
  buttonStyle: ButtonStyle;
  description: string;
  cardStyle: 'editorial' | 'bento' | 'masonry' | 'minimal-table' | 'split-hero' | 'modern-magazine';
}
