import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Smartphone,
  QrCode,
  Radio,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  Sliders,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Eye,
  Store,
  ExternalLink,
  Zap,
  Star
} from 'lucide-react';
import { TEMPLATE_DEFINITIONS } from '../../data/templateDefinitions';
import { Restaurant } from '../../types/restaurant';

interface LavLandingPageProps {
  restaurants: Restaurant[];
  onOpenRestaurantDemo: (slug: string) => void;
  onOpenAdmin: (slug?: string) => void;
  onOpenHostingerGuide: () => void;
}

export const LavLandingPage: React.FC<LavLandingPageProps> = ({
  restaurants,
  onOpenRestaurantDemo,
  onOpenAdmin,
  onOpenHostingerGuide,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Template categories for filter
  const categories = [
    'all',
    'Edición Especial',
    'Fine Dining',
    'Street Food',
    'Café & Panadería',
    'Casual & Familiar',
    'Bares & Copas',
    'Especialidad',
  ];

  const filteredTemplates = TEMPLATE_DEFINITIONS.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-jakarta selection:bg-amber-500 selection:text-slate-950">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
              LAV
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-white block leading-tight">
                LAV Digital MKT
              </span>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest block">
                Restaurantes
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#plantillas" className="hover:text-amber-400 transition-colors">
              20 Plantillas de Autor
            </a>
            <a href="#ventajas" className="hover:text-amber-400 transition-colors">
              Ventajas Comerciales
            </a>
            <a href="#planes" className="hover:text-amber-400 transition-colors">
              Planes & Precios
            </a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">
              Preguntas Frecuentes
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenAdmin()}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Panel de Control</span>
            </button>
            <button
              onClick={() => onOpenRestaurantDemo('lumbre-alta-cocina')}
              className="py-2 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Ver Demo en Vivo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Ambient lighting glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tecnología Gastronómica Exclusiva para México & Latinoamérica</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] text-balance">
              Transforma tu Menú en una{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                Tarjeta Digital Inteligente
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-slate-400 leading-relaxed text-balance max-w-2xl mx-auto">
              La plataforma premium de LAV Digital MKT para restaurantes, bares, cafeterías y taquerías. Menú interactivo con fotografías gastronómicas de alta calidad, pedidos directos por WhatsApp sin comisiones, transferencias bancarias SPEI y cobros oficiales con Mercado Pago.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onOpenRestaurantDemo('lumbre-alta-cocina')}
                className="w-full sm:w-auto py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Probar Tarjeta en Teléfono</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAdmin()}
                className="w-full sm:w-auto py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl border border-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Administrar Restaurante</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80">
              <div className="space-y-0.5">
                <span className="text-2xl font-black text-white tabular-nums">20</span>
                <p className="text-xs text-slate-400 font-medium">Plantillas de autor únicas</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl font-black text-emerald-400 tabular-nums">0%</span>
                <p className="text-xs text-slate-400 font-medium">Comisiones por pedido</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl font-black text-white tabular-nums">100%</span>
                <p className="text-xs text-slate-400 font-medium">Sin descargar aplicaciones</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl font-black text-amber-400 tabular-nums">&lt; 1 seg</span>
                <p className="text-xs text-slate-400 font-medium">Carga en iPhone y Android</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE OF THE 20 DISTINCT TEMPLATES */}
      <section id="plantillas" className="py-20 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Diversidad & Carácter Gastronómico
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                20 Plantillas Realmente Diferentes
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Cada concepto gastronómico tiene su propia personalidad. No cambiamos solo el color: cada plantilla cuenta con jerarquía, tipografía y composición editorial propia.
              </p>
            </div>

            {/* Category Segmented Control */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'Todas (20)' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* 20 Template Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => {
              // Find matching demo restaurant
              const demoRest = restaurants.find((r) => r.templateId === template.id) || restaurants[0];
              return (
                <div
                  key={template.id}
                  className="group bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-black/50"
                >
                  <div className="space-y-3">
                    {/* Header Pill & Swatches */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {template.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: template.defaultColors.bg }}
                          title="Fondo"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: template.defaultColors.accent }}
                          title="Acento"
                        />
                      </div>
                    </div>

                    {/* Preview Thumbnail */}
                    <div className="h-32 rounded-xl overflow-hidden bg-slate-800 relative">
                      <img
                        src={demoRest.branding.coverUrl || '/src/assets/images/hero_culinary_editorial_1793142965729.jpg'}
                        alt={template.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-white text-[11px] font-bold truncate">
                          {demoRest.name}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {template.concept}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenRestaurantDemo(demoRest.slug)}
                      className="flex-1 py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-bold rounded-lg border border-amber-500/30 transition-all flex items-center justify-center gap-1"
                    >
                      <span>Ver Demo</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onOpenAdmin(demoRest.slug)}
                      className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                      title="Editar en Panel"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. KEY ADVANTAGES & BUSINESS BENEFITS */}
      <section id="ventajas" className="py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              ¿Por qué elegir LAV Digital MKT?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Diseñadas para Vender Más en el Celular de tu Cliente
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Olvídate de PDFs pesados que tus clientes no pueden leer y de apps que nadie quiere descargar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">0% de Comisiones por Pedido</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A diferencia de aplicaciones de delivery que retienen hasta el 30% de cada platillo, los pedidos por WhatsApp y transferencias bancarias van 100% directos a tu negocio.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Integración QR & Chips NFC</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coloca códigos QR en tus mesas o entrega tarjetas de presentación inteligentes con chip NFC. Con un solo toque en el teléfono del comensal, tu tarjeta se abre al instante.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">SPEI & Mercado Pago Oficial</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Facilita pagos con CLABE interbancaria de 18 dígitos con botón de copiado rápido o conecta tu cuenta oficial de Mercado Pago para cobros con tarjetas bancarias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING & COMMERCIAL PLANS */}
      <section id="planes" className="py-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Inversión Transparente
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Planes Flexibles para Todo Tipo de Negocio Gastronómico
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Desde taquerías y food trucks independientes hasta grupos restauranteros de alta gama.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan Básico</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$490</span>
                  <span className="text-xs text-slate-400 font-semibold">MXN / mes</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ideal para cafeterías, food trucks y pequeños locales que desean su primer menú digital interactivo.
                </p>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1 Restaurante digital con URL propia</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hasta 40 platillos y bebidas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pedidos automáticos por WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Código QR descargable en alta resolución</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenAdmin()}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Comenzar Plan Básico
              </button>
            </div>

            {/* Plan 2: Destacado */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-amber-500 p-6 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                Más Elegido por Restaurantes
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pro Gastronómico</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$890</span>
                  <span className="text-xs text-slate-400 font-semibold">MXN / mes</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para restaurantes con salón, alta afluencia y necesidad de cobrar con Mercado Pago o transferencias SPEI.
                </p>

                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Acceso a las 20 plantillas de autor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Platillos, categorías y fotos ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pasarela oficial Mercado Pago & SPEI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gestor de pedidos con estados en vivo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ficha de contacto vCard & Soporte NFC</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenAdmin()}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
              >
                Elegir Plan Pro Gastronómico
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Franquicia / Agencia</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$1,890</span>
                  <span className="text-xs text-slate-400 font-semibold">MXN / mes</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Diseñado para grupos restauranteros con múltiples sucursales o agencias que administran negocios.
                </p>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hasta 10 sucursales o restaurantes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Panel multi-restaurante centralizado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dominio personalizado en Hostinger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Soporte prioritario por WhatsApp</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenAdmin()}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Contactar Asesor de Agencia
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Resolvemos tus Dudas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Los comensales necesitan descargar alguna app para ver el menú?',
                a: 'No. La tarjeta digital se abre al instante en el navegador nativo (Safari, Chrome) de cualquier smartphone simplemente escaneando el código QR o acercando un tag NFC.',
              },
              {
                q: '¿Cómo funciona el pedido directo por WhatsApp?',
                a: 'Cuando el cliente selecciona sus platillos y da clic en "Enviar Pedido por WhatsApp", el sistema genera automáticamente un mensaje estructurado con el nombre del comensal, tipo de entrega (a domicilio, para recoger o mesa), lista de productos con variantes y total estimado.',
              },
              {
                q: '¿Cómo programo una tarjeta física o sticker con chip NFC?',
                a: 'Solo requieres un chip NFC estándar (NTAG213 o NTAG215) y la app gratuita NFC Tools en tu teléfono. Copias el enlace de tu restaurante y lo grabas en 15 segundos. Lo mejor: nunca tendrás que volver a grabarlo si cambias tus precios.',
              },
              {
                q: '¿Cómo puedo publicar esta app en mi hosting de Hostinger?',
                a: 'El proyecto está 100% preparado para Hostinger y GitHub. Puedes compilarlo con "npm run build" y subir la carpeta dist/ a tu public_html en hosting compartido, o ejecutar el servidor Node.js en un VPS de Hostinger.',
              },
              {
                q: '¿Puedo cambiar de plantilla después de haber creado mis platillos?',
                a: 'Sí, totalmente. Cambiar de plantilla no borra tus productos, precios ni datos de contacto. Tu menú se adapta inmediatamente a la nueva estética seleccionada.',
              },
            ].map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-white flex items-center justify-between gap-4 hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-amber-400 font-bold text-base shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
              LAV
            </div>
            <div>
              <p className="font-bold text-slate-300">LAV Digital MKT · Restaurantes</p>
              <p className="text-[11px] text-slate-500">Especialistas en Marketing Gastronómico y Tarjetas Inteligentes</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={onOpenHostingerGuide}
              className="text-amber-400 hover:underline font-semibold"
            >
              Guía de Despliegue en Hostinger & GitHub
            </button>
            <span>·</span>
            <a
              href="https://lavdigitalmkt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              lavdigitalmkt.com
            </a>
          </div>

          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} LAV Digital MKT. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
