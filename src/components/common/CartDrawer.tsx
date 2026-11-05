import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle, CreditCard, Building2, MapPin, Store, AlertCircle } from 'lucide-react';
import { CartItem, Restaurant } from '../../types/restaurant';
import { buildWhatsAppOrderMessage, OrderService } from '../../services/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOpenBankTransfer: (orderTotal: number) => void;
  onOpenMercadoPago: (orderTotal: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  restaurant,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenBankTransfer,
  onOpenMercadoPago,
}) => {
  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'dine_in'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);
  const deliveryFee = orderType === 'delivery' ? 45 : 0;
  const total = subtotal + deliveryFee;

  const handleWhatsAppOrder = async () => {
    if (!customerName.trim()) {
      alert('Por favor escribe tu nombre antes de enviar el pedido.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      alert('Por favor escribe tu dirección de entrega.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create order record
      await OrderService.createOrder({
        restaurantId: restaurant.id,
        restaurantSlug: restaurant.slug,
        customerName,
        customerPhone: customerPhone || restaurant.contact.whatsapp,
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
        deliveryNotes: generalNotes,
        items: cart.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          variantName: i.selectedVariant?.name,
          extras: i.selectedExtras?.map((e) => e.name),
          quantity: i.quantity,
          unitPrice: i.selectedVariant ? i.selectedVariant.price : i.product.price,
          subtotal: i.itemTotal,
          notes: i.notes,
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod: 'whatsapp',
        paymentStatus: 'pendiente',
        orderStatus: 'recibido',
      });

      // Format WhatsApp URL
      const itemsPayload = cart.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.itemTotal / i.quantity,
        notes: i.notes,
        variant: i.selectedVariant?.name,
        extras: i.selectedExtras?.map((e) => e.name),
      }));

      const encodedMsg = buildWhatsAppOrderMessage(
        restaurant,
        itemsPayload,
        orderType,
        customerName,
        deliveryAddress,
        'Pedido Directo por WhatsApp'
      );

      const targetPhone = restaurant.contact.whatsapp.replace(/\D/g, '');
      const waUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;
      
      onClearCart();
      onClose();
      window.open(waUrl, '_blank');
    } catch {
      alert('Hubo un inconveniente al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferClick = () => {
    if (!customerName.trim()) {
      alert('Por favor escribe tu nombre para registrar tu orden.');
      return;
    }
    onOpenBankTransfer(total);
  };

  const handleMercadoPagoClick = () => {
    if (!customerName.trim()) {
      alert('Por favor escribe tu nombre para procesar tu pago.');
      return;
    }
    onOpenMercadoPago(total);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              <h2 className="text-base font-bold text-slate-900">Tu Pedido</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                {cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-slate-700 font-medium">Tu canasta está vacía</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Explora el menú y selecciona los platillos que deseas ordenar.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {item.product.name}
                          </h4>
                          {item.selectedVariant && (
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              Opción: {item.selectedVariant.name}
                            </p>
                          )}
                          {item.selectedExtras && item.selectedExtras.length > 0 && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Extras: {item.selectedExtras.map((e) => e.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs italic text-slate-500 mt-0.5">
                              Nota: &quot;{item.notes}&quot;
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          ${item.itemTotal} MXN
                        </span>
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>

                        <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:text-slate-900"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-slate-800 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:text-slate-900"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Type Selector */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    Modalidad de Entrega
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        orderType === 'pickup'
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Para Recoger</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        orderType === 'delivery'
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>A Domicilio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        orderType === 'dine_in'
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>En Mesa</span>
                    </button>
                  </div>
                </div>

                {/* Contact & Address Fields */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Tu Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Teléfono de Contacto (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej. 55 1234 5678"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {orderType === 'delivery' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Dirección de Entrega y Referencias *
                      </label>
                      <textarea
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Calle, número, colonia, código postal y referencias (ej. edificio blanco puerta café)"
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  )}

                  {orderType === 'dine_in' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Número de Mesa o Zona
                      </label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="Ej. Mesa 4 Terraza"
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Comentarios o notas para cocina
                    </label>
                    <input
                      type="text"
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      placeholder="Ej. Salsa aparte, servilletas extra..."
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer with Totals and Action Buttons */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Financial Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-700 tabular-nums">${subtotal} MXN</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between text-slate-500">
                    <span>Costo de envío estimado</span>
                    <span className="font-semibold text-slate-700 tabular-nums">${deliveryFee} MXN</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total a Pagar</span>
                  <span className="text-base text-emerald-700 tabular-nums">${total} MXN</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* 1. Pedir por WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enviar Pedido por WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>

                {/* 2. Transferencia Bancaria */}
                {restaurant.features.bankTransfer && (
                  <button
                    type="button"
                    onClick={handleTransferClick}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Pagar con Transferencia (SPEI / CLABE)</span>
                  </button>
                )}

                {/* 3. Mercado Pago */}
                {restaurant.features.mercadoPago && (
                  <button
                    type="button"
                    onClick={handleMercadoPagoClick}
                    className="w-full py-2.5 px-4 bg-[#009EE3] hover:bg-[#0082ba] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar en línea con Mercado Pago</span>
                  </button>
                )}
              </div>

              <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Precios en pesos mexicanos (MXN) con impuestos incluidos.</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
