import { Restaurant } from '../types/restaurant';

export function generateStandaloneCardHtml(restaurant: Restaurant): string {
  const { branding, contact, socialLinks, features, schedule, categories, products, bankDetails } = restaurant;

  const serializedData = JSON.stringify(restaurant).replace(/</g, '\\u003c');
  const orderSettings = restaurant.ordering || { enabled: true, destination: 'whatsapp', buttonLabel: 'Agregar al pedido' };
  const orderingEnabled = orderSettings.enabled !== false && orderSettings.destination !== 'disabled' && (orderSettings.destination === 'custom_url' || features.whatsappOrders || features.pickupOrders || features.deliveryOrders);
  const orderButtonLabel = orderSettings.buttonLabel || 'Agregar al pedido';
  const design = branding.buttonDesign || {};
  const buttonBackground = design.variant === 'outline' ? 'transparent' : (design.backgroundColor || branding.accentColor || '#D6A85F');
  const buttonTextColor = design.textColor || (design.variant === 'outline' ? branding.textColor : '#101827');
  const buttonBorder = design.borderColor || branding.accentColor || '#D6A85F';
  const buttonFont = design.fontFamily || 'Plus Jakarta Sans';
  const buttonFontSize = design.fontSize === 'small' ? '11px' : design.fontSize === 'large' ? '15px' : '13px';
  const buttonAlign = design.alignment || 'center';

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
    .category-list{display:flex;flex-wrap:wrap;align-items:center;gap:9px}
    .cat-pill{border:1px solid \${branding.textColor}30;color:\${branding.textColor};background:\${branding.surfaceColor};padding:10px 16px;border-radius:999px;font-size:12px;font-weight:700;white-space:normal;transition:.2s}
    .cat-pill.active{background:\${branding.accentColor};color:#101827;border-color:\${branding.accentColor};box-shadow:0 6px 20px \${branding.accentColor}35}
    .products-grid{display:grid;grid-template-columns:1fr;gap:22px}
    .product-card{overflow:hidden;border-radius:22px;background:\${branding.surfaceColor};border:1px solid \${branding.textColor}16;box-shadow:0 12px 35px rgba(0,0,0,.10)}
    .product-photo{width:100%;aspect-ratio:16/10;display:block;position:relative;overflow:hidden;background:#171b25;cursor:zoom-in}
    .product-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s}
    .product-photo:hover img{transform:scale(1.035)}
    .product-tag{position:absolute;left:14px;top:14px;background:\${branding.accentColor};color:#101827;border-radius:999px;padding:6px 10px;font-size:10px;font-weight:800}
    .product-tag-secondary{left:auto;right:14px;background:rgba(15,23,42,.82);color:white}
    .product-copy{padding:17px}.product-copy h3{font-size:16px;line-height:1.3;font-weight:800}
    .product-price{color:\${branding.accentColor};white-space:nowrap;font-size:16px;font-weight:900}.product-price small{font-size:9px;opacity:.7}
    .product-copy p{opacity:.68;font-size:12px;line-height:1.65;margin-top:8px}
    .product-add,.checkout-button{display:flex;align-items:center;justify-content:center;width:100%;margin-top:15px;padding:12px 16px;border-radius:16px;color:\${buttonTextColor};background:\${buttonBackground};border:1px solid \${buttonBorder};font-family:'\${buttonFont}',sans-serif;font-size:\${buttonFontSize};font-weight:800;text-align:\${buttonAlign};transition:transform .2s}
    .product-unavailable{display:inline-flex;margin-top:12px;font-size:11px;opacity:.55}
    .cart-fab{position:fixed;z-index:60;bottom:18px;left:50%;transform:translateX(-50%);width:min(92vw,520px);display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-radius:999px;color:\${buttonTextColor};background:\${buttonBackground};border:1px solid \${buttonBorder};box-shadow:0 15px 40px rgba(0,0,0,.35);font-family:'\${buttonFont}',sans-serif;font-weight:800}
    .cart-count{min-width:24px;height:24px;display:grid;place-items:center;border-radius:50%;background:rgba(0,0,0,.18);font-size:11px}
    .cart-panel{position:absolute;top:0;right:0;height:100%;width:min(100%,520px);padding:22px;display:flex;flex-direction:column;background:\${branding.bgColor};color:\${branding.textColor};box-shadow:-20px 0 60px rgba(0,0,0,.35)}
    .cart-close{width:38px;height:38px;border-radius:50%;background:\${branding.surfaceColor};font-size:24px}
    .cart-line{display:flex;gap:12px;align-items:center;padding:12px;border-radius:16px;background:\${branding.surfaceColor}}
    .cart-line img{width:64px;height:64px;border-radius:12px;object-fit:cover}
    .cart-qty{display:flex;align-items:center;gap:10px;padding:5px 9px;border-radius:999px;background:\${branding.bgColor};font-size:12px;font-weight:800}
    .cart-qty button{width:24px;height:24px;border-radius:50%;background:\${branding.surfaceColor}}
    .checkout-button{margin-top:0;padding:15px}.checkout-button:disabled{opacity:.4;cursor:not-allowed}
    @media(min-width:700px){.products-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}}
    @media(max-width:420px){.product-copy{padding:14px}.product-copy h3{font-size:14px}.product-price{font-size:14px}.cat-pill{padding:9px 13px}.cart-panel{padding:17px}}
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-start pb-24">

  <!-- Central Mobile Container -->
  <div class="w-full max-w-5xl min-h-screen relative shadow-2xl flex flex-col" style="background-color: ${branding.bgColor};">

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
    <main id="menu-section" class="w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex-1">
      <div class="max-w-5xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
          <div><span class="text-[10px] uppercase tracking-[.24em] font-bold opacity-60">Nuestra cocina</span><h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Menú digital</h2><p class="text-sm opacity-65 mt-1">Descubre cada platillo y sus ingredientes</p></div>
          <input id="menu-search" type="search" placeholder="Buscar en el menú..." class="w-full sm:w-64 rounded-full px-4 py-2.5 text-sm outline-none border" style="background:\${branding.surfaceColor};border-color:\${branding.textColor}25;color:\${branding.textColor}">
        </div>
        <div class="category-list mb-6">
          <button onclick="filterCategory('all',this)" class="cat-pill active">Todos (\${products.length})</button>
          \${categories.map((c) => \`<button onclick="filterCategory('\${c.id}',this)" class="cat-pill">\${c.name}</button>\`).join('')}
        </div>
        <div id="products-container" class="products-grid">
          \${products.map((p) => \`
            <article class="product-card" data-category="\${p.categoryId}" data-name="\${(p.name || '').toLowerCase()}" data-description="\${(p.description || '').toLowerCase()}">
              <button type="button" class="product-photo" onclick="openProductPhoto('\${p.id}')" aria-label="Ampliar fotografía de \${p.name}">
                <img src="\${p.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=85'}" alt="\${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=85'">
                \${(p.tags || []).includes('nuevo') ? '<span class="product-tag">Nuevo</span>' : ''}
                \${(p.tags || []).includes('favorito') ? '<span class="product-tag product-tag-secondary">Favorito</span>' : ''}
              </button>
              <div class="product-copy"><div class="flex items-start justify-between gap-3"><h3>\${p.name}</h3><span class="product-price">$ \${p.price} <small>MXN</small></span></div><p>\${p.description || ''}</p>
                \${p.available ? (orderingEnabled ? \`<button type="button" class="product-add" onclick="addToCart('\${p.id}')">\${orderButtonLabel}</button>\` : '') : '<span class="product-unavailable">Por el momento no disponible</span>'}
              </div>
            </article>
          \`).join('')}
        </div>
        <p id="menu-empty" class="hidden text-center py-12 opacity-60 text-sm">No encontramos platillos con esa búsqueda.</p>
      </div>
    </main>
    <div id="photo-lightbox" class="fixed inset-0 z-[70] hidden items-center justify-center bg-black/95 p-4" onclick="closeProductPhoto()"><button class="absolute top-4 right-4 text-white text-3xl" aria-label="Cerrar">×</button><img id="photo-lightbox-image" class="max-h-[90vh] max-w-[95vw] object-contain rounded-xl" alt="Fotografía del platillo"></div>
    \${orderingEnabled ? \`
    <button id="cart-fab" type="button" onclick="openCart()" class="cart-fab"><span>Mi pedido</span><span id="cart-count" class="cart-count">0</span><strong id="cart-total">$0 MXN</strong></button>
    <div id="cart-drawer" class="fixed inset-0 z-[80] hidden">
      <button class="absolute inset-0 bg-black/65 backdrop-blur-sm" onclick="closeCart()" aria-label="Cerrar pedido"></button>
      <section class="cart-panel"><header class="flex items-center justify-between border-b pb-4" style="border-color:\${branding.textColor}20"><div><span class="text-[10px] uppercase tracking-widest opacity-60">Tu selección</span><h2 class="text-xl font-extrabold">Mi pedido</h2></div><button onclick="closeCart()" class="cart-close" aria-label="Cerrar">×</button></header>
        <div id="cart-items" class="flex-1 overflow-y-auto py-4 space-y-3"><p class="text-sm opacity-60 text-center py-10">Todavía no agregas platillos.</p></div>
        <footer class="border-t pt-4 space-y-3" style="border-color:\${branding.textColor}20"><div class="flex justify-between text-sm"><span class="opacity-70">Subtotal</span><strong id="cart-subtotal">$0 MXN</strong></div><div class="flex justify-between text-lg font-extrabold"><span>Total</span><strong id="cart-total-panel">$0 MXN</strong></div><button id="checkout-button" onclick="sendOrder()" class="checkout-button" disabled>Continuar con mi pedido</button><p class="text-[10px] opacity-55 text-center">Confirma disponibilidad y costo final con el restaurante.</p></footer>
      </section>
    </div>\` : ''}
    <!-- FOOTER -->
    <footer class="p-6 border-t text-center space-y-2 text-xs" style="background-color: ${branding.surfaceColor}; border-color: ${branding.textColor}15;">
      <p class="font-bold text-sm">${restaurant.name}</p>
      <p class="opacity-70">${contact.address}</p>
      
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

    const menuProducts = \${JSON.stringify(products).replace(/</g, '\\u003c')};
    const orderConfig = \${JSON.stringify(orderSettings).replace(/</g, '\\u003c')};
    const cart = new Map();
    const money = value => '  </script>
</body>
</html>`;
}
 + Number(value || 0).toLocaleString('es-MX',{maximumFractionDigits:2}) + ' MXN';
    function filterCategory(catId,btn){document.querySelectorAll('.cat-pill').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.product-card').forEach(card=>card.style.display=(catId==='all'||card.dataset.category===catId)?'':'none');updateEmptyState();}
    function addToCart(id){const product=menuProducts.find(p=>p.id===id);if(!product||!product.available)return;const item=cart.get(id)||{product,quantity:0};item.quantity++;cart.set(id,item);renderCart();}
    function changeQuantity(id,delta){const item=cart.get(id);if(!item)return;item.quantity+=delta;if(item.quantity<=0)cart.delete(id);renderCart();}
    function renderCart(){const rows=[...cart.values()],count=rows.reduce((s,i)=>s+i.quantity,0),total=rows.reduce((s,i)=>s+i.quantity*Number(i.product.price||0),0);const c=document.getElementById('cart-count'),t=document.getElementById('cart-total'),sub=document.getElementById('cart-subtotal'),pt=document.getElementById('cart-total-panel');if(c)c.textContent=String(count);if(t)t.textContent=money(total);if(sub)sub.textContent=money(total);if(pt)pt.textContent=money(total);const box=document.getElementById('cart-items'),go=document.getElementById('checkout-button');if(box)box.innerHTML=rows.length?rows.map(({product,quantity})=>'<div class="cart-line"><img src="'+(product.imageUrl||'')+'" alt=""><div class="min-w-0 flex-1"><strong class="block text-sm">'+escapeText(product.name)+'</strong><span class="text-xs opacity-65">'+money(product.price)+'</span><div class="cart-qty mt-2"><button onclick="changeQuantity(\\''+product.id+'\\',-1)">−</button><span>'+quantity+'</span><button onclick="changeQuantity(\\''+product.id+'\\',1)">+</button></div></div><strong class="text-sm">'+money(quantity*Number(product.price||0))+'</strong></div>').join(''):'<p class="text-sm opacity-60 text-center py-10">Todavía no agregas platillos.</p>';if(go)go.disabled=!rows.length;}
    function escapeText(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
    function openCart(){document.getElementById('cart-drawer')?.classList.remove('hidden');}
    function closeCart(){document.getElementById('cart-drawer')?.classList.add('hidden');}
    function sendOrder(){const rows=[...cart.values()];if(!rows.length)return;const total=rows.reduce((s,i)=>s+i.quantity*Number(i.product.price||0),0);const lines=rows.map(({product,quantity})=>quantity+' x '+product.name+' — '+money(quantity*Number(product.price||0)));const summary=['Pedido para \${restaurant.name}',...lines,'Total: '+money(total)].join('\\n');if(orderConfig.destination==='custom_url'&&orderConfig.customUrl){try{const target=new URL(orderConfig.customUrl);target.searchParams.set('pedido',summary);window.location.href=target.toString();}catch{alert('La URL de destino no es válida.');}return;}const phone='\${contact.whatsapp.replace(/\\D/g, '')}';if(!phone){alert('El restaurante no ha configurado su WhatsApp.');return;}window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(summary),'_blank','noopener');}
    function openProductPhoto(id){const p=menuProducts.find(x=>x.id===id);if(!p||!p.imageUrl)return;const box=document.getElementById('photo-lightbox');document.getElementById('photo-lightbox-image').src=p.imageUrl;box.classList.remove('hidden');box.classList.add('flex');}
    function closeProductPhoto(){const box=document.getElementById('photo-lightbox');box.classList.add('hidden');box.classList.remove('flex');}
    function updateEmptyState(){const shown=[...document.querySelectorAll('.product-card')].some(c=>c.style.display!=='none');document.getElementById('menu-empty')?.classList.toggle('hidden',shown);}
    document.getElementById('menu-search')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.product-card').forEach(c=>c.style.display=(c.dataset.name+' '+c.dataset.description).includes(q)?'':'none');updateEmptyState();});
    renderCart();
  </script>
</body>
</html>`;
}
