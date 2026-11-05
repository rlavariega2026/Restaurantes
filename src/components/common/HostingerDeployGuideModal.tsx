import React, { useState } from 'react';
import { X, Server, Github, Globe, FileCode, CheckCircle, Terminal, HelpCircle, Copy, Check } from 'lucide-react';

interface HostingerDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostingerDeployGuideModal: React.FC<HostingerDeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'hostinger_static' | 'hostinger_node' | 'htaccess'>('github');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold">Guía de Despliegue en GitHub & Hostinger</h3>
              <p className="text-[11px] text-slate-400">Instrucciones oficiales para publicar y mantener tu aplicación en producción</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('github')}
            className={`py-2 px-3 border-b-2 font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'github'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>1. Repositorio en GitHub</span>
          </button>
          <button
            onClick={() => setActiveTab('hostinger_static')}
            className={`py-2 px-3 border-b-2 font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'hostinger_static'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. Hostinger Web (Estático)</span>
          </button>
          <button
            onClick={() => setActiveTab('hostinger_node')}
            className={`py-2 px-3 border-b-2 font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'hostinger_node'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. Hostinger VPS / Node.js</span>
          </button>
          <button
            onClick={() => setActiveTab('htaccess')}
            className={`py-2 px-3 border-b-2 font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'htaccess'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>.htaccess (Rutas SPA)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
          {activeTab === 'github' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Github className="w-4 h-4" />
                Cómo Subir el Proyecto a tu Cuenta de GitHub
              </h4>
              <p>
                Mantener tu código en GitHub te permite tener control de versiones, colaborar en equipo y conectar despliegues automáticos (CI/CD) con Hostinger.
              </p>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 font-mono text-[11px] relative">
                <button
                  onClick={() =>
                    copyCode(
                      'git init\ngit add .\ngit commit -m "Initial commit - LAV Restaurantes"\ngit branch -M main\ngit remote add origin https://github.com/TU-USUARIO/lav-restaurantes.git\ngit push -u origin main',
                      'git'
                    )
                  }
                  className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
                >
                  {copiedSnippet === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <p className="text-slate-400"># 1. Iniciar git en la raíz de tu proyecto:</p>
                <p className="text-emerald-400">git init</p>
                <p className="text-emerald-400">git add .</p>
                <p className="text-emerald-400">git commit -m &quot;Initial commit - LAV Restaurantes&quot;</p>
                <p className="text-slate-400"># 2. Conectar tu repositorio remoto de GitHub:</p>
                <p className="text-emerald-400">git branch -M main</p>
                <p className="text-emerald-400">git remote add origin https://github.com/TU-USUARIO/lav-restaurantes.git</p>
                <p className="text-emerald-400">git push -u origin main</p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-blue-900">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                  Archivo .gitignore configurado
                </p>
                <p className="text-[11px]">
                  El proyecto ya incluye un archivo <code>.gitignore</code> para proteger credenciales y evitar subir la carpeta <code>node_modules/</code> o claves privadas.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'hostinger_static' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Opción A: Publicar en Hosting Compartido de Hostinger (Plan Web / WordPress)
              </h4>
              <p>
                Si tienes un plan de hosting compartido de Hostinger (sin VPS), puedes compilar la aplicación como una SPA estática ultrarrápida:
              </p>

              <ol className="list-decimal list-inside space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <li>
                  Ejecuta en tu terminal el comando de compilación:
                  <code className="block mt-1 font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-800">
                    npm run build
                  </code>
                </li>
                <li>
                  Esto creará una carpeta llamada <strong>dist/</strong> con todo el HTML, CSS y JavaScript minificado.
                </li>
                <li>
                  Ingresa al <strong>hPanel de Hostinger</strong> → <strong>Administrador de Archivos</strong>.
                </li>
                <li>
                  Navega hasta la carpeta <strong>public_html/</strong> de tu dominio (o de un subdominio como <code>restaurantes.lavdigitalmkt.com</code>).
                </li>
                <li>
                  Sube todo el contenido interior de la carpeta <code>dist/</code> a <code>public_html/</code>.
                </li>
                <li>
                  Crea o sube el archivo <strong>.htaccess</strong> (ver la pestaña .htaccess) para que las URLs públicas como <code>/restaurantes/nombre/</code> funcionen al recargar.
                </li>
              </ol>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                <strong>Persistencia automática:</strong> Gracias a la arquitectura dual de la aplicación, si el backend Express no está presente, el sistema guarda y recupera todos los datos del menú, pedidos y restaurantes automáticamente en el almacenamiento local del navegador y en la sesión del usuario.
              </div>
            </div>
          )}

          {activeTab === 'hostinger_node' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                Opción B: Hostinger VPS / Cloud con Servidor Node.js Completo
              </h4>
              <p>
                Si dispones de un VPS de Hostinger o un hosting con <strong>Node.js Selector</strong> (Cloud Hosting), puedes ejecutar el servidor Express en producción para persistencia en archivos JSON / base de datos y webhooks de Mercado Pago:
              </p>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 font-mono text-[11px]">
                <p className="text-slate-400"># 1. En tu servidor VPS de Hostinger:</p>
                <p className="text-emerald-400">git clone https://github.com/TU-USUARIO/lav-restaurantes.git</p>
                <p className="text-emerald-400">cd lav-restaurantes</p>
                <p className="text-slate-400"># 2. Instalar dependencias:</p>
                <p className="text-emerald-400">npm install</p>
                <p className="text-slate-400"># 3. Compilar el cliente y arrancar con PM2:</p>
                <p className="text-emerald-400">npm run build</p>
                <p className="text-emerald-400">pm2 start &quot;npx tsx server.ts&quot; --name &quot;lav-restaurantes&quot;</p>
              </div>

              <p className="text-[11px] text-slate-600">
                El servidor Express escuchará en el puerto 3000 y puedes configurar un Reverse Proxy Nginx en Hostinger para redirigir <code>lavdigitalmkt.com</code> hacia <code>http://localhost:3000</code>.
              </p>
            </div>
          )}

          {activeTab === 'htaccess' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-600" />
                Configuración de .htaccess para Rutas Limpias en Apache / Hostinger
              </h4>
              <p>
                Al usar React Router o rutas limpias como <code>/restaurantes/lumbre-alta-cocina/</code>, los servidores Apache en Hostinger necesitan una regla de reescritura para que no den error 404 al recargar:
              </p>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] relative">
                <button
                  onClick={() => copyCode(htaccessContent, 'htaccess')}
                  className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
                >
                  {copiedSnippet === 'htaccess' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre className="whitespace-pre-wrap">{htaccessContent}</pre>
              </div>

              <p className="text-[11px] text-slate-600">
                Guarda este archivo con el nombre exacto <code>.htaccess</code> dentro de la carpeta <code>public_html/</code> en Hostinger.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">LAV Digital MKT · Soporte de Despliegue</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
