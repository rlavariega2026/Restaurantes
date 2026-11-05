import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Flame, Sparkles, Heart, Leaf, Award } from 'lucide-react';
import { MenuItem, ProductVariant, ProductExtra, CartItem, ProductTag } from '../../types/restaurant';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MenuItem | null;
  onAddToCart: (item: CartItem) => void;
  accentColor?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  accentColor = '#0F172A',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([]);
  const [notes, setNotes] = useState('');

  // Reset states whenever product changes
  React.useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
      setSelectedExtras([]);
      setNotes('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  const unitTotal = basePrice + extrasTotal;
  const total = unitTotal * quantity;

  const handleToggleExtra = (extra: ProductExtra) => {
    if (selectedExtras.some((e) => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter((e) => e.name !== extra.name));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleAdd = () => {
    onAddToCart({
      product,
      quantity,
      selectedVariant,
      selectedExtras,
      notes: notes.trim() || undefined,
      itemTotal: total,
    });
    onClose();
  };

  const renderTagIcon = (tag: ProductTag) => {
    switch (tag) {
      case 'picante':
        return <span className="flex items-center gap-1 text-red-600 font-bold"><Flame className="w-3 h-3" /> Picante</span>;
      case 'nuevo':
        return <span className="flex items-center gap-1 text-amber-600 font-bold"><Sparkles className="w-3 h-3" /> Nuevo</span>;
      case 'favorito':
        return <span className="flex items-center gap-1 text-rose-600 font-bold"><Heart className="w-3 h-3 fill-current" /> Favorito</span>;
      case 'vegetariano':
        return <span className="flex items-center gap-1 text-emerald-600 font-bold"><Leaf className="w-3 h-3" /> Vegetariano</span>;
      case 'chef':
        return <span className="flex items-center gap-1 text-purple-600 font-bold"><Award className="w-3 h-3" /> Especial del Chef</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header Image Slot with Close Button */}
        <div className="relative h-56 bg-slate-100 shrink-0 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
              <ShoppingBag className="w-12 h-12" />
            </div>
          )}

          {/* Close Floating Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors backdrop-blur-xs"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] text-white">
              {product.tags.map((t, idx) => (
                <span key={idx} className="flex items-center">
                  {renderTagIcon(t)}
                  {idx < (product.tags?.length || 0) - 1 && <span className="mx-1 opacity-50">·</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{product.name}</h3>
              <span className="text-base font-bold text-slate-900 tabular-nums shrink-0">
                ${basePrice} MXN
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{product.description}</p>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Selecciona tu opción o tamaño:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {product.variants.map((v, i) => {
                  const isSelected = selectedVariant?.name === v.name;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{v.name}</span>
                      <span className="tabular-nums">${v.price} MXN</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras Checkboxes */}
          {product.extras && product.extras.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Extras y complementos opcionales:
              </label>
              <div className="space-y-1.5">
                {product.extras.map((extra, i) => {
                  const isChecked = selectedExtras.some((e) => e.name === extra.name);
                  return (
                    <label
                      key={i}
                      onClick={() => handleToggleExtra(extra)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-emerald-600 focus:ring-0"
                        />
                        <span>{extra.name}</span>
                      </div>
                      <span className="tabular-nums text-slate-500 font-semibold">
                        +${extra.price} MXN
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kitchen Notes */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Instrucciones especiales para cocina (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Sin cebolla, aderezo aparte, bien cocido..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Sticky Footer: Quantity and Add Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-slate-300 rounded-xl bg-white px-2 py-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-900 tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAdd}
            style={{ backgroundColor: accentColor }}
            className="flex-1 py-3 px-4 text-white rounded-xl font-bold text-xs flex items-center justify-between shadow-sm active:scale-[0.99] transition-all hover:opacity-95"
          >
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Agregar al Pedido</span>
            </span>
            <span className="tabular-nums text-sm font-extrabold">${total} MXN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
