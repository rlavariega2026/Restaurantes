import { Restaurant } from '../types/restaurant';

export function generateStandaloneCardHtml(restaurant: Restaurant): string {
  const { branding, contact, socialLinks, features, schedule, categories, products, bankDetails } = restaurant;

  const serializedData = JSON.stringify(restaurant).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${restaurant.name} · Tarjeta Digital Gastronómica</title>
  <meta name="description" content="${restaurant.tagline || restaurant.description || 'Menú digital y tarjeta gastronómica interactiva.'}">
  
  <!-- OpenGraph Social Sharing -->
  <meta property="og:title" content="${restaurant.name}">
  <meta property="og:description" content="${restaurant.tagline || restaurant.description}">
  <meta property="og:image" content="${branding.coverUrl || ''}">
  <meta property="og:type" content="restaurant.restaurant">

  <!-- Fonts & Tailwind CSS CDN -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Cinzel:wght@600;800&family=Oswald:wght@500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: ${branding.bgColor || '#090D16'};
      color: ${branding.textColor || '#FFFFFF'};
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .font-serif-luxury { font-family: 'Playfair Display', serif; }
    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-oswald { font-family: 'Oswald', sans-serif; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-start pb-24">

  <!-- Central Mobile Container -->
  <div class="w-full max-w-md min-h-screen relative shadow-2xl flex flex-col" style="background-color: ${branding.bgColor};">

    <!-- HERO COVER -->
    <header class="relative w-full overflow-hidden ${restaurant.templateId === 'portada-inmersiva' ? 'h-[100dvh]' : 'h-72'} bg-slate-900">
      <img 
        src="${branding.coverUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80'}" 
        alt="${restaurant.name}" 
        class="w-full h-full object-cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>

      <!-- Top Nav Badges -->
      <div class="absolute top-4 inset-x-4 flex items-center justify-between z-10">
        <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
          ${restaurant.cuisineType || 'Gastronomía'}
        </span>
        <a href="https://wa.me/${contact.whatsapp.replace(/\D/g, '')}" target="_blank" class="p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.178.181-.077.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.087s1.011.477 1.184.564.289.13.332.202c.044.072.044.419-.1.824z"/></svg>
        </a>
      </div>

      <!-- Hero Titles -->
      <div class="absolute bottom-5 inset-x-5 text-white z-10 space-y-1">
        <h1 class="text-3xl font-black leading-tight tracking-tight">${restaurant.name}</h1>
        <p class="text-xs text-white/90 font-medium line-clamp-2">${restaurant.tagline || ''}</p>
      </div>
    </header>

    <!-- QUICK ACTIONS BAR -->
    <section class="p-4 border-b space-y-3" style="background-color: ${branding.surfaceColor}; border-color: ${branding.textColor}1A;">
      <p class="text-xs opacity-85 leading-relaxed">${restaurant.description || ''}</p>

      <div class="grid grid-cols-3 gap-2 text-xs font-bold pt-1">
        <a href="https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola ' + restaurant.name + ', te contacto desde tu tarjeta digital.')}" target="_blank" class="py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-white" style="background-color: ${branding.accentColor};">
          <span>WhatsApp</span>
        </a>
        <a href="tel:${contact.phone.replace(/\s+/g, '')}" class="py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5" style="border-color: ${branding.textColor}30; color: ${branding.textColor};">
          <span>Llamar</span>
        </a>
        <a href="${contact.googleMapsUrl || 'https://maps.google.com/?q=' + encodeURIComponent(contact.address)}" target="_blank" class="py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5" style="border-color: ${branding.textColor}30; color: ${branding.textColor};">
          <span>Ubicación</span>
        </a>
      </div>

      <!-- HORARIOS DESPLEGABLES -->
      <div class="pt-2">
        <button id="toggle-schedule-btn" type="button" class="w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between text-left transition-all" style="border-color: ${branding.textColor}25; background-color: ${branding.bgColor}80; color: ${branding.textColor};">
          <div class="flex items-center gap-2">
            <span class="text-sm">🕒</span>
            <div>
              <span class="font-bold text-xs block">Horarios de Atención Semanales</span>
              <span class="text-[11px] opacity-70">Toca para abrir calendario completo</span>
            </div>
          </div>
          <span id="schedule-indicator" class="text-xs opacity-60 font-bold">Ver ▼</span>
        </button>

        <div id="schedule-panel" class="hidden mt-2 p-3 rounded-xl border text-xs space-y-1.5" style="background-color: ${branding.surfaceColor}; border-color: ${branding.textColor}20; color: ${branding.textColor};">
          ${schedule.map((s) => `
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="font-medium">${s.day}</span>
              <span class="font-bold ${s.closed ? 'text-rose-500' : ''}">${s.closed ? 'Cerrado' : s.open + ' - ' + s.close}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- METODOS DE COBRO SPEI CON BOTONES DE COPIAR -->
    ${features.bankTransfer ? `
    <section class="px-4 py-3">
      <div class="rounded-2xl border overflow-hidden" style="background-color: ${branding.surfaceColor}; border-color: ${branding.textColor}25;">
        <button id="toggle-payments-btn" type="button" class="w-full p-4 flex items-center justify-between text-left" style="color: ${branding.textColor};">
          <div class="flex items-center gap-2.5">
            <span class="text-base">💳</span>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-black uppercase tracking-wider">Métodos de Cobro & SPEI</span>
                <span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-500 uppercase">Sin Comisión</span>
              </div>
              <p class="text-[11px] opacity-70">Toca para ver cuenta y copiar datos con 1 clic</p>
            </div>
          </div>
          <span id="payments-indicator" class="text-xs font-bold opacity-75">Ver ▼</span>
        </button>

        <div id="payments-panel" class="hidden px-4 pb-4 pt-1 border-t space-y-2 text-xs" style="border-color: ${branding.textColor}15;">
          <div class="p-2.5 rounded-xl bg-black/10 dark:bg-white/5 space-y-2">
            <!-- Banco -->
            <div class="flex items-center justify-between py-1 border-b border-white/5">
              <div>
                <span class="text-[10px] uppercase font-bold opacity-60 block">Banco</span>
                <span class="font-bold">${bankDetails.bankName || 'Banco Receptor'}</span>
              </div>
              <button onclick="copyData('${bankDetails.bankName}', this)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border" style="border-color: ${branding.textColor}30;">Copiar</button>
            </div>

            <!-- Titular -->
            <div class="flex items-center justify-between py-1 border-b border-white/5">
              <div>
                <span class="text-[10px] uppercase font-bold opacity-60 block">Titular / Beneficiario</span>
                <span class="font-bold">${bankDetails.accountHolder}</span>
              </div>
              <button onclick="copyData('${bankDetails.accountHolder}', this)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border" style="border-color: ${branding.textColor}30;">Copiar</button>
            </div>

            <!-- CLABE -->
            <div class="flex items-center justify-between py-1 border-b border-white/5">
              <div>
                <span class="text-[10px] uppercase font-bold opacity-60 block">CLABE Interbancaria (18 dígitos)</span>
                <span class="font-mono font-bold">${bankDetails.clabe}</span>
              </div>
              <button onclick="copyData('${bankDetails.clabe}', this)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border" style="border-color: ${branding.textColor}30;">Copiar</button>
            </div>

            <!-- Concepto -->
            <div class="flex items-center justify-between py-1">
              <div>
                <span class="text-[10px] uppercase font-bold opacity-60 block">Concepto</span>
                <span class="font-bold">${restaurant.name.slice(0, 16)}</span>
              </div>
              <button onclick="copyData('${restaurant.name.slice(0, 16)}', this)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border" style="border-color: ${branding.textColor}30;">Copiar</button>
            </div>
          </div>

          <a href="https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola ' + restaurant.name + ', te envío mi comprobante de pago.')}" target="_blank" class="w-full py-2 rounded-xl text-center font-bold text-xs block text-white bg-emerald-600 hover:bg-emerald-500">
            Enviar Comprobante por WhatsApp
          </a>
        </div>
      </div>
    </section>
    ` : ''}

    <!-- MENU DIGITAL INTERACTIVO -->
    <main class="px-4 py-4 space-y-4 flex-1">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-black tracking-tight">Menú Digital</h2>
          <p class="text-xs opacity-70">Explora nuestros platillos y bebidas preparadas al momento</p>
        </div>
      </div>

      <!-- Categories Pills -->
      <div class="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button onclick="filterCategory('all', this)" class="cat-pill active px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-amber-500 text-slate-950">
          Todos (${products.length})
        </button>
        ${categories.map((c) => `
          <button onclick="filterCategory('${c.id}', this)" class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border" style="border-color: ${branding.textColor}30; color: ${branding.textColor};">
            ${c.name}
          </button>
        `).join('')}
      </div>

      <!-- Products Grid -->
      <div id="products-container" class="space-y-3">
        ${products.map((p) => `
          <div class="product-card p-3 rounded-2xl border flex gap-3 items-center" data-category="${p.categoryId}" style="background-color: ${branding.surfaceColor}; border-color: ${branding.textColor}1A;">
            <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">
              <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80'}" alt="${p.name}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-xs leading-tight">${p.name}</h3>
              <p class="text-[11px] opacity-70 line-clamp-2 mt-0.5">${p.description}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="font-extrabold text-xs text-amber-400 tabular-nums">$${p.price} MXN</span>
                <a href="https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola ' + restaurant.name + ', quisiera pedir: ' + p.name + ' ($' + p.price + ' MXN)')}" target="_blank" class="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-950 bg-amber-500 hover:bg-amber-400">
                  Pedir
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </main>

    <!-- FOOTER -->
    <footer class="p-6 border-t text-center space-y-2 text-xs" style="background-color: ${branding.surfaceColor}; border-color: ${branding.textColor}15;">
      <p class="font-bold text-sm">${restaurant.name}</p>
      <p class="opacity-70">${contact.address}</p>
      <p class="text-[10px] opacity-50 pt-2">Diseñado con tecnología LAV Digital MKT · Tarjeta Digital Gastronómica</p>
    </footer>

  </div>

  <script>
    // Copy data helper with visual feedback
    function copyData(text, btn) {
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = '¡Copiado!';
        btn.classList.add('bg-emerald-600', 'text-white');
        setTimeout(() => {
          btn.innerText = originalText;
          btn.classList.remove('bg-emerald-600', 'text-white');
        }, 2000);
      });
    }

    // Toggle Schedule
    const schBtn = document.getElementById('toggle-schedule-btn');
    const schPanel = document.getElementById('schedule-panel');
    const schInd = document.getElementById('schedule-indicator');
    if (schBtn && schPanel) {
      schBtn.addEventListener('click', () => {
        schPanel.classList.toggle('hidden');
        schInd.innerText = schPanel.classList.contains('hidden') ? 'Ver ▼' : 'Ocultar ▲';
      });
    }

    // Toggle Payments
    const payBtn = document.getElementById('toggle-payments-btn');
    const payPanel = document.getElementById('payments-panel');
    const payInd = document.getElementById('payments-indicator');
    if (payBtn && payPanel) {
      payBtn.addEventListener('click', () => {
        payPanel.classList.toggle('hidden');
        payInd.innerText = payPanel.classList.contains('hidden') ? 'Ver ▼' : 'Ocultar ▲';
      });
    }

    // Category filter
    function filterCategory(catId, btn) {
      document.querySelectorAll('.cat-pill').forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950');
      });
      btn.classList.add('bg-amber-500', 'text-slate-950');

      document.querySelectorAll('.product-card').forEach(card => {
        if (catId === 'all' || card.getAttribute('data-category') === catId) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}
