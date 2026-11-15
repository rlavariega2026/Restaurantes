# RESTAURANTES LAV — Configuración de trabajo y protección

Actualizado: 15 de noviembre de 2026.

## Repositorio y publicación

- Repositorio exclusivo: https://github.com/rlavariega2026/Restaurantes
- Rama de trabajo: `main`
- URL pública: https://lavdigitalagency.com/Restaurantes/
- Administrador principal: `lavariega` (no utilizar `administrador`).
- **Carpeta visible en el administrador de archivos Hostinger:** `lavdigitalagency.com/public_html/Restaurantes/`
- **Ruta interna usada por el workflow FTP:** `/domains/lavdigitalagency.com/public_html/Restaurantes/`
- **NO CREAR UNA CARPETA `domains` EN EL ADMINISTRADOR DE ARCHIVOS.** La ruta interna no debe confundirse con la visible.
- FTP suministrado por el propietario: `194.195.84.108`, puerto `21`, usuario `u596885302`. Los valores secretos reales de Actions no son legibles desde el repositorio.
- Workflow: `.github/workflows/deploy-hostinger.yml`, publica únicamente `dist/`. No cambiar `server-dir` sin corroborar la correspondencia con la URL pública.

## Datos persistentes — prohibido borrar o sobrescribir

La API PHP `public/api.php` calcula `dirname(__DIR__).'/.restaurantes-data'`.
Una vez publicado, apunta a `lavdigitalagency.com/public_html/.restaurantes-data/`:
- `restaurants.json`: clientes, menús, diseños, configuraciones y enlaces.
- `orders.json`: pedidos.
- `lav-users.json`: cuentas y hashes de contraseña (privado).
- `media/`: imágenes originales, recuperadas mediante `lav-media.php`.
- `media-parts/`: bloques temporales de carga, no deben confundirse con imágenes definitivas.

Antes de cualquier cambio de almacenamiento, verificar físicamente la ruta y proteger los datos. No instalar ejemplos encima de datos reales. Evitar limpieza FTP destructiva. Conservar enlaces publicados y archivos de clientes.

## Publicación de clientes

- Ruta fija de instalación: `/Restaurantes/`.
- Las publicaciones se crean bajo `/Restaurantes/<carpeta-cliente>/<carpeta-publicacion>/`; ambas carpetas son reales y deben validarse.
- Publicar DEMO y Publicar definitiva reutilizan la misma dirección y se distinguen por `hostingerConfig.publicationMode`.
- DEMO: logotipo original LAV + palabra DEMO + leyenda semitransparente. Definitiva: sin marca de agua.
- Archivo oficial del logo integrado desde la referencia LAV: `public/lav-logo-original.svg`, servido como `/Restaurantes/lav-logo-original.svg`.
- No borrar ni renombrar proyectos anteriores.
- Comprobar la publicación real y el funcionamiento de su pantalla completa; no limitarse a la vista previa.
- API de publicación: `public/lav-publish.php`, requiere sesión y CSRF.

## Seguridad

- Superadmin: `lavariega` con contraseña temporal de instalación guardada únicamente como hash en PHP. Se recomienda cambiarla tras el primer ingreso. **No añadir contraseñas en texto plano a este documento.**
- Autenticación y permisos en `public/lav-security.php` y `public/lav-auth.php`.
- Los usuarios autorizados pueden editar y publicar, pero solamente `lavariega` administra cuentas.
- Los visitantes acceden a las publicaciones definitivas o DEMO sin iniciar sesión, pero no al editor ni a datos privados.

## Pruebas por cada cambio

1. `npm run build`, `npm run lint`, `php -l` de todas las rutas PHP.
2. Comprobar que GitHub Actions publica el commit autorizado y que `/Restaurantes/lav-version.json` coincide.
3. Comprobar `/Restaurantes/lav-logo-original.svg` sobre HTTPS, no solo una etiqueta `<img>`.
4. Probar login, administración de usuarios, carga de fotos, Guardar/Guardar como, DEMO, definitiva y misma URL.
5. Probar interacción de pantalla completa en zonas libres y botones/galerías sin interferencias.
6. No declarar pruebas visuales o funcionales realizadas si solo se verificaron código, compilación o respuesta HTTP.
