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
}) => {
  const [loading, setLoading] = useState(false);
  const [preferenceUrl, setPreferenceUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfigured = Boolean(config.publicKey && config.publicKey.length > 5);

  const handleGenerateCheckout = async () => {
    setLoading(true);
    setErrorMessage(null);
    setPreferenceUrl(null);
    try {
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
      if (!res.ok) throw new Error(data.detail || data.error || `Mercado Pago respondió HTTP ${res.status}.`);
      const checkoutUrl = config.sandboxMode
        ? (data.sandbox_init_point || data.init_point)
        : data.init_point;
      if (!checkoutUrl || !/^https:\/\//i.test(checkoutUrl)) {
        throw new Error('Mercado Pago no devolvió una dirección segura para completar el pago.');
      }
      setPreferenceUrl(checkoutUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo generar el pago con Mercado Pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-5 py-4 bg-[#009EE3] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <span className="text-base font-bold">Mercado Pago Checkout Pro</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-black/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Concepto</p>
              <p className="text-xs font-bold text-slate-800 truncate">Pedido en {restaurantName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-500 font-medium">Total a pagar</p>
              <p className="text-base font-bold text-[#009EE3] tabular-nums">${orderTotal.toFixed(2)} {config.currency || 'MXN'}</p>
            </div>
          </div>

          {!isConfigured ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Mercado Pago aún no está configurado</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                El restaurante debe registrar su Public Key y Access Token en el panel de administración y guardar los cambios antes de recibir pagos.
              </p>
              <a href="https://www.mercadopago.com.mx/developers" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                Abrir Mercado Pago Developers
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>El pago se procesa en el sitio seguro de Mercado Pago. Los datos de tarjeta no pasan por esta aplicación.</span>
              </div>

              {config.sandboxMode && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Modo de prueba (Sandbox)</span>
                  </div>
                  <p className="text-[11px] leading-normal">Completa la operación con usuarios y medios de pago de prueba de Mercado Pago. No se realizará un cobro real.</p>
                </div>
              )}

              {errorMessage && (
                <div role="alert" className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
                  {errorMessage}
                </div>
              )}

              {preferenceUrl ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 text-center">La orden de pago quedó creada. Continúa en Mercado Pago para completar la transacción.</p>
                  <button type="button" onClick={() => window.location.assign(preferenceUrl)} className="w-full py-3 px-4 bg-[#009EE3] hover:bg-[#0082ba] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors">
                    <span>Abrir pasarela de pago</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  {config.sandboxMode && <p className="text-[11px] text-slate-500 text-center">Usa una cuenta y tarjeta de prueba de Mercado Pago.</p>}
                </div>
              ) : (
                <button type="button" onClick={handleGenerateCheckout} disabled={loading} className="w-full py-3 px-4 bg-[#009EE3] hover:bg-[#0082ba] disabled:opacity-60 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? 'Conectando con Mercado Pago…' : 'Continuar a Mercado Pago'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
