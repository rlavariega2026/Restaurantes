import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Share2, Printer, Check, Sparkles } from 'lucide-react';
import { Restaurant } from '../../types/restaurant';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, restaurant }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate public digital card URL
  const publicUrl = `${window.location.origin}/restaurantes/${restaurant.slug}/`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(publicUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [isOpen, publicUrl]);

  if (!isOpen) return null;

  const downloadPNG = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${restaurant.slug}-LAV.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Mesa QR - ${restaurant.name}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            .card { max-width: 380px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 16px; padding: 30px; }
            h1 { font-size: 22px; margin-bottom: 4px; color: #0f172a; }
            p { color: #64748b; font-size: 13px; margin-top: 0; }
            img { width: 260px; height: 260px; margin: 15px 0; }
            .footer { font-size: 11px; color: #94a3b8; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${restaurant.name}</h1>
            <p>${restaurant.tagline || 'Escanea para ver nuestro menú digital inteligente y pedir directo'}</p>
            <img src="${qrDataUrl}" alt="QR Code" />
            <div class="footer">TARJETA DIGITAL POR LAV DIGITAL MKT</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">Código QR Inteligente</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display */}
        <div className="p-6 text-center space-y-4">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900">{restaurant.name}</h4>
            <p className="text-xs text-slate-500">
              Escanea para abrir la tarjeta digital en cualquier celular sin instalar apps.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR ${restaurant.name}`}
                className="w-56 h-56 mx-auto rounded-lg"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Generando QR...
              </div>
            )}
          </div>

          {/* Public Link Box */}
          <div className="p-2.5 bg-slate-100 rounded-xl text-left flex items-center justify-between gap-2 text-xs">
            <span className="font-mono text-slate-600 truncate">{publicUrl}</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-white hover:bg-slate-200 rounded-md font-semibold text-slate-700 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={downloadPNG}
            className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir para Mesa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
