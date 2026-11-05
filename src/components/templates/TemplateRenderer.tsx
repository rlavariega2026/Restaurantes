import React, { useState, useMemo } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Clock,
  Share2,
  QrCode,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  Sparkles,
  Heart,
  Leaf,
  Award,
  Building2,
  Calendar,
  Utensils,
  ShoppingBag,
  Info,
  CheckCircle2,
  Globe,
  Instagram,
  Facebook,
  Radio,
  Copy,
  Check,
  CreditCard
} from 'lucide-react';
import { Restaurant, MenuItem, MenuCategory, CartItem, ProductTag } from '../../types/restaurant';
import { downloadVCard } from '../../services/storage';

interface TemplateRendererProps {
  restaurant: Restaurant;
  onOpenProduct: (product: MenuItem) => void;
  onOpenCart: () => void;
  onOpenShare: () => void;
  onOpenQr: () => void;
  onOpenBankTransfer: () => void;
  cartCount: number;
  cartTotal: number;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  restaurant,
  onOpenProduct,
  onOpenCart,
  onOpenShare,
  onOpenQr,
  onOpenBankTransfer,
  cartCount,
  cartTotal,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [copiedPaymentField, setCopiedPaymentField] = useState<string | null>(null);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<string | null>(null);

  const handleCopyPayment = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPaymentField(fieldKey);
    setTimeout(() => setCopiedPaymentField(null), 2500);
  };

  const { branding, contact, socialLinks, features, schedule, categories, products } = restaurant;

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) return false;
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      // Tag filter
      if (selectedTag !== 'all') {
        if (!p.tags || !p.tags.includes(selectedTag as ProductTag)) return false;
      }
      return true;
    });
  }, [products, selectedCategoryId, searchQuery, selectedTag]);

  // Check if restaurant is currently open right now
  const isOpenNow = useMemo(() => {
    const days: ('Domingo' | 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado')[] = [
      'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
    ];
    const todayIndex = new Date().getDay();
    const todayName = days[todayIndex];
    const todaySchedule = schedule.find((s) => s.day === todayName);
    if (!todaySchedule || todaySchedule.closed) return false;

    const now = new Date();
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentHourMin >= todaySchedule.open && currentHourMin <= todaySchedule.close;
  }, [schedule]);

  // Helper for tag icons
  const renderTagBadge = (tag: ProductTag) => {
    switch (tag) {
      case 'picante':
        return <span className="inline-flex items-center gap-1 text-red-500 font-bold"><Flame className="w-3 h-3" /> Picante</span>;
      case 'nuevo':
        return <span className="inline-flex items-center gap-1 text-amber-500 font-bold"><Sparkles className="w-3 h-3" /> Nuevo</span>;
      case 'favorito':
        return <span className="inline-flex items-center gap-1 text-rose-500 font-bold"><Heart className="w-3 h-3 fill-current" /> Favorito</span>;
      case 'vegetariano':
        return <span className="inline-flex items-center gap-1 text-emerald-500 font-bold"><Leaf className="w-3 h-3" /> Vegano/Veg</span>;
      case 'chef':
        return <span className="inline-flex items-center gap-1 text-indigo-400 font-bold"><Award className="w-3 h-3" /> Especial</span>;
      default:
        return null;
    }
  };

  // Button radius styling based on branding
  const getButtonRadiusClass = () => {
    switch (branding.buttonStyle) {
      case 'pill':
        return 'rounded-full';
      case 'sharp':
        return 'rounded-none';
      case 'minimal':
        return 'rounded-sm';
      case 'glass':
        return 'rounded-xl backdrop-blur-md bg-white/10 border border-white/20';
      case 'rounded':
      default:
        return 'rounded-xl';
    }
  };

  const isImmersiveCover = restaurant.templateId === 'portada-inmersiva';
  const heroDisplayMode = branding.heroDisplayMode || 'cover';
  const heroContentPosition = branding.heroContentPosition || 'bottom';
  const heroScrimIntensity = branding.heroScrimIntensity || 'medium';
  const heroButtons = branding.heroButtons || { showMenuBtn: true, showOrderBtn: true, showReserveBtn: true };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getScrimClass = () => {
    switch (heroScrimIntensity) {
      case 'none':
        return 'bg-transparent';
      case 'soft':
        return 'bg-gradient-to-t from-black/60 via-transparent to-black/30';
      case 'high':
        return 'bg-gradient-to-t from-black/95 via-black/40 to-black/60';
      case 'medium':
      default:
        return 'bg-gradient-to-t from-black/85 via-black/20 to-black/40';
    }
  };

  return (
    <div
      className={`min-h-screen text-slate-900 transition-colors duration-300 pb-24 ${branding.fontBody}`}
      style={{
        backgroundColor: branding.bgColor,
        color: branding.textColor,
      }}
    >
      {/* 1. TOP UTILITY ACTION BAR (Hidden or floating on immersive cover) */}
      {!isImmersiveCover && (
        <header
          className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors px-4 py-2.5 flex items-center justify-between"
          style={{
            backgroundColor: `${branding.surfaceColor}E6`,
            borderColor: `${branding.textColor}1A`,
          }}
        >
          <div className="flex items-center gap-2 truncate">
            <span
              className={`font-bold text-sm tracking-tight truncate ${branding.fontDisplay}`}
              style={{ color: branding.textColor }}
            >
              {restaurant.name}
            </span>
            <span className="text-xs opacity-60">·</span>
            <span className="text-[11px] opacity-75 truncate">{restaurant.cuisineType}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenShare}
              aria-label="Compartir"
              className="p-2 rounded-lg opacity-80 hover:opacity-100 hover:bg-black/5 transition-opacity"
              style={{ color: branding.textColor }}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenQr}
              aria-label="Código QR"
              className="p-2 rounded-lg opacity-80 hover:opacity-100 hover:bg-black/5 transition-opacity"
              style={{ color: branding.textColor }}
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* 2. COVER & HERO PRESENTATION */}
      {isImmersiveCover ? (
        /* SPECIAL TEMPLATE: PORTADA FOTOGRÁFICA A PANTALLA COMPLETA (100dvh) */
        <section className="relative w-full h-[100dvh] min-h-[580px] max-h-[100dvh] overflow-hidden flex flex-col justify-between text-white select-none">
          {/* Background image container with cover vs contain support */}
          <div className="absolute inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
            {heroDisplayMode === 'contain' && (
              /* Ambient blurred duplicate to gracefully fill any aspect ratio */
              <img
                src={branding.coverUrl || '/src/assets/images/hero_immersive_culinary_1793144478747.jpg'}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
              />
            )}
            <img
              src={branding.coverUrl || '/src/assets/images/hero_immersive_culinary_1793144478747.jpg'}
              alt={restaurant.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full relative z-10 transition-transform duration-700 ${
                heroDisplayMode === 'contain' ? 'object-contain' : 'object-cover'
              }`}
            />
            {/* Scrim Gradient */}
            <div className={`absolute inset-0 z-20 ${getScrimClass()}`} />
          </div>

          {/* Floating Top Bar Inside 100dvh Frame */}
          <div className="relative z-30 pt-safe px-5 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md ${
                  isOpenNow ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{isOpenNow ? 'Abierto' : 'Cerrado'}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-black/50 text-white/90 backdrop-blur-md border border-white/10">
                {restaurant.cuisineType}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenShare}
                aria-label="Compartir"
                className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenQr}
                aria-label="Código QR"
                className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 transition-all active:scale-95"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Overlaid Editorial Text Cluster */}
          <div
            className={`relative z-30 px-6 max-w-xl mx-auto w-full transition-all ${
              heroContentPosition === 'top'
                ? 'pt-4 pb-auto'
                : heroContentPosition === 'center'
                ? 'my-auto text-center'
                : 'mt-auto pb-4 text-left'
            }`}
          >
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 drop-shadow-md">
                {restaurant.cuisineType}
              </span>
              <h1
                className={`text-3xl sm:text-5xl font-black leading-tight tracking-tight drop-shadow-lg ${branding.fontDisplay}`}
              >
                {restaurant.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-2 drop-shadow-md leading-relaxed">
                {restaurant.tagline}
              </p>
            </div>

            {/* Optional Hero Action Buttons */}
            {(heroButtons.showMenuBtn || heroButtons.showOrderBtn || heroButtons.showReserveBtn) && (
              <div className="flex flex-wrap items-center gap-2 pt-3">
                {heroButtons.showMenuBtn && (
                  <button
                    onClick={() => scrollToSection('menu-section')}
                    style={{ backgroundColor: branding.accentColor }}
                    className="py-2.5 px-4 rounded-xl text-slate-950 font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Ver Menú</span>
                  </button>
                )}

                {heroButtons.showOrderBtn && (
                  <button
                    onClick={() => scrollToSection('menu-section')}
                    className="py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/25 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Pedir Ahora</span>
                  </button>
                )}

                {heroButtons.showReserveBtn && features.tableReservations && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${restaurant.name}, quisiera consultar disponibilidad para reservar una mesa.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs backdrop-blur-md border border-white/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reservar</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Discrete Bouncing Scroll Indicator */}
          <div
            onClick={() => scrollToSection('presentation-section')}
            className="relative z-30 pb-6 pt-2 flex flex-col items-center justify-center gap-1 text-white/80 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 drop-shadow-md group-hover:tracking-wider transition-all">
              {branding.heroScrollText || 'Desliza para descubrir'}
            </span>
            <ChevronDown className="w-5 h-5 animate-bounce text-amber-400 drop-shadow-md" />
          </div>
        </section>
      ) : (
        /* STANDARD HERO PRESENTATION (For other templates) */
        <section className="relative overflow-hidden">
          {/* Main Cover Image */}
          <div className="relative h-64 md:h-80 w-full bg-slate-900 overflow-hidden">
            <img
              src={branding.coverUrl || '/src/assets/images/hero_culinary_editorial_1793142965729.jpg'}
              alt={restaurant.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* Status Badge & Cuisine */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-xs ${
                  isOpenNow ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{isOpenNow ? 'Abierto Ahora' : 'Cerrado Ahora'}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white/90 backdrop-blur-xs">
                {restaurant.cuisineType}
              </span>
            </div>

            {/* Hero Titles Inside Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <h1
                className={`text-2xl md:text-4xl font-extrabold leading-tight tracking-tight drop-shadow-xs ${branding.fontDisplay}`}
              >
                {restaurant.name}
              </h1>
              <p className="text-xs md:text-sm text-white/90 font-medium line-clamp-1 drop-shadow-xs">
                {restaurant.tagline}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CONTINUOUS NATURAL PAGE PRESENTATION */}
      <section
        id="presentation-section"
        className="px-5 py-4 border-b space-y-3"
        style={{
          backgroundColor: branding.surfaceColor,
          borderColor: `${branding.textColor}1A`,
        }}
      >
          <p className="text-xs md:text-sm leading-relaxed opacity-85">
            {restaurant.description}
          </p>

          {/* Quick Action Button Strip (Call, Maps, Reviews, WhatsApp) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${restaurant.name}, te contacto desde tu tarjeta digital.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2.5 px-3 font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all ${getButtonRadiusClass()}`}
              style={{
                backgroundColor: branding.accentColor,
                color: '#FFFFFF',
              }}
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </a>

            {/* Google Maps / Dirección */}
            <a
              href={contact.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(contact.googleMapsQuery || contact.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2.5 px-3 font-semibold border flex items-center justify-center gap-2 hover:opacity-90 transition-all ${getButtonRadiusClass()}`}
              style={{
                borderColor: `${branding.textColor}33`,
                backgroundColor: `${branding.bgColor}80`,
                color: branding.textColor,
              }}
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Cómo Llegar</span>
            </a>

            {/* Call */}
            <a
              href={`tel:${contact.phone.replace(/\s+/g, '')}`}
              className={`py-2.5 px-3 font-semibold border flex items-center justify-center gap-2 hover:opacity-90 transition-all ${getButtonRadiusClass()}`}
              style={{
                borderColor: `${branding.textColor}33`,
                backgroundColor: `${branding.bgColor}80`,
                color: branding.textColor,
              }}
            >
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>Llamar</span>
            </a>

            {/* Save Contact vCard */}
            <button
              onClick={() => downloadVCard(restaurant)}
              className={`py-2.5 px-3 font-semibold border flex items-center justify-center gap-2 hover:opacity-90 transition-all ${getButtonRadiusClass()}`}
              style={{
                borderColor: `${branding.textColor}33`,
                backgroundColor: `${branding.bgColor}80`,
                color: branding.textColor,
              }}
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span>Guardar Ficha</span>
            </button>
          </div>

          {/* Google Reviews Button */}
          {features.googleReviews && contact.googleReviewsUrl && (
            <div className="pt-1">
              <a
                href={contact.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-lg border border-amber-300/60 bg-amber-500/10 text-xs font-semibold flex items-center justify-between text-amber-700 hover:bg-amber-500/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>¿Ya probaste nuestra comida? Califícanos en Google</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
              </a>
            </div>
          )}

          {/* Prominent Interactive Schedule Button & Collapsible Panel */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(!isScheduleOpen)}
              className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between transition-all shadow-2xs ${
                isScheduleOpen ? 'ring-2' : 'hover:opacity-95'
              }`}
              style={{
                borderColor: `${branding.textColor}25`,
                backgroundColor: `${branding.bgColor}60`,
                color: branding.textColor,
              }}
            >
              <div className="flex items-center gap-2.5 text-left">
                <div
                  className="p-1.5 rounded-lg shrink-0"
                  style={{ backgroundColor: `${branding.accentColor}25`, color: branding.accentColor }}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs tracking-tight">Horarios de Atención Semanales</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                        isOpenNow ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {isOpenNow ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70 font-medium">
                    {(() => {
                      const daysList = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                      const todayName = daysList[new Date().getDay()];
                      const todaySch = schedule.find((s) => s.day === todayName);
                      if (!todaySch || todaySch.closed) return `Hoy (${todayName}): Cerrado`;
                      return `Hoy (${todayName}): ${todaySch.open} - ${todaySch.close}`;
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-70 text-xs font-semibold shrink-0">
                <span>{isScheduleOpen ? 'Ocultar' : 'Ver todos'}</span>
                {isScheduleOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Expanded Weekly Schedule Table */}
            {isScheduleOpen && (
              <div
                className="mt-2 p-3.5 rounded-2xl border text-xs space-y-1.5 animate-fadeIn shadow-inner"
                style={{
                  backgroundColor: `${branding.surfaceColor}`,
                  borderColor: `${branding.textColor}20`,
                  color: branding.textColor,
                }}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-60 pb-1 border-b" style={{ borderColor: `${branding.textColor}15` }}>
                  Calendario de Apertura y Cierre
                </div>

                {schedule.map((item, idx) => {
                  const daysList = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                  const isToday = daysList[new Date().getDay()] === item.day;
                  return (
                    <div
                      key={idx}
                      className={`flex justify-between items-center py-1 px-2 rounded-lg transition-colors ${
                        isToday ? 'font-bold' : 'opacity-85'
                      }`}
                      style={{
                        backgroundColor: isToday ? `${branding.accentColor}18` : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.day}</span>
                        {isToday && (
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase"
                            style={{ backgroundColor: branding.accentColor, color: '#fff' }}
                          >
                            Hoy
                          </span>
                        )}
                      </div>
                      <span className="tabular-nums font-semibold">
                        {item.closed ? (
                          <span className="text-rose-500 font-bold">Cerrado</span>
                        ) : (
                          `${item.open} - ${item.close}`
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      </section>

      {/* 3. SPECIAL NOTICE BANNER */}
      {features.specialNotice && restaurant.specialNoticeText && (
        <div
          className="mx-4 my-3 p-3 rounded-xl border flex items-start gap-2.5 text-xs shadow-xs"
          style={{
            backgroundColor: `${branding.accentColor}1A`,
            borderColor: `${branding.accentColor}50`,
            color: branding.textColor,
          }}
        >
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: branding.accentColor }} />
          <div>
            <span className="font-bold block text-[11px] uppercase tracking-wider opacity-75">
              Aviso Especial
            </span>
            <p className="font-medium mt-0.5 leading-snug">{restaurant.specialNoticeText}</p>
          </div>
        </div>
      )}

      {/* 4. INTERACTIVE MENU SECTION */}
      <section id="menu-section" className="px-4 py-4 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${branding.fontDisplay}`}>
              Menú Digital
            </h2>
            <p className="text-xs opacity-70">
              Selecciona cualquier platillo para ver detalles, opciones y agregarlo a tu orden.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por platillo, ingrediente..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none transition-all"
            style={{
              backgroundColor: branding.surfaceColor,
              borderColor: `${branding.textColor}25`,
              color: branding.textColor,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Categories Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedCategoryId === 'all'
                ? 'font-bold shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: selectedCategoryId === 'all' ? branding.accentColor : `${branding.surfaceColor}`,
              color: selectedCategoryId === 'all' ? '#FFFFFF' : branding.textColor,
              borderColor: `${branding.textColor}20`,
            }}
          >
            Todos ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                  isSelected ? 'font-bold shadow-xs' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isSelected ? branding.accentColor : branding.surfaceColor,
                  color: isSelected ? '#FFFFFF' : branding.textColor,
                  borderColor: `${branding.textColor}20`,
                }}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Tag Filters (Favorito, Picante, Veg, Nuevo) */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
          {['all', 'favorito', 'nuevo', 'chef', 'picante', 'vegetariano'].map((tagKey) => (
            <button
              key={tagKey}
              onClick={() => setSelectedTag(tagKey)}
              className={`px-2.5 py-1 rounded-md border transition-all ${
                selectedTag === tagKey
                  ? 'border-slate-900 bg-slate-900 text-white font-bold'
                  : 'border-slate-200/50 opacity-70 hover:opacity-100'
              }`}
            >
              {tagKey === 'all' && 'Todos los tipos'}
              {tagKey === 'favorito' && '❤️ Favoritos'}
              {tagKey === 'nuevo' && '✨ Nuevos'}
              {tagKey === 'chef' && '🎖️ Chef'}
              {tagKey === 'picante' && '🌶️ Picantes'}
              {tagKey === 'vegetariano' && '🌱 Veganos'}
            </button>
          ))}
        </div>

        {/* Products Grid / Cards */}
        {filteredProducts.length === 0 ? (
          <div
            className="py-12 text-center rounded-2xl border space-y-2"
            style={{
              backgroundColor: branding.surfaceColor,
              borderColor: `${branding.textColor}15`,
            }}
          >
            <Utensils className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-sm font-semibold opacity-80">No encontramos productos en esta búsqueda</p>
            <button
              onClick={() => {
                setSelectedCategoryId('all');
                setSearchQuery('');
                setSelectedTag('all');
              }}
              className="text-xs font-bold underline opacity-90"
            >
              Restablecer filtros del menú
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onOpenProduct(product)}
                className="group p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 hover:shadow-md active:scale-[0.99]"
                style={{
                  backgroundColor: branding.surfaceColor,
                  borderColor: `${branding.textColor}1A`,
                }}
              >
                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1">
                    {/* Tags row */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] mb-1">
                        {product.tags.map((t, idx) => (
                          <span key={idx} className="flex items-center">
                            {renderTagBadge(t)}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-sm font-bold leading-tight group-hover:opacity-90 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Add Indicator */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-sm font-extrabold tabular-nums">
                      ${product.price} MXN
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${branding.accentColor}25`,
                        color: branding.accentColor,
                      }}
                    >
                      + Pedir
                    </span>
                  </div>
                </div>

                {/* Product Thumbnail */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200/50">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}
                  {!product.available && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-1 text-center">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. PHOTO GALLERY & AMBIENCE (If enabled) */}
      {features.photoGallery && branding.gallery && branding.gallery.length > 0 && (
        <section className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-bold ${branding.fontDisplay}`}>
              Galería & Ambiente
            </h3>
            <span className="text-xs opacity-60">Toca para ampliar</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {branding.gallery.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedGalleryPhoto(photo.url)}
                className="aspect-square rounded-xl overflow-hidden bg-slate-200 cursor-pointer hover:opacity-90 transition-opacity relative group"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto del restaurante'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. BANK TRANSFER DIRECT DETAILS (Collapsible with Individual Copy Buttons) */}
      {features.bankTransfer && (
        <section className="px-4 py-3">
          <div
            className="rounded-2xl border transition-all overflow-hidden shadow-2xs"
            style={{
              backgroundColor: branding.surfaceColor,
              borderColor: `${branding.textColor}25`,
            }}
          >
            {/* Clickable Header Button to unfold payment data */}
            <button
              type="button"
              onClick={() => setIsPaymentsOpen(!isPaymentsOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:opacity-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${branding.accentColor}20`, color: branding.accentColor }}
                >
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      Métodos de Cobro & Pagos (SPEI)
                    </h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-500 uppercase tracking-wide">
                      Sin Comisiones
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70 mt-0.5">
                    Toca para ver cuenta, CLABE interbancaria y copiar datos con 1 clic.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold opacity-75 shrink-0 ml-2">
                <span>{isPaymentsOpen ? 'Ocultar' : 'Ver datos'}</span>
                {isPaymentsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Unfolded Bank Details with Individual Copy Options */}
            {isPaymentsOpen && (
              <div
                className="px-4 pb-4 pt-1 border-t space-y-3 animate-fadeIn text-xs"
                style={{ borderColor: `${branding.textColor}15` }}
              >
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-2">
                  {/* Banco Receptor */}
                  <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Banco</span>
                      <span className="font-bold text-xs">{restaurant.bankDetails.bankName || 'Banco Nacional'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPayment(restaurant.bankDetails.bankName, 'banco')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border"
                      style={{
                        backgroundColor: copiedPaymentField === 'banco' ? '#10B981' : `${branding.textColor}10`,
                        color: copiedPaymentField === 'banco' ? '#FFFFFF' : branding.textColor,
                        borderColor: `${branding.textColor}20`,
                      }}
                    >
                      {copiedPaymentField === 'banco' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 opacity-70" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Beneficiario / Titular */}
                  <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Titular / Beneficiario</span>
                      <span className="font-semibold text-xs">{restaurant.bankDetails.accountHolder}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPayment(restaurant.bankDetails.accountHolder, 'titular')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border"
                      style={{
                        backgroundColor: copiedPaymentField === 'titular' ? '#10B981' : `${branding.textColor}10`,
                        color: copiedPaymentField === 'titular' ? '#FFFFFF' : branding.textColor,
                        borderColor: `${branding.textColor}20`,
                      }}
                    >
                      {copiedPaymentField === 'titular' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 opacity-70" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* CLABE Interbancaria */}
                  <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">CLABE Interbancaria (18 dígitos)</span>
                      <span className="font-mono font-bold text-xs tracking-wider">{restaurant.bankDetails.clabe}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPayment(restaurant.bankDetails.clabe, 'clabe')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border"
                      style={{
                        backgroundColor: copiedPaymentField === 'clabe' ? '#10B981' : `${branding.textColor}10`,
                        color: copiedPaymentField === 'clabe' ? '#FFFFFF' : branding.textColor,
                        borderColor: `${branding.textColor}20`,
                      }}
                    >
                      {copiedPaymentField === 'clabe' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 opacity-70" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Número de Cuenta (si existe) */}
                  {restaurant.bankDetails.accountNumber && (
                    <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Número de Cuenta</span>
                        <span className="font-mono font-semibold text-xs">{restaurant.bankDetails.accountNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPayment(restaurant.bankDetails.accountNumber, 'cuenta')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border"
                        style={{
                          backgroundColor: copiedPaymentField === 'cuenta' ? '#10B981' : `${branding.textColor}10`,
                          color: copiedPaymentField === 'cuenta' ? '#FFFFFF' : branding.textColor,
                          borderColor: `${branding.textColor}20`,
                        }}
                      >
                        {copiedPaymentField === 'cuenta' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 opacity-70" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Concepto / Referencia Sugerida */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">Concepto Sugerido</span>
                      <span className="font-semibold text-xs">{restaurant.name.slice(0, 16)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPayment(restaurant.name.slice(0, 16), 'concepto')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border"
                      style={{
                        backgroundColor: copiedPaymentField === 'concepto' ? '#10B981' : `${branding.textColor}10`,
                        color: copiedPaymentField === 'concepto' ? '#FFFFFF' : branding.textColor,
                        borderColor: `${branding.textColor}20`,
                      }}
                    >
                      {copiedPaymentField === 'concepto' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 opacity-70" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Additional instructions and modal triggers */}
                {restaurant.bankDetails.transferInstructions && (
                  <p className="text-[11px] opacity-75 italic leading-relaxed">
                    💡 {restaurant.bankDetails.transferInstructions}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${restaurant.name}, te envío mi comprobante de transferencia bancaria.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                    style={{
                      backgroundColor: '#25D366',
                      color: '#FFFFFF',
                    }}
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Enviar Comprobante</span>
                  </a>

                  <button
                    type="button"
                    onClick={onOpenBankTransfer}
                    className="py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                    style={{
                      borderColor: `${branding.textColor}30`,
                      color: branding.textColor,
                    }}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Ficha Completa</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. SOCIAL NETWORKS & FOOTER */}
      <footer
        className="mt-6 px-5 py-6 border-t text-center space-y-4"
        style={{
          backgroundColor: branding.surfaceColor,
          borderColor: `${branding.textColor}15`,
        }}
      >
        {/* Social Icons */}
        <div className="flex items-center justify-center gap-3">
          {socialLinks.whatsapp && (
            <a
              href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:scale-110 transition-transform"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={`https://instagram.com/${socialLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2.5 rounded-full bg-pink-500/10 text-pink-600 hover:scale-110 transition-transform"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {socialLinks.facebook && (
            <a
              href={`https://facebook.com/${socialLinks.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2.5 rounded-full bg-blue-500/10 text-blue-600 hover:scale-110 transition-transform"
            >
              <Facebook className="w-4 h-4 fill-current" />
            </a>
          )}
          {socialLinks.website && (
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sitio web"
              className="p-2.5 rounded-full bg-slate-500/10 opacity-75 hover:opacity-100 hover:scale-110 transition-transform"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Address & City */}
        <div className="space-y-0.5 text-xs opacity-75">
          <p className="font-semibold">{restaurant.name}</p>
          <p>{contact.address}</p>
          <p>{contact.city} {contact.postalCode ? `· C.P. ${contact.postalCode}` : ''}</p>
        </div>

        {/* LAV Digital MKT Signature */}
        <div className="pt-4 border-t border-slate-500/20 text-[11px] opacity-60">
          <p>
            Tarjeta Digital Inteligente desarrollada por{' '}
            <strong className="tracking-wide">LAV Digital MKT</strong>
          </p>
          <p className="text-[10px] mt-0.5">lavdigitalmkt.com · Marketing Gastronómico</p>
        </div>
      </footer>

      {/* 8. FLOATING STICKY BOTTOM CART TRIGGER (When cart has items) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={onOpenCart}
            style={{ backgroundColor: branding.accentColor }}
            className="w-full py-3.5 px-5 text-white font-bold rounded-2xl shadow-xl flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-extrabold tabular-nums">
                {cartCount}
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold">Ver Mi Pedido</span>
            </div>
            <span className="text-sm font-extrabold tabular-nums">${cartTotal} MXN</span>
          </button>
        </div>
      )}

      {/* Lightbox Modal for Gallery Photo Expansion */}
      {selectedGalleryPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedGalleryPhoto(null)}
        >
          <img
            src={selectedGalleryPhoto}
            alt="Ampliación"
            referrerPolicy="no-referrer"
            className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
