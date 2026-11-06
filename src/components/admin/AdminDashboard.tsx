import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  RotateCcw,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  Smartphone,
  Eye,
  Sliders,
  Utensils,
  Image as ImageIcon,
  Phone,
  CreditCard,
  QrCode,
  BarChart3,
  Building2,
  Check,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Clock,
  Upload,
  Download,
  FolderDown,
  FileText,
  CheckCircle2,
  Play,
  Globe,
  X
} from 'lucide-react';
import JSZip from 'jszip';
import { Restaurant, MenuItem, MenuCategory, TemplateId, ProductTag, ButtonStyle, GalleryPhoto } from '../../types/restaurant';
import { TEMPLATE_DEFINITIONS } from '../../data/templateDefinitions';
import { RestaurantService, OrderService } from '../../services/storage';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { generateStandaloneCardHtml } from '../../services/hostingerExport';

interface AdminDashboardProps {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant;
  onSelectRestaurant: (slug: string) => void;
  onUpdateRestaurant: (updated: Restaurant) => void;
  onRefreshList: () => void;
  onViewPublicCard: (slug: string) => void;
  onOpenHostingerGuide: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  restaurants,
  currentRestaurant,
  onSelectRestaurant,
  onUpdateRestaurant,
  onRefreshList,
  onViewPublicCard,
  onOpenHostingerGuide,
}) => {
  // Local working copy for real-time live preview
  const [form, setForm] = useState<Restaurant>(currentRestaurant);
  const [activeTab, setActiveTab] = useState<'design' | 'menu' | 'photos' | 'contact' | 'payments' | 'orders' | 'share' | 'analytics' | 'manage'>('design');
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'split' | 'editor-only' | 'phone-only'>('split');
  
  // Menu Editing Local States
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Orders list state
  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Modal: Guardar Cambios o Guardar como Nueva Tarjeta / Plantilla
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveActionType, setSaveActionType] = useState<'update' | 'create_new'>('update');
  const [saveRestaurantName, setSaveRestaurantName] = useState('');
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveSlug, setSaveSlug] = useState('');
  const [saveVersionNote, setSaveVersionNote] = useState('Actualización de precios y platillos');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Modal: Publicar en Hostinger con Nombres Asignables (Sin descarga ZIP)
  const [isHostingerExportModalOpen, setIsHostingerExportModalOpen] = useState(false);
  const [hostingerCardName, setHostingerCardName] = useState('');
  const [hostingerTemplateName, setHostingerTemplateName] = useState('');
  const HOSTINGER_FOLDER = 'public_html/Restaurantes/';
  const HOSTINGER_DOMAIN = 'lavdigitalagency.com';
  const [hostingerFolderName, setHostingerFolderName] = useState(HOSTINGER_FOLDER);
  const [isPublishingHostinger, setIsPublishingHostinger] = useState(false);
  const [hostingerPublishSuccess, setHostingerPublishSuccess] = useState(false);
  const [hostingerPublishedUrl, setHostingerPublishedUrl] = useState('');

  // Modal: Simulador Interactivo de Mercado Pago Checkout Pro
  const [isMpSimulatorOpen, setIsMpSimulatorOpen] = useState(false);
  const [mpSimStep, setMpSimStep] = useState<'method' | 'processing' | 'approved'>('method');
  const [mpSimMethod, setMpSimMethod] = useState<'card' | 'spei' | 'oxxo'>('card');
  const [mpFeedback, setMpFeedback] = useState<string | null>(null);

  // Hidden File Input Refs for local computer uploads
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const productFileInputRef = useRef<HTMLInputElement | null>(null);

  // Update working form when selected restaurant changes
  useEffect(() => {
    setForm(currentRestaurant);
  }, [currentRestaurant]);

  // Load orders for this restaurant
  useEffect(() => {
    OrderService.getOrders(form.slug).then((res) => setOrders(res));
  }, [form.slug]);

  // Convert File to base64 Data URL for instant rendering & persistence
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload Cover Photo from computer
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const dataUrl = await fileToDataUrl(file);
        setForm((prev) => ({
          ...prev,
          branding: { ...prev.branding, coverUrl: dataUrl },
        }));
      } catch {
        alert('Error al leer el archivo de imagen de portada.');
      }
    }
  };

  // Upload Multiple Gallery Photos from computer
  const handleGalleryFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      try {
        const newPhotos: GalleryPhoto[] = await Promise.all(
          files.map(async (file, idx) => {
            const dataUrl = await fileToDataUrl(file);
            return {
              id: 'gal-' + Date.now().toString(36) + '-' + idx,
              url: dataUrl,
              caption: file.name.replace(/\.[^/.]+$/, ''),
              category: 'platillos',
            };
          })
        );
        setForm((prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            gallery: [...(prev.branding.gallery || []), ...newPhotos],
          },
        }));
      } catch {
        alert('Error al cargar las fotografías de la galería.');
      }
    }
  };

  // Upload Product Photo from computer
  const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const dataUrl = await fileToDataUrl(file);
        if (editingProduct) {
          setEditingProduct({ ...editingProduct, imageUrl: dataUrl });
        }
      } catch {
        alert('Error al leer la fotografía del platillo.');
      }
    }
  };

  // Load official test credentials for Mercado Pago
  const handleLoadOfficialSandboxCredentials = () => {
    setForm((prev) => ({
      ...prev,
      mercadoPagoConfig: {
        ...prev.mercadoPagoConfig,
        publicKey: 'TEST-39482109-7b31-482a-9cf1-884920194820',
        accessToken: 'TEST-7281920381920381-029102-test-token-checkout-pro-official-2025',
        sandboxMode: true,
        currency: prev.mercadoPagoConfig?.currency || 'MXN',
        verified: true,
      },
    }));
    setMpFeedback('¡Credenciales oficiales de prueba (Sandbox) cargadas correctamente!');
    setTimeout(() => setMpFeedback(null), 3500);
  };

  // Open Save Modal (either update existing or create as new card)
  const handleOpenSaveModal = (actionType: 'update' | 'create_new' = 'update') => {
    setSaveActionType(actionType);
    const activeDef = TEMPLATE_DEFINITIONS.find((t) => t.id === form.templateId);
    const currentTplName = form.branding.customTemplateName || activeDef?.name || 'Plantilla Personalizada';

    if (actionType === 'create_new') {
      setSaveRestaurantName(`${form.name} (Nueva Tarjeta)`);
      setSaveTemplateName(`${currentTplName} (Copia)`);
      setSaveSlug(`${form.slug}-nueva`);
      setSaveVersionNote('Nueva tarjeta independiente creada a partir de plantilla');
    } else {
      setSaveRestaurantName(form.name);
      setSaveTemplateName(currentTplName);
      setSaveSlug(form.slug);
      setSaveVersionNote('Actualización de precios y contenido');
    }
    setSaveSuccessMessage(null);
    setIsSaveModalOpen(true);
  };

  // Helper to generate a clean URL slug from name
  const handleNameChangeInSaveModal = (newName: string) => {
    setSaveRestaurantName(newName);
    if (saveActionType === 'create_new') {
      const suggested = newName
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSaveSlug(suggested);
    }
  };

  // Confirm Save (either update existing card or create a brand new independent card)
  const handleConfirmSave = async () => {
    setSaveLoading(true);
    try {
      const cleanSlug = saveSlug
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      if (saveActionType === 'create_new') {
        const created = await RestaurantService.saveAsNewRestaurant(
          form,
          saveRestaurantName.trim() || 'Nuevo Restaurante',
          cleanSlug || undefined,
          saveTemplateName.trim() || undefined
        );
        onRefreshList();
        onSelectRestaurant(created.slug);
        setForm(created);
        setSaveSuccessMessage(`¡Nueva tarjeta "${created.name}" creada con éxito!`);
      } else {
        const updatedForm: Restaurant = {
          ...form,
          name: saveRestaurantName.trim() || form.name,
          slug: cleanSlug || form.slug,
          branding: {
            ...form.branding,
            customTemplateName: saveTemplateName.trim() || form.branding.customTemplateName,
          },
        };
        setForm(updatedForm);
        const saved = await RestaurantService.saveRestaurant(updatedForm);
        onUpdateRestaurant(saved);
        onRefreshList();
        setSaveSuccessMessage(`¡Tarjeta "${saved.name}" actualizada con éxito!`);
      }

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setIsSaveModalOpen(false);
        setSaveSuccessMessage(null);
      }, 1400);
    } catch {
      alert('Error al guardar la tarjeta.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Open Hostinger Publication Modal with customizable names (no ZIP download)
  const handleOpenHostingerExport = () => {
    const activeTemplate = TEMPLATE_DEFINITIONS.find((t) => t.id === form.templateId);
    setHostingerCardName(form.name);
    setHostingerTemplateName(form.branding?.customTemplateName || activeTemplate?.name || 'Plantilla Personalizada');
    setHostingerFolderName(HOSTINGER_FOLDER);
    setIsHostingerExportModalOpen(true);
    setHostingerPublishSuccess(false);
  };

  // Direct Hostinger Publication (without ZIP download)
  const handlePublishHostinger = async () => {
    setIsPublishingHostinger(true);
    try {
      const assignedCardName = hostingerCardName.trim() || form.name;
      const assignedTemplateName = hostingerTemplateName.trim() || form.branding?.customTemplateName || 'Plantilla Personalizada';
      const targetDomain = HOSTINGER_DOMAIN;
      const publicationSlug = `${assignedCardName}-${assignedTemplateName}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || form.slug;
      const liveUrl = `https://${HOSTINGER_DOMAIN}/Restaurantes/${publicationSlug}/`;

      const updated: Restaurant = {
        ...form,
        name: assignedCardName,
        branding: {
          ...form.branding,
          customTemplateName: assignedTemplateName,
        },
        hostingerConfig: {
          published: true,
          folder: HOSTINGER_FOLDER,
          customDomain: HOSTINGER_DOMAIN,
          publicationSlug,
          publishedAt: new Date().toISOString(),
          liveUrl,
        },
      };

      const saved = await RestaurantService.saveRestaurant(updated);
      setForm(saved);
      onUpdateRestaurant(saved);
      setHostingerPublishedUrl(liveUrl);
      setHostingerPublishSuccess(true);
    } catch {
      alert('Error al publicar la tarjeta en Hostinger.');
    } finally {
      setIsPublishingHostinger(false);
    }
  };

  // Switch Template handler (preserves all menu and contact details)
  const handleSwitchTemplate = (templateId: TemplateId) => {
    const templateDef = TEMPLATE_DEFINITIONS.find((t) => t.id === templateId);
    if (!templateDef) return;

    setForm((prev) => ({
      ...prev,
      templateId,
      branding: {
        ...prev.branding,
        accentColor: templateDef.defaultColors.accent,
        bgColor: templateDef.defaultColors.bg,
        surfaceColor: templateDef.defaultColors.surface,
        textColor: templateDef.defaultColors.text,
        fontDisplay: templateDef.fontDisplay,
        fontBody: templateDef.fontBody,
        buttonStyle: templateDef.buttonStyle,
      },
    }));
  };

  // Duplicate restaurant
  const handleDuplicate = async () => {
    const newName = prompt('Nombre para el restaurante duplicado:', `${form.name} (Copia)`);
    if (!newName) return;
    try {
      const created = await RestaurantService.duplicateRestaurant(form.slug, newName);
      onRefreshList();
      onSelectRestaurant(created.slug);
      alert(`¡Restaurante "${newName}" duplicado con éxito!`);
    } catch (err: any) {
      alert(err?.message || 'Error al duplicar');
    }
  };

  // Reset to initial 20
  const handleResetDefaults = () => {
    if (confirm('¿Restablecer los 20 restaurantes de demostración originales de LAV Digital MKT? Esto recuperará los datos iniciales.')) {
      RestaurantService.resetToDefault();
      onRefreshList();
      onSelectRestaurant('lumbre-alta-cocina');
    }
  };

  // Add / Save Product
  const handleSaveProduct = (product: MenuItem) => {
    setForm((prev) => {
      const exists = prev.products.some((p) => p.id === product.id);
      const updatedProducts = exists
        ? prev.products.map((p) => (p.id === product.id ? product : p))
        : [...prev.products, product];
      return { ...prev, products: updatedProducts };
    });
    setEditingProduct(null);
    setIsNewProductModalOpen(false);
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    if (confirm('¿Eliminar este producto del menú?')) {
      setForm((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== productId),
      }));
    }
  };

  // Add Category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: MenuCategory = {
      id: 'cat-' + Date.now().toString(36),
      name: newCategoryName.trim(),
      order: form.categories.length + 1,
    };
    setForm((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
    setNewCategoryName('');
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    if (confirm('¿Eliminar esta categoría? Los productos asociados permanecerán en el menú.')) {
      setForm((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== catId),
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-jakarta text-slate-900">
      {/* Top Admin Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Restaurant Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
              LAV
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xs tracking-wide uppercase text-amber-400 block leading-tight">
                Panel de Administración
              </span>
              <span className="text-[10px] text-slate-400">Tarjetas Digitales Inteligentes</span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-700 hidden sm:block" />

          {/* Restaurant Dropdown Switcher */}
          <select
            value={form.slug}
            onChange={(e) => onSelectRestaurant(e.target.value)}
            className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 max-w-xs"
          >
            {restaurants.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name} {r.branding?.customTemplateName ? `• [${r.branding.customTemplateName}]` : `(${TEMPLATE_DEFINITIONS.find((t) => t.id === r.templateId)?.name || 'Personalizada'})`}
              </option>
            ))}
          </select>
        </div>

        {/* View Controls & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Dual View Mode Buttons */}
          <div className="hidden lg:flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setPreviewMode('editor-only')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                previewMode === 'editor-only' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Solo Editor
            </button>
            <button
              onClick={() => setPreviewMode('split')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                previewMode === 'split' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Doble Vista (En Vivo)
            </button>
            <button
              onClick={() => setPreviewMode('phone-only')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                previewMode === 'phone-only' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Solo Móvil
            </button>
          </div>

          {/* Publicar en Hostinger Button (Prominent, High-Visibility) */}
          <button
            onClick={handleOpenHostingerExport}
            className="py-1.5 px-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95 border border-purple-400/40 ring-1 ring-purple-400/20"
            title="Publicar en Hostinger: asigna el nombre que quieras a la tarjeta, plantilla, archivo y carpeta"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-extrabold tracking-wide">Publicar en Hostinger</span>
          </button>

          {/* View Public Card */}
          <button
            onClick={() => onViewPublicCard(form.slug)}
            className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ver Tarjeta Pública</span>
          </button>

          {/* Save as New Card / Template Button */}
          <button
            onClick={() => handleOpenSaveModal('create_new')}
            disabled={saveLoading}
            className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-400/30 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            title="Crear una copia independiente con nuevo nombre y slug"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guardar como Nueva</span>
          </button>

          {/* Save Changes Button (Opens Modal in Update Mode) */}
          <button
            onClick={() => handleOpenSaveModal('update')}
            disabled={saveLoading}
            className={`py-1.5 px-4 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? '¡Guardado!' : saveLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (Split Screen on Desktop) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor Panel */}
        <div
          className={`flex-1 flex flex-col bg-white overflow-hidden ${
            previewMode === 'phone-only' ? 'hidden' : 'block'
          }`}
        >
          {/* Editor Tabs Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto text-xs font-medium no-scrollbar shrink-0">
            {[
              { id: 'design', label: '1. Identidad & 20 Plantillas', icon: Sliders },
              { id: 'menu', label: '2. Menú & Productos', icon: Utensils },
              { id: 'photos', label: '3. Fotos & Galería', icon: ImageIcon },
              { id: 'contact', label: '4. Contacto & Horarios', icon: Phone },
              { id: 'payments', label: '5. SPEI & Mercado Pago', icon: CreditCard },
              { id: 'orders', label: `6. Pedidos (${orders.length})`, icon: ShoppingBag },
              { id: 'share', label: '7. QR & NFC', icon: QrCode },
              { id: 'analytics', label: '8. Analíticas', icon: BarChart3 },
              { id: 'manage', label: '9. Ajustes & Hostinger', icon: Building2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3.5 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'border-slate-900 text-slate-900 font-bold bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Editor Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
            {/* TAB 1: DESIGN & 20 TEMPLATES */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Identidad Comercial & Plantilla</h3>
                  <p className="text-xs text-slate-500">
                    Personaliza los datos principales de tu restaurante y escoge entre las 20 plantillas de autor.
                  </p>
                </div>

                {/* Basic Info Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Comercial *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Cocina o Concepto</label>
                    <input
                      type="text"
                      value={form.cuisineType}
                      onChange={(e) => setForm({ ...form, cuisineType: e.target.value })}
                      placeholder="Ej. Alta Cocina, Taquería, Pizzería a la Leña..."
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Eslogan o Frase Destacada</label>
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Descripción del Restaurante</label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* CUSTOM TEMPLATE NAMING & INDEPENDENT SAVE CARD */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                          DISEÑO
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Nombre Propio de esta Plantilla / Diseño Editado
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Asigna un nombre propio a cada plantilla o diseño que edites para poder guardarlo y reconocerlo fácilmente.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-950">
                        Base: {TEMPLATE_DEFINITIONS.find((t) => t.id === form.templateId)?.name || form.templateId}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nombre asignado a esta plantilla:
                      </label>
                      <input
                        type="text"
                        value={form.branding.customTemplateName || ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            branding: {
                              ...form.branding,
                              customTemplateName: e.target.value,
                            },
                          })
                        }
                        placeholder={`Ej. ${TEMPLATE_DEFINITIONS.find((t) => t.id === form.templateId)?.name || 'Plantilla'} - Estilo Oro 2025...`}
                        className="w-full text-xs font-bold px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 shadow-2xs"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-1.5 sm:col-span-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenSaveModal('create_new')}
                        className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        title="Guardar como una tarjeta y plantilla nueva e independiente"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Guardar como Nueva Plantilla</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenHostingerExport}
                        className="py-2 px-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                        title="Publicar en Hostinger asignando el nombre que desees"
                      >
                        <Globe className="w-3.5 h-3.5 text-amber-300" />
                        <span>Publicar en Hostinger</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* THE 20 TEMPLATES SELECTOR GALLERY */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Catálogo de las 20 Plantillas de Autor
                      </h4>
                      <p className="text-xs text-slate-500">
                        Cada plantilla cuenta con tipografía, colores, tarjeta de producto y concepto visual único. Cambiar de plantilla no borra tus productos ni datos.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full">
                      20 Plantillas Disponibles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {TEMPLATE_DEFINITIONS.map((tpl) => {
                      const isCurrent = form.templateId === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => handleSwitchTemplate(tpl.id)}
                          className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                            isCurrent
                              ? 'border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {tpl.category}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Activa
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs font-bold text-slate-900">{tpl.name}</h5>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {tpl.concept}
                            </p>
                          </div>

                          {/* Color Swatch Preview & Select Button */}
                          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: tpl.defaultColors.bg }}
                                title="Fondo"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: tpl.defaultColors.accent }}
                                title="Acento"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: tpl.defaultColors.surface }}
                                title="Superficie"
                              />
                            </div>
                            <button
                              type="button"
                              className={`text-[11px] font-bold px-2 py-1 rounded-md transition-colors ${
                                isCurrent
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {isCurrent ? 'Seleccionada' : 'Aplicar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Advanced Color & Typography Fine-Tuning */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900">Personalización Avanzada de Colores y Botones</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Color de Acento</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.branding.accentColor}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              branding: { ...form.branding, accentColor: e.target.value },
                            })
                          }
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={form.branding.accentColor}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              branding: { ...form.branding, accentColor: e.target.value },
                            })
                          }
                          className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Color de Fondo</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.branding.bgColor}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              branding: { ...form.branding, bgColor: e.target.value },
                            })
                          }
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={form.branding.bgColor}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              branding: { ...form.branding, bgColor: e.target.value },
                            })
                          }
                          className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Color de Superficie</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.branding.surfaceColor}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              branding: { ...form.branding, surfaceColor: e.target.value },
                            })
                          }
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={form.branding.surfaceColor}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              branding: { ...form.branding, surfaceColor: e.target.value },
                            })
                          }
                          className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Estilo de Botones</label>
                      <select
                        value={form.branding.buttonStyle}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            branding: { ...form.branding, buttonStyle: e.target.value as ButtonStyle },
                          })
                        }
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="rounded">Redondeados (12px)</option>
                        <option value="pill">Cápsula (Completos)</option>
                        <option value="sharp">Rectos / Editoriales</option>
                        <option value="minimal">Minimalistas (4px)</option>
                        <option value="glass">Cristal / Glassmorphism</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900">Activación de Funciones y Botones</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {[
                      { key: 'whatsappOrders', label: 'Pedidos por WhatsApp' },
                      { key: 'tableReservations', label: 'Reservación de Mesas' },
                      { key: 'pickupOrders', label: 'Pedidos Para Recoger' },
                      { key: 'deliveryOrders', label: 'Entrega a Domicilio' },
                      { key: 'bankTransfer', label: 'Transferencias SPEI' },
                      { key: 'mercadoPago', label: 'Cobros Mercado Pago' },
                      { key: 'googleReviews', label: 'Reseñas de Google' },
                      { key: 'photoGallery', label: 'Galería de Fotos' },
                      { key: 'specialNotice', label: 'Aviso de Promoción' },
                    ].map((feat) => {
                      const enabled = (form.features as any)[feat.key];
                      return (
                        <label
                          key={feat.key}
                          className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                features: {
                                  ...form.features,
                                  [feat.key]: e.target.checked,
                                },
                              })
                            }
                            className="rounded text-slate-900 focus:ring-0"
                          />
                          <span className="font-semibold text-slate-800">{feat.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MENU & PRODUCTS */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Gestor de Menú & Catálogo</h3>
                    <p className="text-xs text-slate-500">
                      Organiza tus platillos en categorías, edita precios, agrega variantes y extras.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct({
                        id: 'prod-' + Date.now().toString(36),
                        categoryId: form.categories[0]?.id || 'cat-1',
                        name: '',
                        description: '',
                        price: 150,
                        available: true,
                        imageUrl: '/src/assets/images/hero_culinary_editorial_1793142965729.jpg',
                        variants: [],
                        extras: [],
                      });
                      setIsNewProductModalOpen(true);
                    }}
                    className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Platillo</span>
                  </button>
                </div>

                {/* Categories Management Strip */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Categorías del Menú:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nueva categoría (ej. Bebidas)..."
                        className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg focus:outline-none"
                      />
                      <button
                        onClick={handleAddCategory}
                        className="py-1 px-2.5 bg-slate-800 text-white font-semibold text-xs rounded-lg hover:bg-slate-700"
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {form.categories.map((c) => (
                      <span
                        key={c.id}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold flex items-center gap-2"
                      >
                        <span>{c.name}</span>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="text-slate-400 hover:text-red-600 font-bold"
                          title="Eliminar categoría"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Products List by Category */}
                <div className="space-y-4">
                  {form.categories.map((cat) => {
                    const prods = form.products.filter((p) => p.categoryId === cat.id);
                    return (
                      <div key={cat.id} className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {cat.name} ({prods.length})
                        </h4>

                        <div className="space-y-2">
                          {prods.map((prod) => (
                            <div
                              key={prod.id}
                              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                  {prod.imageUrl ? (
                                    <img
                                      src={prod.imageUrl}
                                      alt={prod.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                      <Utensils className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-xs font-bold text-slate-900 truncate">
                                      {prod.name}
                                    </h5>
                                    {!prod.available && (
                                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                                        Agotado
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate max-w-md">
                                    {prod.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                                  ${prod.price} MXN
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setIsNewProductModalOpen(true);
                                  }}
                                  className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="text-slate-400 hover:text-red-600 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: PHOTOS & COVERS */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Fotos & Contenido Visual</h3>
                  <p className="text-xs text-slate-500">
                    Cambia la foto de portada principal y administra la galería de fotos gastronómicas y de ambiente.
                  </p>
                </div>

                {/* Cover Photo */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Fotografía de Portada Principal (Hero)</h4>
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-200">
                    <img
                      src={form.branding.coverUrl || '/src/assets/images/hero_culinary_editorial_1793142965729.jpg'}
                      alt="Portada"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Upload from Computer Button */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-2 transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Subir portada desde mi computadora</span>
                    </button>
                    <span className="text-[11px] text-slate-500">Formatos compatibles: JPG, PNG, WEBP.</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      O ingresa URL externa si lo prefieres:
                    </label>
                    <input
                      type="text"
                      value={form.branding.coverUrl}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          branding: { ...form.branding, coverUrl: e.target.value },
                        })
                      }
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Quick Select from Built-in Culinary High-Res Assets */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-slate-700">O escoge de las fotos gastronómicas de alta resolución:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[
                        { url: '/src/assets/images/hero_immersive_culinary_1793144478747.jpg', label: 'Vertical 9:16' },
                        { url: '/src/assets/images/hero_culinary_editorial_1793142965729.jpg', label: 'Alta Cocina' },
                        { url: '/src/assets/images/food_steakhouse_ribeye_1793142977286.jpg', label: 'Steakhouse' },
                        { url: '/src/assets/images/food_tacos_gourmet_1793142978654.jpg', label: 'Tacos' },
                        { url: '/src/assets/images/food_sushi_omakase_1793142979708.jpg', label: 'Sushi' },
                        { url: '/src/assets/images/food_cafe_pastry_1793142979018.jpg', label: 'Café & Pan' },
                      ].map((img, i) => (
                        <div
                          key={i}
                          onClick={() =>
                            setForm({
                              ...form,
                              branding: { ...form.branding, coverUrl: img.url },
                            })
                          }
                          className="h-16 rounded-lg overflow-hidden border-2 cursor-pointer hover:opacity-90 relative"
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-bold py-0.5">
                            {img.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dedicated Portada Inmersiva Controls */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Controles de Portada Inmersiva (100dvh)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Configura el comportamiento fotográfico a pantalla completa cuando uses la plantilla Portada Inmersiva.
                      </p>
                    </div>
                    {form.templateId === 'portada-inmersiva' ? (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                        Plantilla Activa
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSwitchTemplate('portada-inmersiva')}
                        className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg"
                      >
                        Activar Portada Inmersiva
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Visual Mode: Cover vs Contain */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Modo de Visualización</label>
                      <select
                        value={form.branding.heroDisplayMode || 'cover'}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            branding: {
                              ...form.branding,
                              heroDisplayMode: e.target.value as 'cover' | 'contain',
                            },
                          })
                        }
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="cover">Pantalla Llena con Recorte (cover)</option>
                        <option value="contain">Fotografía Completa sin Recortes (contain)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        &quot;Contain&quot; preserva fotos horizontales o cuadradas completas.
                      </span>
                    </div>

                    {/* Content Position: Bottom, Center, Top */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Posición de Textos</label>
                      <select
                        value={form.branding.heroContentPosition || 'bottom'}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            branding: {
                              ...form.branding,
                              heroContentPosition: e.target.value as 'bottom' | 'center' | 'top',
                            },
                          })
                        }
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="bottom">Abajo (Recomendado editorial)</option>
                        <option value="center">Centro de la pantalla</option>
                        <option value="top">Arriba</option>
                      </select>
                    </div>

                    {/* Scrim Gradient Intensity */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Degradado Protector (Scrim)</label>
                      <select
                        value={form.branding.heroScrimIntensity || 'medium'}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            branding: {
                              ...form.branding,
                              heroScrimIntensity: e.target.value as 'none' | 'soft' | 'medium' | 'high',
                            },
                          })
                        }
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="medium">Medio (85% recomendado)</option>
                        <option value="soft">Suave (60%)</option>
                        <option value="high">Intenso (95% máximo contraste)</option>
                        <option value="none">Sin degradado (transparente)</option>
                      </select>
                    </div>
                  </div>

                  {/* Scroll Indicator Text */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Texto del Indicador de Desplazamiento
                    </label>
                    <input
                      type="text"
                      value={form.branding.heroScrollText || 'Desliza para descubrir'}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          branding: {
                            ...form.branding,
                            heroScrollText: e.target.value,
                          },
                        })
                      }
                      placeholder="Ej. Desliza para descubrir el menú..."
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Overlaid Buttons Toggles */}
                  <div className="space-y-1.5 pt-1">
                    <label className="font-bold text-slate-700 block text-xs">
                      Botones Superpuestos en la Portada:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={form.branding.heroButtons?.showMenuBtn !== false}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              branding: {
                                ...form.branding,
                                heroButtons: {
                                  ...(form.branding.heroButtons || {}),
                                  showMenuBtn: e.target.checked,
                                },
                              },
                            })
                          }
                          className="rounded text-slate-900"
                        />
                        <span className="font-semibold text-slate-800">Botón &quot;Ver Menú&quot;</span>
                      </label>

                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={form.branding.heroButtons?.showOrderBtn !== false}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              branding: {
                                ...form.branding,
                                heroButtons: {
                                  ...(form.branding.heroButtons || {}),
                                  showOrderBtn: e.target.checked,
                                },
                              },
                            })
                          }
                          className="rounded text-slate-900"
                        />
                        <span className="font-semibold text-slate-800">Botón &quot;Pedir Ahora&quot;</span>
                      </label>

                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={form.branding.heroButtons?.showReserveBtn !== false}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              branding: {
                                ...form.branding,
                                heroButtons: {
                                  ...(form.branding.heroButtons || {}),
                                  showReserveBtn: e.target.checked,
                                },
                              },
                            })
                          }
                          className="rounded text-slate-900"
                        />
                        <span className="font-semibold text-slate-800">Botón &quot;Reservar&quot;</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Gallery Management Section with Computer Upload */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>Galería de Fotos & Ambiente ({form.branding.gallery?.length || 0})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Sube fotografías desde tu computadora o celular para que los comensales vean tus platillos e instalaciones.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={galleryFileInputRef}
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleGalleryFilesUpload}
                      />
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Subir desde mi computadora</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Ingresa la URL de la imagen para la galería:');
                          if (url && url.trim()) {
                            const newPhoto: GalleryPhoto = {
                              id: 'gal-' + Date.now().toString(36),
                              url: url.trim(),
                              caption: 'Foto de galería',
                              category: 'platillos',
                            };
                            setForm((prev) => ({
                              ...prev,
                              branding: {
                                ...prev.branding,
                                gallery: [...(prev.branding.gallery || []), newPhoto],
                              },
                            }));
                          }
                        }}
                        className="py-1.5 px-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                      >
                        + Por URL
                      </button>
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  {(!form.branding.gallery || form.branding.gallery.length === 0) ? (
                    <div className="py-8 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
                      <ImageIcon className="w-7 h-7 mx-auto text-slate-400" />
                      <p className="text-xs font-semibold text-slate-600">No hay fotos en la galería todavía</p>
                      <p className="text-[11px] text-slate-400">Haz clic en &quot;Subir desde mi computadora&quot; para agregar fotos en lote.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {form.branding.gallery.map((photo, index) => (
                        <div
                          key={photo.id}
                          className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs group flex flex-col"
                        >
                          <div className="relative aspect-square bg-slate-100 overflow-hidden">
                            <img
                              src={photo.url}
                              alt={photo.caption || 'Foto'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('¿Eliminar esta fotografía de la galería?')) {
                                  setForm((prev) => ({
                                    ...prev,
                                    branding: {
                                      ...prev.branding,
                                      gallery: (prev.branding.gallery || []).filter((_, i) => i !== index),
                                    },
                                  }));
                                }
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 hover:bg-red-600 text-white transition-colors"
                              title="Eliminar foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-2 flex-1 flex flex-col justify-between">
                            <input
                              type="text"
                              value={photo.caption || ''}
                              placeholder="Pie de foto..."
                              onChange={(e) => {
                                const updated = [...(form.branding.gallery || [])];
                                updated[index] = { ...photo, caption: e.target.value };
                                setForm((prev) => ({
                                  ...prev,
                                  branding: { ...prev.branding, gallery: updated },
                                }));
                              }}
                              className="w-full text-[11px] px-1.5 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: CONTACT & SCHEDULE */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Contacto, Ubicación & Horarios</h3>
                  <p className="text-xs text-slate-500">
                    Configura números de atención, dirección, enlace para reseñas de Google y horarios semanales.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp para Pedidos (con código de país) *</label>
                    <input
                      type="text"
                      value={form.contact.whatsapp}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contact: { ...form.contact, whatsapp: e.target.value },
                          socialLinks: { ...form.socialLinks, whatsapp: e.target.value },
                        })
                      }
                      placeholder="Ej. 525512345678"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono Fijo de Reservaciones</label>
                    <input
                      type="text"
                      value={form.contact.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contact: { ...form.contact, phone: e.target.value },
                        })
                      }
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico Comercial</label>
                    <input
                      type="email"
                      value={form.contact.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contact: { ...form.contact, email: e.target.value },
                        })
                      }
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Dirección y Calle</label>
                    <input
                      type="text"
                      value={form.contact.address}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contact: { ...form.contact, address: e.target.value },
                        })
                      }
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Ciudad y Estado</label>
                    <input
                      type="text"
                      value={form.contact.city}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contact: { ...form.contact, city: e.target.value },
                        })
                      }
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Enlace de Reseñas de Google</label>
                    <input
                      type="url"
                      value={form.contact.googleReviewsUrl}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contact: { ...form.contact, googleReviewsUrl: e.target.value },
                        })
                      }
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Day-by-Day Schedule */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900">Horarios de Apertura Día por Día</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {form.schedule.map((item, index) => (
                      <div
                        key={item.day}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                      >
                        <span className="font-bold w-20 text-slate-800">{item.day}:</span>
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="time"
                            value={item.open}
                            disabled={item.closed}
                            onChange={(e) => {
                              const updated = [...form.schedule];
                              updated[index].open = e.target.value;
                              setForm({ ...form, schedule: updated });
                            }}
                            className="text-xs px-1.5 py-1 bg-white border border-slate-300 rounded disabled:opacity-30"
                          />
                          <span>a</span>
                          <input
                            type="time"
                            value={item.close}
                            disabled={item.closed}
                            onChange={(e) => {
                              const updated = [...form.schedule];
                              updated[index].close = e.target.value;
                              setForm({ ...form, schedule: updated });
                            }}
                            className="text-xs px-1.5 py-1 bg-white border border-slate-300 rounded disabled:opacity-30"
                          />
                        </div>
                        <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.closed}
                            onChange={(e) => {
                              const updated = [...form.schedule];
                              updated[index].closed = e.target.checked;
                              setForm({ ...form, schedule: updated });
                            }}
                            className="rounded"
                          />
                          <span>Cerrado</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SPEI & MERCADO PAGO */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Métodos de Cobro & Pagos</h3>
                  <p className="text-xs text-slate-500">
                    Configura tus datos bancarios para transferencias directas sin comisiones y conecta Mercado Pago.
                  </p>
                </div>

                {/* SPEI Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Datos Bancarios para Transferencia (SPEI)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Banco Receptor</label>
                      <input
                        type="text"
                        value={form.bankDetails.bankName}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bankDetails: { ...form.bankDetails, bankName: e.target.value },
                          })
                        }
                        placeholder="Ej. BBVA México, Banorte, Santander"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Beneficiario / Titular</label>
                      <input
                        type="text"
                        value={form.bankDetails.accountHolder}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bankDetails: { ...form.bankDetails, accountHolder: e.target.value },
                          })
                        }
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">CLABE Interbancaria (18 dígitos) *</label>
                      <input
                        type="text"
                        maxLength={18}
                        value={form.bankDetails.clabe}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bankDetails: { ...form.bankDetails, clabe: e.target.value },
                          })
                        }
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Número de Cuenta (Opcional)</label>
                      <input
                        type="text"
                        value={form.bankDetails.accountNumber}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bankDetails: { ...form.bankDetails, accountNumber: e.target.value },
                          })
                        }
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">Instrucciones para el cliente</label>
                      <input
                        type="text"
                        value={form.bankDetails.transferInstructions}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bankDetails: { ...form.bankDetails, transferInstructions: e.target.value },
                          })
                        }
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Mercado Pago Configuration & Pedagogical Guide */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#009EE3]" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Pasarela de Cobro en Línea · Mercado Pago Checkout Pro
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full w-fit">
                      Integración Oficial 2025
                    </span>
                  </div>

                  {/* Friendly Guide & Explanation */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-2 text-slate-700">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-blue-950">
                          ¿Cómo funciona Mercado Pago en tu tarjeta digital?
                        </p>
                        <p className="text-[11px] leading-relaxed text-blue-900/90">
                          Cuando un cliente termina su orden en el menú digital y elige pagar con Mercado Pago, se despliega la pasarela segura con tarjetas de crédito/débito, saldo Mercado Pago, transferencia SPEI o pago en OXXO. Al aprobarse, el dinero cae directo a tu cuenta bancaria y recibes la comanda en WhatsApp.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="p-2 bg-white rounded-lg border border-blue-100">
                        <span className="font-bold text-slate-800 block">Public Key (Clave Pública):</span>
                        <span className="text-slate-500">Identifica a tu negocio de manera segura ante el navegador del cliente.</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-blue-100">
                        <span className="font-bold text-slate-800 block">Access Token (Token Privado):</span>
                        <span className="text-slate-500">Autoriza la transacción bancaria. Debe mantenerse protegido.</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-1">
                      ¿Dónde obtener tus claves reales? Regístrate gratis en{' '}
                      <a
                        href="https://www.mercadopago.com.mx/developers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline font-bold"
                      >
                        developers.mercadopago.com
                      </a>
                      , ve a Tus Aplicaciones y copia tus llaves.
                    </p>
                  </div>

                  {/* Feedback Banner if test keys loaded */}
                  {mpFeedback && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{mpFeedback}</span>
                    </div>
                  )}

                  {/* Quick Action Helpers: Load Test Credentials & Test Live Simulation */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadOfficialSandboxCredentials}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Cargar credenciales de prueba oficiales (Sandbox)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMpSimStep('method');
                        setIsMpSimulatorOpen(true);
                      }}
                      className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Probar Simulación de Cobro en Vivo</span>
                    </button>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Public Key de Mercado Pago</label>
                      <input
                        type="text"
                        value={form.mercadoPagoConfig.publicKey}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            mercadoPagoConfig: { ...form.mercadoPagoConfig, publicKey: e.target.value },
                          })
                        }
                        placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Access Token de Mercado Pago</label>
                      <input
                        type="password"
                        value={form.mercadoPagoConfig.accessToken}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            mercadoPagoConfig: { ...form.mercadoPagoConfig, accessToken: e.target.value },
                          })
                        }
                        placeholder="TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxx-xxxxxx"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-1 md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={form.mercadoPagoConfig.sandboxMode}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              mercadoPagoConfig: { ...form.mercadoPagoConfig, sandboxMode: e.target.checked },
                            })
                          }
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span>Modo Sandbox Activado (Pruebas sin cobro real a tarjetas)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: ORDERS WORKFLOW */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Gestor de Pedidos Recibidos</h3>
                    <p className="text-xs text-slate-500">
                      Actualiza el estado de los pedidos y notifica a tus clientes por WhatsApp con 1 clic.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-900 text-white rounded-lg">
                    {orders.length} pedidos totales
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">Aún no hay pedidos registrados para este restaurante</p>
                    <p className="text-xs text-slate-400">
                      Prueba hacer un pedido de prueba desde la vista móvil a la derecha.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              #{ord.id} · {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                              {ord.customerName} ({ord.customerPhone})
                            </h4>
                            <p className="text-xs text-slate-500">
                              Modalidad: {ord.orderType === 'delivery' ? `🛵 Domicilio: ${ord.deliveryAddress}` : ord.orderType === 'pickup' ? '🛍️ Recoger en local' : `En mesa (${ord.tableNumber || 'S/N'})`}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                              ${ord.total} MXN
                            </span>
                            <span className="block text-[11px] font-semibold text-slate-500 capitalize">
                              Pago: {ord.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Items details */}
                        <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                          {ord.items.map((it: any, i: number) => (
                            <div key={i} className="flex justify-between text-slate-700">
                              <span>
                                {it.quantity}x {it.productName} {it.variantName ? `(${it.variantName})` : ''}
                              </span>
                              <span className="font-semibold tabular-nums">${it.subtotal} MXN</span>
                            </div>
                          ))}
                        </div>

                        {/* Order status selector & WhatsApp button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-500">Estado:</span>
                            <select
                              value={ord.orderStatus}
                              onChange={async (e) => {
                                await OrderService.updateOrderStatus(ord.id, e.target.value as any);
                                const updatedList = await OrderService.getOrders(form.slug);
                                setOrders(updatedList);
                              }}
                              className="text-xs font-bold px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg"
                            >
                              <option value="recibido">🟡 Recibido</option>
                              <option value="pendiente_pago">🟠 Pendiente de Pago</option>
                              <option value="confirmado">🔵 Confirmado</option>
                              <option value="en_preparacion">🟣 En Preparación</option>
                              <option value="listo">🟢 Listo</option>
                              <option value="enviado">🛵 Enviado</option>
                              <option value="entregado">✅ Entregado</option>
                              <option value="cancelado">❌ Cancelado</option>
                            </select>
                          </div>

                          {/* Notify on WhatsApp */}
                          <button
                            onClick={() => {
                              const cleanPhone = (ord.customerPhone || '').replace(/\D/g, '');
                              const msg = encodeURIComponent(`Hola ${ord.customerName}! Tu pedido en ${form.name} ha cambiado a estado: *${ord.orderStatus.toUpperCase()}*. Gracias por tu preferencia!`);
                              window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                            }}
                            className="text-xs font-semibold px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <span>Notificar WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: SHARE, QR & NFC */}
            {activeTab === 'share' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enlace Público, Códigos QR & Tarjetas NFC</h3>
                  <p className="text-xs text-slate-500">
                    Tu restaurante ya cuenta con una URL pública lista para difundir en cualquier canal digital o físico.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">URL Pública de tu Tarjeta Digital:</h4>
                    <button
                      onClick={() => handleOpenSaveModal('update')}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
                    >
                      Personalizar Enlace / Slug
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/restaurantes/${form.slug}/`}
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/restaurantes/${form.slug}/`);
                        alert('¡Enlace copiado al portapapeles!');
                      }}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shrink-0"
                    >
                      Copiar Enlace
                    </button>
                  </div>
                </div>

                {/* Hostinger Publication Banner in Tab 7 */}
                <div className="p-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-indigo-700/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-300" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Publicar en tu Hosting Propio · Hostinger
                      </h4>
                    </div>
                    <p className="text-xs text-indigo-200">
                      Publica tu tarjeta digital en tu hosting propio Hostinger. Puedes asignar el nombre de la tarjeta, plantilla y carpeta de destino.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenHostingerExport}
                    className="py-2 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-950" />
                    <span>Publicar en Hostinger</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <h5 className="font-bold text-xs text-slate-900">Código QR para Mesas & Mostrador</h5>
                    <p className="text-xs text-slate-500">
                      Genera códigos QR de alta resolución descargables en PNG o listos para imprimir en caballetes de mesa.
                    </p>
                    <button
                      onClick={() => onViewPublicCard(form.slug)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"
                    >
                      Abrir Generador de QR
                    </button>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <h5 className="font-bold text-xs text-slate-900">Compatibilidad con Tarjetas Físicas NFC</h5>
                    <p className="text-xs text-slate-500">
                      Graba la URL en cualquier chip NTAG213/215 usando la app gratuita NFC Tools en tu celular.
                    </p>
                    <span className="text-[11px] font-semibold text-emerald-700 block">
                      ✓ No requiere actualizar el chip al cambiar precios
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Métricas & Analíticas Reales</h3>
                  <p className="text-xs text-slate-500">
                    Rendimiento de visitas, escaneos de QR y pedidos generados desde la tarjeta digital.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">Visitas Totales</span>
                    <p className="text-2xl font-black text-slate-900 tabular-nums">
                      {form.analytics?.views || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">Visualizaciones del Menú</span>
                    <p className="text-2xl font-black text-blue-600 tabular-nums">
                      {form.analytics?.menuViews || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">Clics a WhatsApp</span>
                    <p className="text-2xl font-black text-emerald-600 tabular-nums">
                      {form.analytics?.whatsappClicks || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">Escaneos QR</span>
                    <p className="text-2xl font-black text-amber-600 tabular-nums">
                      {form.analytics?.qrScans || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: RESTAURANTS & HOSTINGER GUIDE */}
            {activeTab === 'manage' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Gestión de Restaurantes & Publicación</h3>
                  <p className="text-xs text-slate-500">
                    Crea nuevos restaurantes, duplica diseños o consulta las instrucciones para desplegar en Hostinger y GitHub.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold text-amber-950">Guardar como Nueva Tarjeta</h4>
                    </div>
                    <p className="text-xs text-amber-900/80">
                      Crea una nueva tarjeta gastronómica asignando tu propio nombre comercial, plantilla y enlace URL.
                    </p>
                    <button
                      onClick={() => handleOpenSaveModal('create_new')}
                      className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Crear Nueva con Nombre Propio</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">Duplicar este Restaurante</h4>
                    <p className="text-xs text-slate-500">
                      Crea una copia idéntica de todos los platillos, diseño y configuración con un nuevo nombre comercial.
                    </p>
                    <button
                      onClick={handleDuplicate}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicar Restaurante</span>
                    </button>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-indigo-950">Publicar en Hostinger</h4>
                    </div>
                    <p className="text-xs text-indigo-900/80">
                      Asigna el nombre que quieras a tu tarjeta, plantilla y carpeta destino en tu hosting.
                    </p>
                    <button
                      onClick={handleOpenHostingerExport}
                      className="py-2 px-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-300" />
                      <span>Publicar en Hostinger</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">Guía Paso a Paso Hostinger</h4>
                    <p className="text-xs text-slate-500">
                      Manual visual de cómo entrar al Administrador de Archivos de Hostinger y extraer la tarjeta.
                    </p>
                    <button
                      onClick={onOpenHostingerGuide}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Ver Guía Visual</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-rose-950">Restablecer Restaurantes Iniciales</h4>
                  <p className="text-xs text-rose-800">
                    Si modificaste los datos y deseas restaurar los 20 restaurantes de demostración completos originales con sus fotos y menús, puedes hacerlo aquí.
                  </p>
                  <button
                    onClick={handleResetDefaults}
                    className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Restablecer Valores de Fábrica
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Mobile Phone Frame Preview */}
        <div
          className={`bg-slate-800 p-6 flex flex-col items-center justify-center shrink-0 border-l border-slate-700 ${
            previewMode === 'editor-only' ? 'hidden' : 'flex'
          } ${previewMode === 'phone-only' ? 'flex-1 w-full' : 'w-[420px]'}`}
        >
          {/* Phone Mockup Frame */}
          <div className="w-[360px] h-[720px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col">
            {/* Phone Speaker & Camera Island */}
            <div className="absolute top-5 inset-x-0 mx-auto w-24 h-4 bg-black rounded-full z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-2" />
            </div>

            {/* Inner Phone Screen Container */}
            <div className="w-full h-full bg-white rounded-[36px] overflow-hidden overflow-y-auto no-scrollbar relative">
              <TemplateRenderer
                restaurant={form}
                onOpenProduct={() => {}}
                onOpenCart={() => {}}
                onOpenShare={() => {}}
                onOpenQr={() => {}}
                onOpenBankTransfer={() => {}}
                cartCount={1}
                cartTotal={form.products[0]?.price || 240}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Vista previa móvil en tiempo real</span>
          </p>
        </div>
      </div>

      {/* Edit / New Product Modal */}
      {isNewProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="text-sm font-bold">
                {editingProduct.name ? 'Editar Platillo' : 'Nuevo Platillo'}
              </h4>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Platillo *</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ej. Tacos al Pastor Negro..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                <select
                  value={editingProduct.categoryId}
                  onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {form.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Precio en MXN ($) *</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Ingredientes, preparación, maridaje..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Product Photo Upload from Computer & URL */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block">Fotografía del Platillo</label>
                
                {editingProduct.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 border shrink-0">
                      <img
                        src={editingProduct.imageUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => productFileInputRef.current?.click()}
                          className="py-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5"
                        >
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>Cambiar foto (Computadora)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                          className="py-1 px-2 text-red-600 hover:text-red-700 text-[11px] font-semibold"
                        >
                          Quitar
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {editingProduct.imageUrl.startsWith('data:') ? 'Imagen local cargada desde tu equipo' : editingProduct.imageUrl}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => productFileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-amber-500" />
                      <span>Subir foto desde mi computadora</span>
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  ref={productFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleProductFileUpload}
                />

                <div className="pt-1">
                  <label className="text-[10px] text-slate-500 font-medium block mb-0.5">
                    O escribe la URL directa de la foto:
                  </label>
                  <input
                    type="text"
                    value={editingProduct.imageUrl || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.available}
                    onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.checked })}
                    className="rounded text-slate-900"
                  />
                  <span>Disponible para pedir (Desmarcar si está agotado)</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!editingProduct.name.trim()) {
                    alert('El nombre del platillo es obligatorio.');
                    return;
                  }
                  handleSaveProduct(editingProduct);
                }}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
              >
                Guardar Platillo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: GUARDAR CAMBIOS O GUARDAR COMO NUEVA TARJETA / PLANTILLA */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                  {saveActionType === 'create_new' ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    {saveActionType === 'create_new'
                      ? 'Guardar como Nueva Tarjeta / Plantilla'
                      : 'Guardar Cambios y Publicar'}
                  </h4>
                  <span className="text-[10px] text-slate-400 block">
                    Personaliza el nombre de tu tarjeta, plantilla y enlace público
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ×
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="px-5 pt-3 pb-0 bg-slate-50 border-b border-slate-200 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSaveActionType('update');
                  setSaveRestaurantName(form.name);
                  setSaveSlug(form.slug);
                  setSaveTemplateName(
                    form.branding.customTemplateName ||
                    TEMPLATE_DEFINITIONS.find((t) => t.id === form.templateId)?.name ||
                    'Plantilla Personalizada'
                  );
                }}
                className={`py-2 px-3 border-b-2 font-bold flex items-center gap-1.5 transition-all ${
                  saveActionType === 'update'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Actualizar esta Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaveActionType('create_new');
                  setSaveRestaurantName(`${form.name} (Copia)`);
                  setSaveSlug(`${form.slug}-copia`);
                  const activeDef = TEMPLATE_DEFINITIONS.find((t) => t.id === form.templateId);
                  setSaveTemplateName(
                    form.branding.customTemplateName
                      ? `${form.branding.customTemplateName} (Nueva)`
                      : `${activeDef?.name || 'Plantilla'} Personalizada`
                  );
                }}
                className={`py-2 px-3 border-b-2 font-bold flex items-center gap-1.5 transition-all ${
                  saveActionType === 'create_new'
                    ? 'border-amber-500 text-amber-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Guardar como Nueva Tarjeta / Plantilla</span>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Success Notification if saved */}
              {saveSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* Mode Description Banner */}
              <div
                className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                  saveActionType === 'create_new'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {saveActionType === 'create_new' ? (
                  <p>
                    ✨ <b>Modo Nueva Tarjeta:</b> Se creará una tarjeta independiente en tu panel con su propio menú, diseño y enlace sin modificar la tarjeta original.
                  </p>
                ) : (
                  <p>
                    💾 <b>Modo Actualización:</b> Se sobrescribirán y publicarán los cambios sobre la tarjeta activa <b>{form.name}</b>.
                  </p>
                )}
              </div>

              {/* 1. Restaurant / Card Name */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  1. Nombre Comercial de la Tarjeta / Restaurante *
                </label>
                <input
                  type="text"
                  value={saveRestaurantName}
                  onChange={(e) => handleNameChangeInSaveModal(e.target.value)}
                  placeholder="Ej. La Piccola Trattoria, Lumbre Parrilla..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  El nombre que verán los clientes en la portada y encabezado del menú.
                </span>
              </div>

              {/* 2. Custom Template / Design Name */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  2. Nombre Propio de la Plantilla / Diseño Editado *
                </label>
                <input
                  type="text"
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  placeholder="Ej. Mi Estilo Lumbre de Autor, Parrilla Rústica V2..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Asigna un nombre propio a la combinación de colores, tipografías y diseño visual de esta plantilla.
                </span>
              </div>

              {/* 3. Custom Public URL Slug */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  3. Enlace Público / Identificador URL (Slug) *
                </label>
                <input
                  type="text"
                  value={saveSlug}
                  onChange={(e) => setSaveSlug(e.target.value)}
                  placeholder="ej. mi-restaurante"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <div className="mt-1 p-2 bg-slate-100 rounded-lg text-[10px] text-slate-600 font-mono break-all">
                  <span className="font-semibold text-slate-500">URL pública resultante: </span>
                  <span className="text-amber-800 font-bold">
                    {window.location.origin}/restaurantes/{saveSlug || 'tu-restaurante'}/
                  </span>
                </div>
              </div>

              {/* 4. Version Note */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  4. Nota de Versión / Descripción del Cambio
                </label>
                <input
                  type="text"
                  value={saveVersionNote}
                  onChange={(e) => setSaveVersionNote(e.target.value)}
                  placeholder="Ej. Nuevos platillos de otoño, horarios actualizados..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>

              {/* Summary box */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-slate-700 space-y-1">
                <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wide">
                  Resumen de lo que se guardará:
                </span>
                <div className="text-[11px] space-y-0.5">
                  <p>• Acción: <b>{saveActionType === 'create_new' ? 'Crear nueva tarjeta' : 'Actualizar tarjeta actual'}</b></p>
                  <p>• Nombre de la tarjeta: <b>{saveRestaurantName}</b></p>
                  <p>• Nombre de plantilla: <b>{saveTemplateName}</b> (base: {TEMPLATE_DEFINITIONS.find((t) => t.id === form.templateId)?.name || form.templateId})</p>
                  <p>• Platillos: <b>{form.products.length} productos</b> en <b>{form.categories.length} categorías</b></p>
                  <p>• Fotos en galería: <b>{form.branding.gallery?.length || 0} fotos</b></p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={saveLoading}
                className={`px-4 py-2 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all ${
                  saveActionType === 'create_new'
                    ? 'bg-amber-400 hover:bg-amber-300'
                    : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                {saveActionType === 'create_new' ? <Plus className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                <span>
                  {saveLoading
                    ? 'Guardando...'
                    : saveActionType === 'create_new'
                    ? 'Crear y Publicar Nueva Tarjeta'
                    : 'Confirmar y Guardar Cambios'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PUBLICAR EN HOSTINGER (PUBLICACIÓN DIRECTA SIN DESCARGA ZIP) */}
      {isHostingerExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wide">Publicar en Hostinger</h4>
                  <span className="text-[10px] text-indigo-200 block">Configura los datos de tu tarjeta para publicación en Hostinger</span>
                </div>
              </div>
              <button
                onClick={() => setIsHostingerExportModalOpen(false)}
                className="text-indigo-200 hover:text-white text-lg font-bold px-2 py-1"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {hostingerPublishSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3 text-emerald-950">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>¡Tarjeta Publicada Exitosamente en Hostinger!</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Tu tarjeta digital ha sido configurada y publicada con el nombre comercial <b>{hostingerCardName}</b> y plantilla <b>{hostingerTemplateName}</b>.
                  </p>
                  
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs space-y-2 text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">URL de tu Tarjeta en Hostinger:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">Activa</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-indigo-700 p-2 bg-indigo-50/60 rounded border border-indigo-100 break-all select-all">
                      {hostingerPublishedUrl}
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                      <p><b>Restaurante:</b> {hostingerCardName}</p>
                      <p><b>Plantilla:</b> {hostingerTemplateName}</p>
                      <p><b>Carpeta Destino:</b> {hostingerFolderName || 'public_html'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(hostingerPublishedUrl);
                        alert('¡Enlace de Hostinger copiado al portapapeles!');
                      }}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace</span>
                    </button>
                    <button
                      onClick={() => onViewPublicCard(form.hostingerConfig?.publicationSlug || form.slug)}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Tarjeta Pública</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* 1. Nombre Comercial */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      1. Nombre Comercial de la Tarjeta / Restaurante *
                    </label>
                    <input
                      type="text"
                      value={hostingerCardName}
                      onChange={(e) => setHostingerCardName(e.target.value)}
                      placeholder="Origen · Café & Roasters"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Nombre que aparecerá en el encabezado, título web y buscador.
                    </span>
                  </div>

                  {/* 2. Nombre Propio de la Plantilla */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      2. Nombre Propio de la Plantilla / Estilo Visual *
                    </label>
                    <input
                      type="text"
                      value={hostingerTemplateName}
                      onChange={(e) => setHostingerTemplateName(e.target.value)}
                      placeholder="5. Cafetería Minimalista"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Identificador de diseño para organizar tus tarjetas y plantillas.
                    </span>
                  </div>

                  {/* 4. Carpeta o Folder Destino en Hostinger */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      4. Carpeta o Folder Destino en Hostinger *
                    </label>
                    <input
                      type="text"
                      value="public_html/Restaurantes/"
                      readOnly
                      aria-readonly="true"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-700 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Directorio fijo de instalación. No se modifica al publicar cada restaurante.
                    </span>
                  </div>

                  {/* 5. Tu Dominio en Hostinger (Opcional) */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      5. Tu Dominio en Hostinger (Opcional)
                    </label>
                    <input
                      type="text"
                      value="lavdigitalagency.com"
                      readOnly
                      aria-readonly="true"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-700 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Dominio fijo de publicación.
                    </span>
                  </div>

                  {/* Live URL Preview */}
                  {(() => {
                    const fileSlug = `${hostingerCardName || form.name}-${hostingerTemplateName || 'plantilla'}`
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '') || form.slug;
                    const liveUrl = `https://lavdigitalagency.com/Restaurantes/${fileSlug}/`;
                    return (
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-indigo-600" />
                            URL donde abrirá tu tarjeta en Hostinger:
                          </span>
                          <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-1.5 py-0.5 rounded font-mono font-semibold">
                            Enlace Previsto
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-indigo-700 break-all select-all">
                          {liveUrl}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsHostingerExportModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold"
              >
                {hostingerPublishSuccess ? 'Cerrar' : 'Cancelar'}
              </button>
              {!hostingerPublishSuccess && (
                <button
                  onClick={handlePublishHostinger}
                  disabled={isPublishingHostinger}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isPublishingHostinger ? 'Publicando en Hostinger...' : 'Publicar en Hostinger'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SIMULADOR INTERACTIVO MERCADO PAGO CHECKOUT PRO */}
      {isMpSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            {/* Mercado Pago Header */}
            <div className="px-5 py-4 bg-[#009EE3] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-white" />
                <div>
                  <h4 className="text-sm font-bold">Mercado Pago Checkout Pro</h4>
                  <span className="text-[10px] text-white/80 block">Simulador Oficial para Restaurantes</span>
                </div>
              </div>
              <button
                onClick={() => setIsMpSimulatorOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Order Amount Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Orden en: {form.name}</span>
                  <span className="text-xs font-semibold text-slate-700">1x Especial de la Casa + Bebida</span>
                </div>
                <span className="text-base font-extrabold text-slate-900 tabular-nums">$320.00 MXN</span>
              </div>

              {/* Step 1: Select Method */}
              {mpSimStep === 'method' && (
                <div className="space-y-3">
                  <span className="font-bold text-slate-800 block text-xs">
                    ¿Cómo pagará tu cliente? (Selecciona un método de prueba):
                  </span>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setMpSimMethod('card')}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        mpSimMethod === 'card' ? 'border-[#009EE3] bg-blue-50/60 ring-1 ring-[#009EE3]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-[#009EE3]" />
                        <div>
                          <span className="font-bold text-slate-900 block">Tarjeta de Crédito o Débito</span>
                          <span className="text-[10px] text-slate-500">Visa, Mastercard, American Express</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#009EE3]">Inmediato</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMpSimMethod('spei')}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        mpSimMethod === 'spei' ? 'border-[#009EE3] bg-blue-50/60 ring-1 ring-[#009EE3]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="font-bold text-slate-900 block">Transferencia SPEI Inmediata</span>
                          <span className="text-[10px] text-slate-500">Acreditación instantánea 24/7</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">0% Comisión</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMpSimMethod('oxxo')}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        mpSimMethod === 'oxxo' ? 'border-[#009EE3] bg-blue-50/60 ring-1 ring-[#009EE3]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-red-500" />
                        <div>
                          <span className="font-bold text-slate-900 block">Efectivo en Tiendas OXXO</span>
                          <span className="text-[10px] text-slate-500">Genera código de barras para caja</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500">En ventanilla</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMpSimStep('processing');
                      setTimeout(() => setMpSimStep('approved'), 2200);
                    }}
                    className="w-full py-2.5 bg-[#009EE3] hover:bg-[#0089c7] text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Continuar con el Pago Simulado
                  </button>
                </div>
              )}

              {/* Step 2: Processing animation */}
              {mpSimStep === 'processing' && (
                <div className="py-10 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-[#009EE3] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">Procesando pago con Mercado Pago...</p>
                  <p className="text-xs text-slate-400">Verificando fondos y generando confirmación oficial.</p>
                </div>
              )}

              {/* Step 3: Approved */}
              {mpSimStep === 'approved' && (
                <div className="space-y-3 text-center py-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-base">¡Pago Aprobado Exitosamente!</h5>
                    <p className="text-xs text-slate-500">Transacción ID: #MP-{Math.floor(100000 + Math.random() * 900000)}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] space-y-1 text-slate-700">
                    <p>• <b>Comercio:</b> {form.name}</p>
                    <p>• <b>Monto acreditado:</b> $320.00 MXN</p>
                    <p>• <b>Medio utilizado:</b> {mpSimMethod === 'card' ? 'Tarjeta Bancaria' : mpSimMethod === 'spei' ? 'SPEI Transferencia' : 'OXXO'}</p>
                    <p>• <b>Notificación:</b> Enlace de comanda enviado automáticamente a WhatsApp.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMpSimStep('method');
                      setIsMpSimulatorOpen(false);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                  >
                    Finalizar Prueba y Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
