# Guía de Deploy — Sistema de Inventario Grupo HLS
## cPanel + MySQL + PHP 8.2

---

## Estructura esperada en el servidor

```
/home/grupohls/
├── public_html/          ← React build (SPA)
│   ├── index.html
│   ├── assets/
│   └── .htaccess         ← reglas SPA + proxy /api
└── inventario_api/       ← Laravel (fuera de public_html)
    ├── app/
    ├── public/           ← symlink o merge en public_html/api
    ├── storage/
    ├── .env
    └── ...
```

> **Recomendado**: crear un subdominio `api.grupohls.mx` apuntando a
> `/home/grupohls/inventario_api/public` para separar completamente
> el frontend del backend.

---

## 1. Base de datos MySQL en cPanel

1. Entrar a **cPanel → MySQL Databases**.
2. Crear base de datos: `grupohls_inventario`
3. Crear usuario: `grupohls_inv` con contraseña segura.
4. Asignar usuario a la base de datos con **todos los privilegios**.
5. Anotar: host (normalmente `localhost`), nombre DB, usuario y contraseña.

---

## 2. Subir y configurar Laravel (backend)

### 2a. Subir archivos

Subir el contenido de `/backend` a `/home/grupohls/inventario_api/`
via **cPanel File Manager** (ZIP + extraer) o FTP.

**No subir**: `vendor/`, `.env`, `node_modules/`.

### 2b. Instalar dependencias vía SSH (o cPanel Terminal)

```bash
cd ~/inventario_api
php8.2 /usr/local/bin/composer install --no-dev --optimize-autoloader
```

Si Composer no está disponible como comando global:
```bash
curl -sS https://getcomposer.org/installer | php8.2
php8.2 composer.phar install --no-dev --optimize-autoloader
```

### 2c. Crear `.env`

```bash
cp .env.example .env
php8.2 artisan key:generate
```

Editar `.env` con los valores de producción:

```ini
APP_NAME="Inventario Grupo HLS"
APP_ENV=production
APP_KEY=           # generado por key:generate — NO cambiar
APP_DEBUG=false
APP_URL=https://api.grupohls.mx
APP_TIMEZONE=America/Mexico_City

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=grupohls_inventario
DB_USERNAME=grupohls_user
DB_PASSWORD=TU_PASSWORD_SEGURA_AQUI

# Auth Sanctum — dominio del frontend (SIN https://)
SANCTUM_STATEFUL_DOMAINS=inventario.grupohls.mx
SESSION_DRIVER=database
SESSION_DOMAIN=.grupohls.mx
SESSION_SECURE_COOKIE=true
SESSION_ENCRYPT=true
SESSION_LIFETIME=480

FRONTEND_URL=https://inventario.grupohls.mx

# Caché y colas (database = sin Redis, ideal para shared hosting)
CACHE_STORE=database
QUEUE_CONNECTION=database

LOG_CHANNEL=daily
LOG_LEVEL=error
LOG_DAYS=30

# Negocio
IVA_PORCENTAJE=16
MONEDA=MXN
EMPRESA_NOMBRE="Grupo HLS"
```

> **Importante:** `SANCTUM_STATEFUL_DOMAINS` debe coincidir **exactamente** con el dominio
> desde donde se hace el login (sin `https://`, sin trailing slash).

### 2d. Migrar y sembrar datos

```bash
cd ~/inventario_api

# Ejecutar migraciones
php8.2 artisan migrate --force

# Sembrar roles, permisos y usuario admin inicial
php8.2 artisan db:seed --force

# Enlace de almacenamiento
php8.2 artisan storage:link
```

### 2e. Cachear configuración para producción

```bash
php8.2 artisan config:cache
php8.2 artisan route:cache
php8.2 artisan view:cache
```

> Para limpiar caché si se actualiza `.env`:
> `php8.2 artisan optimize:clear`

### 2f. Permisos de archivos

```bash
chmod -R 755 ~/inventario_api
chmod -R 775 ~/inventario_api/storage
chmod -R 775 ~/inventario_api/bootstrap/cache
```

### 2g. `.htaccess` en `inventario_api/public/`

Laravel ya incluye el `.htaccess` correcto. Verificar que existe:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

---

## 3. Compilar y subir React (frontend)

### 3a. Variables de entorno para producción

Crear `frontend/.env.production`:

```ini
VITE_API_URL=https://api.grupohls.mx
```

### 3b. Build local

```bash
cd frontend
npm install
npm run build
```

Esto genera `frontend/dist/`.

### 3c. Subir dist/ a public_html

Subir **el contenido** de `frontend/dist/` (no la carpeta dist misma)
a `/home/grupohls/public_html/`.

### 3d. `.htaccess` en `public_html/`

Crear `/home/grupohls/public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Archivos y directorios reales — pasar directo
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Todo lo demás → index.html (React SPA)
    RewriteRule ^ index.html [L]
</IfModule>
```

---

## 4. Configurar subdominio `api.grupohls.mx` (cPanel)

1. **cPanel → Subdomains** → crear `api` apuntando al Document Root:
   `/home/grupohls/inventario_api/public`
2. **cPanel → SSL/TLS** → instalar certificado Let's Encrypt para
   `api.grupohls.mx` (AutoSSL).
3. Hacer lo mismo para el dominio principal `grupohls.mx`.

---

## 5. Cron Job — Laravel Scheduler

En **cPanel → Cron Jobs**, agregar entrada con intervalo **Every Minute**:

```
* * * * * /usr/local/bin/php8.2 /home/grupohls/inventario_api/artisan schedule:run >> /dev/null 2>&1
```

---

## 6. Credenciales iniciales

Después de `db:seed`, el usuario administrador por defecto es:

| Campo    | Valor              |
|----------|--------------------|
| Email    | admin@grupohls.mx  |
| Password | `Admin2024!HLS`    |
| Rol      | ADMIN              |

**Cambiar la contraseña inmediatamente** al primer login.

---

## 7. Actualizaciones futuras

### Backend (nueva versión)

```bash
cd ~/inventario_api

# Subir nuevos archivos vía FTP/ZIP

# Instalar dependencias nuevas (si las hay)
php8.2 /usr/local/bin/composer install --no-dev --optimize-autoloader

# Ejecutar migraciones nuevas
php8.2 artisan migrate --force

# Limpiar y re-cachear
php8.2 artisan optimize:clear
php8.2 artisan config:cache
php8.2 artisan route:cache
php8.2 artisan view:cache
```

### Frontend (nueva versión)

```bash
# Local
cd frontend
npm run build

# Subir dist/ a public_html/ reemplazando archivos anteriores
# El index.html y assets/ se actualizan automáticamente
```

---

## 8. Verificación post-deploy

### Infraestructura
- [ ] `https://inventario.grupohls.mx` carga la app React (SPA)
- [ ] `https://api.grupohls.mx/sanctum/csrf-cookie` responde `204`
- [ ] SSL activo en ambos dominios (candado verde)
- [ ] Recargar página en ruta interna (ej: `/ventas`) no da 404 → `.htaccess` OK

### Auth y permisos
- [ ] Login con `admin@grupohls.mx` / `Admin2024!HLS` funciona
- [ ] Dashboard carga KPIs sin errores de consola
- [ ] **Cambiar contraseña del admin** inmediatamente

### Funcionalidad core (flujo completo)
- [ ] Crear un producto con SKU, categoría y precio
- [ ] Crear una orden de compra y aprobarla
- [ ] Recibir la mercancía (recepción) → verificar que el stock sube
- [ ] Registrar una venta → verificar que el stock baja
- [ ] Crear un pedido → confirmar → convertir a venta
- [ ] Crear una carga → iniciar → liquidar
- [ ] Verificar kardex del producto muestra los movimientos
- [ ] Dashboard muestra las ventas del día

### Módulos operativos
- [ ] Clientes: crear y asignar a ruta
- [ ] Rutas: crear con vehículo y repartidor
- [ ] Devoluciones: registrar y aprobar
- [ ] Mermas: registrar y aprobar
- [ ] Ajustes: registrar y aprobar
- [ ] Envases retornables: registrar préstamo y devolución
- [ ] Reportes: ventas, inventario, cargas, mermas, cartera

### Admin
- [ ] Crear usuario con rol VENDEDOR y verificar permisos
- [ ] Audit log visible para ADMIN

---

## Solución de problemas comunes

| Problema | Solución |
|----------|----------|
| `500 Server Error` en Laravel | Revisar `storage/logs/laravel.log`, verificar permisos storage/ |
| CORS bloqueado | Verificar `SANCTUM_STATEFUL_DOMAINS` y `CORS_ALLOWED_ORIGINS` en `.env` |
| Rutas React dan 404 al recargar | Verificar `.htaccess` en `public_html/` |
| Sesión no persiste | Verificar `SESSION_DOMAIN=.grupohls.mx` y `SESSION_SECURE_COOKIE=true` |
| Composer da error de memoria | Agregar `COMPOSER_MEMORY_LIMIT=-1` antes del comando |
| PHP version incorrecta | Usar `php8.2` explícito; en cPanel → MultiPHP Manager seleccionar PHP 8.2 |
