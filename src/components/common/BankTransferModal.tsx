import React, { useState } from 'react';
import { X, Copy, Check, Building2, Upload, AlertTriangle, MessageCircle, ShieldCheck } from 'lucide-react';
import { BankDetails } from '../../types/restaurant';

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankDetails: BankDetails;
  orderTotal: number;
  restaurantWhatsapp: string;
  restaurantName: string;
}

export const BankTransferModal: React.FC<BankTransferModalProps> = ({
  isOpen,
  onClose,
  bankDetails,
  orderTotal,
  restaurantWhatsapp,
  restaurantName,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'uploaded'>('details');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotifyWhatsApp = () => {
    const cleanPhone = restaurantWhatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `👋 *HOLA, REPORTO TRANSFERENCIA BANCARIA*\n\n` +
      `🍽️ *Restaurante:* ${restaurantName}\n` +
      `💰 *Monto Transferido:* $${orderTotal} MXN\n` +
      `🏦 *Banco Destino:* ${bankDetails.bankName}\n` +
      `📌 *Titular:* ${bankDetails.accountHolder}\n` +
      `\nAdjunto en este chat mi comprobante oficial de SPEI para su validación manual y preparación del pedido.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Datos para Transferencia (SPEI)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Total Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">Total a transferir:</span>
            <span className="text-lg font-bold text-amber-950 tabular-nums">
              ${orderTotal} MXN
            </span>
          </div>

          {/* Bank Credentials Card */}
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            {/* Banco */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Banco:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{bankDetails.bankName}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankDetails.bankName, 'banco')}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                >
                  {copiedField === 'banco' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
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

            {/* Titular */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Beneficiario / Titular:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-right">{bankDetails.accountHolder}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankDetails.accountHolder, 'titular')}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors shrink-0"
                >
                  {copiedField === 'titular' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
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

            {/* CLABE with Quick Copy */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">CLABE Interbancaria (18 dígitos):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 tracking-tight">
                  {bankDetails.clabe}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankDetails.clabe, 'clabe')}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors shrink-0"
                >
                  {copiedField === 'clabe' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
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

            {bankDetails.accountNumber && (
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Número de Cuenta:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-800">
                    {bankDetails.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, 'acc')}
                    className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                  >
                    {copiedField === 'acc' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
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
            )}

            {/* Concepto / Referencia */}
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500 font-medium">Concepto / Referencia:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{bankDetails.referenceNote}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankDetails.referenceNote, 'concepto')}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors shrink-0"
                >
                  {copiedField === 'concepto' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
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
          </div>

          {/* Instructions */}
          {bankDetails.transferInstructions && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
              <p className="font-bold mb-1 flex items-center gap-1 text-blue-950">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Instrucciones del Restaurante:
              </p>
              <p>{bankDetails.transferInstructions}</p>
            </div>
          )}

          {/* Upload Receipt Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              Comprobante de Pago (Opcional en app / Envío directo)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-slate-400 transition-colors bg-slate-50">
              {receiptPreview ? (
                <div className="space-y-2">
                  <img
                    src={receiptPreview}
                    alt="Comprobante subido"
                    className="max-h-36 mx-auto rounded-lg shadow-xs border border-slate-200 object-contain"
                  />
                  <p className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Comprobante adjuntado: {receiptFile?.name}
                  </p>
                  <label className="cursor-pointer text-[11px] text-slate-500 hover:text-slate-700 underline block">
                    Cambiar archivo
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer space-y-1 block">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Haz clic para adjuntar comprobante (JPG, PNG)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    O envíalo directamente por WhatsApp al restaurante
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Mandatory Security & Validation Notice */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900 leading-tight">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px]">
              <strong>Validación obligatoria:</strong> La subida de un comprobante no confirma el pago de forma automática. El restaurante verifica la acreditación del saldo en su banca oficial antes de enviar el pedido.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleNotifyWhatsApp}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Notificar y Enviar Comprobante por WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  );
};
