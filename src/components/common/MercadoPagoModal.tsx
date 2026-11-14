import React, { useState } from 'react';
import { X, CreditCard, ExternalLink, ShieldCheck, AlertCircle, Info, Lock } from 'lucide-react';
import { MercadoPagoConfig } from '../../types/restaurant';

interface MercadoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MercadoPagoConfig;
  orderTotal: number;
  restaurantName: string;
  restaurantSlug: string;
  orderId?: string;
  onPaymentSuccess?: (paymentId: string) => void;
}

export const MercadoPagoModal: React.FC<MercadoPagoModalProps> = ({
  isOpen,
  onClose,
  config,
  orderTotal,
  restaurantName,
  restaurantSlug,
  orderId = 'ORD-' + Math.floor(Math.random() * 89999 + 10000),
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [preferenceUrl, setPreferenceUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  // Checkout Pro creates its preference server-side; the private Access Token is the credential that authorizes it.
  const isConfigured = Boolean(config.publicKey && config.publicKey.length > 5);

  const handleGenerateCheckout = async () => {
    setLoading(true);
    try {
      // Call backend preference endpoint
      const res = await fetch('/Restaurantes/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Pedido en ${restaurantName} (#${orderId})`,
          price: orderTotal,
          quantity: 1,
          currency_id: config.currency || 'MXN',
          external_reference: orderId,
          restaurant_slug: restaurantSlug,
          sandbox_mode: config.sandboxMode,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.detail || `Mercado Pago respondió HTTP ${res.status}.`);
      if (!data.init_point) throw new Error('Mercado Pago no devolvió el enlace de pago.');
      const checkoutUrl = config.sandboxMode ? (data.sandbox_init_point || data.init_point) : data.init_point;
      setPreferenceUrl(checkoutUrl);
      return;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo conectar con Mercado Pago.');
    } finally {
      setLoading(false);
    }

    setPreferenceUrl(null);
  };

  const handleSimulateTestPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTestApproved(true);
      if (onPaymentSuccess) {
        onPaymentSuccess('MP-' + Date.now());
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header with official Mercado Pago visual tone */}
        <div className="px-5 py-4 bg-[#009EE3] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-white" />
            <span className="text-base font-bold">Mercado Pago Checkout</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Order Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Concepto:</p>
              <p className="text-xs font-bold text-slate-800">Pedido en {restaurantName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Total a cobrar:</p>
              <p className="text-base font-bold text-[#009EE3] tabular-nums">
                ${orderTotal} {config.currency || 'MXN'}
              </p>
            </div>
          </div>

          {!isConfigured ? (
            /* Warning if restaurant owner has not entered Mercado Pago credentials yet */
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Credenciales en modo configuración</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Este restaurante aún no ha vinculado sus credenciales oficiales de Mercado Pago en su Panel de Administración.
              </p>
              <p className="text-[11px] text-amber-800">
                Los cobros reales requieren configurar tu <strong>Public Key</strong> y <strong>Access Token</strong> desde{' '}
                <a
                  href="https://www.mercadopago.com.mx/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold text-amber-950"
                >
                  developers.mercadopago.com
                </a>.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Security Badge */}
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Conexión cifrada de 256 bits procesada por Mercado Pago.</span>
              </div>

              {config.sandboxMode && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Modo de Prueba (Sandbox) Activado</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-normal">
                    La pasarela opera con credenciales de prueba seguras. Puedes probar la creación de la orden sin cobro real a tu tarjeta bancaria.
                  </p>
                </div>
              )}

              {preferenceUrl ? (
                <button
                  type="button"
                  onClick={handleGenerateCheckout}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#009EE3] hover:bg-[#0082ba] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? 'Generando orden...' : 'Generar Orden en Mercado Pago'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
