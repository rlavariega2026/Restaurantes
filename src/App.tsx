import React, { useState, useEffect } from 'react';
import { Restaurant, MenuItem, CartItem } from './types/restaurant';
import { RestaurantService } from './services/storage';
import { LavLandingPage } from './components/landing/LavLandingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TemplateRenderer } from './components/templates/TemplateRenderer';
import { CartDrawer } from './components/common/CartDrawer';
import { ProductDetailModal } from './components/common/ProductDetailModal';
import { BankTransferModal } from './components/common/BankTransferModal';
import { MercadoPagoModal } from './components/common/MercadoPagoModal';
import { QrModal } from './components/common/QrModal';
import { ShareModal } from './components/common/ShareModal';
import { HostingerDeployGuideModal } from './components/common/HostingerDeployGuideModal';
import { Sliders, Globe, Smartphone, HelpCircle, ArrowLeft } from 'lucide-react';

export default function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  // Main navigation view: 'landing' | 'admin' | 'card'
  const [view, setView] = useState<'landing' | 'admin' | 'card'>('landing');

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isBankTransferOpen, setIsBankTransferOpen] = useState(false);
  const [isMercadoPagoOpen, setIsMercadoPagoOpen] = useState(false);
  const [isHostingerGuideOpen, setIsHostingerGuideOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderTotalForModal, setOrderTotalForModal] = useState(0);

  // Initial load: fetch restaurants and check URL path
  useEffect(() => {
    RestaurantService.getRestaurants().then((data) => {
      setRestaurants(data);
      
      // Check if URL has a restaurant slug: /restaurantes/:slug or /:slug
      const path = window.location.pathname;
      const match = path.match(/\/(?:restaurantes\/)?([a-zA-Z0-9_-]+)/);
      const requestedSlug = match ? match[1] : null;

      if (requestedSlug) {
        const found = data.find((r) => r.slug === requestedSlug);
        if (found) {
          setCurrentRestaurant(found);
          setView('card');
          setLoading(false);
          // Record view event
          RestaurantService.recordEvent(found.slug, 'views');
          return;
        }
      }

      // Default active restaurant
      const defaultSlug = RestaurantService.getActiveSlug();
      const initial = data.find((r) => r.slug === defaultSlug) || data[0];
      setCurrentRestaurant(initial);
      setLoading(false);
    });
  }, []);

  // Update browser history/URL state gracefully without full reload
  const navigateTo = (newView: 'landing' | 'admin' | 'card', slug?: string) => {
    setView(newView);
    if (slug) {
      const rest = restaurants.find((r) => r.slug === slug);
      if (rest) {
        setCurrentRestaurant(rest);
        RestaurantService.setActiveSlug(rest.slug);
      }
    }
    // Update window history
    if (newView === 'card' && slug) {
      window.history.pushState({}, '', `/restaurantes/${slug}/`);
      RestaurantService.recordEvent(slug, 'views');
    } else if (newView === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Cart Operations
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      // Check if identical item already in cart
      const existingIdx = prev.findIndex(
        (i) =>
          i.product.id === item.product.id &&
          i.selectedVariant?.name === item.selectedVariant?.name &&
          JSON.stringify(i.selectedExtras) === JSON.stringify(item.selectedExtras) &&
          i.notes === item.notes
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        updated[existingIdx].itemTotal += item.itemTotal;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const unit = item.itemTotal / item.quantity;
      item.quantity = newQty;
      item.itemTotal = unit * newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, i) => acc + i.itemTotal, 0);
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  if (loading || !currentRestaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3 font-jakarta">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg animate-pulse shadow-lg shadow-amber-500/20">
          LAV
        </div>
        <p className="text-xs font-semibold text-slate-400">Cargando Tarjetas Digitales...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-jakarta">
      {/* GLOBAL PLATFORM MODE SWITCHER BAR */}
      <div className="bg-slate-950 text-white border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <div className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
              LAV
            </div>
            <span className="hidden sm:inline">LAV Digital MKT</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 truncate max-w-[140px] sm:max-w-none">
            {currentRestaurant.name}
          </span>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => navigateTo('landing')}
            className={`py-1 px-2.5 rounded-md font-semibold transition-colors flex items-center gap-1 ${
              view === 'landing' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Portal Comercial</span>
          </button>

          <button
            onClick={() => navigateTo('admin', currentRestaurant.slug)}
            className={`py-1 px-2.5 rounded-md font-semibold transition-colors flex items-center gap-1 ${
              view === 'admin' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Panel Admin</span>
          </button>

          <button
            onClick={() => navigateTo('card', currentRestaurant.slug)}
            className={`py-1 px-2.5 rounded-md font-semibold transition-colors flex items-center gap-1 ${
              view === 'card' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Tarjeta Móvil</span>
          </button>
        </div>

        {/* Hostinger Guide Trigger */}
        <button
          onClick={() => setIsHostingerGuideOpen(true)}
          className="hidden lg:flex items-center gap-1.5 py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-[11px] font-semibold transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Despliegue Hostinger</span>
        </button>
      </div>

      {/* VIEW 1: COMMERCIAL LANDING PAGE */}
      {view === 'landing' && (
        <LavLandingPage
          restaurants={restaurants}
          onOpenRestaurantDemo={(slug) => navigateTo('card', slug)}
          onOpenAdmin={(slug) => navigateTo('admin', slug || currentRestaurant.slug)}
          onOpenHostingerGuide={() => setIsHostingerGuideOpen(true)}
        />
      )}

      {/* VIEW 2: ADMIN DASHBOARD */}
      {view === 'admin' && (
        <AdminDashboard
          restaurants={restaurants}
          currentRestaurant={currentRestaurant}
          onSelectRestaurant={(slug) => {
            const found = restaurants.find((r) => r.slug === slug);
            if (found) {
              setCurrentRestaurant(found);
              RestaurantService.setActiveSlug(found.slug);
            }
          }}
          onUpdateRestaurant={(updated) => {
            setCurrentRestaurant(updated);
            setRestaurants((prev) =>
              prev.map((r) => (r.slug === updated.slug ? updated : r))
            );
          }}
          onRefreshList={async () => {
            const fresh = await RestaurantService.getRestaurants();
            setRestaurants(fresh);
          }}
          onViewPublicCard={(slug) => navigateTo('card', slug)}
          onOpenHostingerGuide={() => setIsHostingerGuideOpen(true)}
        />
      )}

      {/* VIEW 3: STANDALONE DIGITAL CARD (CUSTOMER MOBILE EXPERIENCE) */}
      {view === 'card' && (
        <div className="flex-1 bg-slate-900 flex justify-center">
          {/* Mobile Max-width Container for Authentic Phone Experience */}
          <main className="w-full max-w-md bg-white shadow-2xl min-h-screen">
            <TemplateRenderer
              restaurant={currentRestaurant}
              onOpenProduct={(prod) => setSelectedProduct(prod)}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
              onOpenQr={() => setIsQrOpen(true)}
              onOpenBankTransfer={() => {
                setOrderTotalForModal(cartTotal || 350);
                setIsBankTransferOpen(true);
              }}
              cartCount={cartCount}
              cartTotal={cartTotal}
            />
          </main>
        </div>
      )}

      {/* MODALS */}
      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        restaurant={currentRestaurant}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenBankTransfer={(tot) => {
          setOrderTotalForModal(tot);
          setIsBankTransferOpen(true);
        }}
        onOpenMercadoPago={(tot) => {
          setOrderTotalForModal(tot);
          setIsMercadoPagoOpen(true);
        }}
      />

      {/* Product Detail Customization Modal */}
      <ProductDetailModal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        accentColor={currentRestaurant.branding.accentColor}
      />

      {/* Bank Transfer Modal */}
      <BankTransferModal
        isOpen={isBankTransferOpen}
        onClose={() => setIsBankTransferOpen(false)}
        bankDetails={currentRestaurant.bankDetails}
        orderTotal={orderTotalForModal || cartTotal || 350}
        restaurantWhatsapp={currentRestaurant.contact.whatsapp}
        restaurantName={currentRestaurant.name}
      />

      {/* Mercado Pago Modal */}
      <MercadoPagoModal
        isOpen={isMercadoPagoOpen}
        onClose={() => setIsMercadoPagoOpen(false)}
        config={currentRestaurant.mercadoPagoConfig}
        orderTotal={orderTotalForModal || cartTotal || 350}
        restaurantName={currentRestaurant.name}
        onPaymentSuccess={(paymentId) => {
          alert(`¡Pago con Mercado Pago aprobado exitosamente! ID de referencia: ${paymentId}`);
          handleClearCart();
          setIsCartOpen(false);
        }}
      />

      {/* QR Code Modal */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        restaurant={currentRestaurant}
      />

      {/* Share & NFC Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        restaurant={currentRestaurant}
        onOpenQr={() => setIsQrOpen(true)}
      />

      {/* Hostinger & GitHub Deployment Guide Modal */}
      <HostingerDeployGuideModal
        isOpen={isHostingerGuideOpen}
        onClose={() => setIsHostingerGuideOpen(false)}
      />
    </div>
  );
}
