import React, { useState } from 'react';
import { X, Copy, Check, Share2, Smartphone, Download, Radio, MessageSquare, Facebook, Send, ExternalLink } from 'lucide-react';
import { Restaurant } from '../../types/restaurant';
import { downloadVCard } from '../../services/storage';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onOpenQr: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onOpenQr,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'nfc' | 'preview'>('share');

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/restaurantes/${restaurant.slug}/`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: `${restaurant.name} — ${restaurant.tagline}`,
          url: publicUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🍽️ Te comparto la tarjeta digital interactiva de *${restaurant.name}*:\n${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent(restaurant.name)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">Compartir Tarjeta Digital</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Control Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'share'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Difusión & Redes
          </button>
          <button
            onClick={() => setActiveTab('nfc')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'nfc'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Programar NFC
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Vista Previa Social
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'share' && (
            <div className="space-y-4">
              {/* Copy URL Row */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Enlace público de la tarjeta:</label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-mono text-slate-700 truncate flex-1 text-[11px]">
                    {publicUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Native Mobile Share Button */}
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>Compartir desde el Menú de tu Teléfono</span>
              </button>

              {/* Quick Social Buttons */}
              <div className="space-y-2">
                <p className="font-semibold text-slate-500 text-[11px]">Compartir directamente en:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={shareWhatsApp}
                    className="p-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={shareFacebook}
                    className="p-2.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
                  >
                    <Facebook className="w-3.5 h-3.5 text-blue-600 fill-current" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={shareTelegram}
                    className="p-2.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors border border-sky-200"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-600" />
                    <span>Telegram</span>
                  </button>
                </div>
              </div>

              {/* vCard download */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Guardar Contacto en el Teléfono</p>
                  <p className="text-[11px] text-slate-500">Descarga la ficha vCard (.vcf) para la agenda</p>
                </div>
                <button
                  onClick={() => downloadVCard(restaurant)}
                  className="py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg flex items-center gap-1 text-[11px] transition-colors"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Descargar vCard</span>
                </button>
              </div>

              {/* QR Code Shortcut */}
              <button
                onClick={() => {
                  onClose();
                  onOpenQr();
                }}
                className="w-full py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Ver y Descargar Código QR para Mesas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === 'nfc' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>¿Cómo Grabar esta Tarjeta en un Tag NFC?</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Cualquier tarjeta de plástico o sticker con chip <strong>NTAG213, NTAG215 o NTAG216</strong> puede programarse en menos de 30 segundos usando cualquier smartphone con NFC:
              </p>

              <ol className="list-decimal list-inside space-y-2 text-slate-700 text-[11px] bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <li>
                  Descarga la app gratuita <strong>NFC Tools</strong> (disponible en App Store y Google Play).
                </li>
                <li>
                  Abre la app y selecciona la pestaña <strong>Escribir</strong> (Write) → <strong>Añadir un registro</strong> (Add a record).
                </li>
                <li>
                  Selecciona la opción <strong>URL / Enlace web</strong> y pega la URL de esta tarjeta:
                  <div className="mt-1 font-mono text-[10px] bg-white p-1.5 rounded border border-slate-200 select-all">
                    {publicUrl}
                  </div>
                </li>
                <li>
                  Toca <strong>Escribir</strong> y acerca la tarjeta física o sticker a la parte trasera de tu teléfono. ¡Listo!
                </li>
              </ol>

              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-[11px]">
                <strong>Ventaja de LAV Digital MKT:</strong> No necesitas volver a grabar el chip NFC si cambias precios o platillos. La tarjeta se actualiza en la nube y el tag siempre abrirá la versión más reciente.
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-3">
              <p className="text-slate-600 text-[11px]">
                Así es como WhatsApp, Telegram, Facebook e iMessage muestran la tarjeta cuando la envías por chat:
              </p>

              {/* Simulated OpenGraph Preview Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50">
                <div className="h-40 bg-slate-200 relative overflow-hidden">
                  <img
                    src={restaurant.branding.coverUrl || '/src/assets/images/hero_culinary_editorial_1793142965729.jpg'}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <span className="text-[10px] uppercase font-bold text-white/90 tracking-wider">
                      LAV RESTAURANTES · TARJETA INTELIGENTE
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">lavdigitalmkt.com</p>
                  <h5 className="font-bold text-slate-900 text-sm leading-tight">{restaurant.name}</h5>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {restaurant.tagline || restaurant.description}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                Metadatos Open Graph optimizados automáticamente con imagen y descripción comercial.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
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
