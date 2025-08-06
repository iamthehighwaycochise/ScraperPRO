# XboxNow Professional Scraper

Una aplicación profesional de escritorio y web para extraer datos de juegos de Xbox con capacidades avanzadas de carga masiva, integración con Gameflip, Ko-fi, Google Sheets y redes sociales.

## 🚀 Características Principales

### 📊 Scraping Avanzado
- Extracción de datos de más de 200 regiones
- API de Xbox Store Edge mejorada
- Seguimiento de precios e historial
- Detección automática de ofertas y juegos gratuitos

### 📦 Bulk Upload Manager
- Carga masiva de listas de juegos
- Procesamiento por lotes configurable
- Soporte multi-plataforma (Gameflip, Ko-fi, Discord)
- Control de progreso en tiempo real

### 🎮 Integraciones
- **Gameflip**: Subida automática de listings
- **Ko-fi**: Integración de productos
- **Google Sheets**: Importación/exportación
- **Redes Sociales**: Discord, Twitter, Instagram

### 🔍 Xbox Product Viewer
- Búsqueda avanzada de productos
- Soporte para todos los mercados
- Información detallada con imágenes
- Historial de búsquedas

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Windows, macOS, o Linux

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd xbox-now-professional-scraper
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno (opcional)
Crea un archivo `.env` en la raíz del proyecto:
```env
GAMEFLIP_API_TOKEN=tu_token_aqui
GOOGLE_SHEETS_CREDENTIALS=ruta_a_credentials.json
DISCORD_WEBHOOK_URL=tu_webhook_url
```

## 🚀 Uso

### Desarrollo Web
```bash
npm run dev
```
Abre http://localhost:5173 en tu navegador.

### Aplicación de Escritorio
```bash
npm run dev
```
La aplicación Electron se abrirá automáticamente.

### Compilar para Producción

#### Web
```bash
npm run build:web
```

#### Desktop (Windows)
```bash
npm run build:win
```

#### Desktop (macOS)
```bash
npm run build:mac
```

#### Desktop (Linux)
```bash
npm run build:linux
```

## 📖 Guía de Uso

### 1. Scraping de Juegos
1. Ve a la pestaña "Games"
2. Configura las regiones en "Scraping Controls"
3. Ajusta páginas de inicio y fin
4. Haz clic en "Start Scraping"

### 2. Bulk Upload Manager
1. Ve a la pestaña "Bulk Upload"
2. Importa un CSV con tus juegos o agrega manualmente
3. Selecciona los juegos que quieres subir
4. Configura el tamaño de lote y plataformas
5. Inicia la carga masiva

### 3. Product Viewer
1. Ve a la pestaña "Product Viewer"
2. Ingresa un Product ID (ej: 9NMHSF7Z0H9N)
3. Selecciona región e idioma
4. Haz clic en "Search"

### 4. Integraciones

#### Gameflip
1. Ve a "Gameflip" tab
2. Configura tu API token
3. Agrega listings o importa CSV
4. Configura detalles del producto
5. Inicia la subida

#### Ko-fi
1. Ve a "Ko-fi" tab
2. Configura ruta del perfil de Chrome
3. Agrega productos o importa CSV
4. Inicia la subida simulada

#### Google Sheets
1. Ve a "Google Sheets" tab
2. Sube tu archivo credentials.json
3. Configura Spreadsheet ID y nombre de hoja
4. Exporta o importa datos

## 📊 Formato CSV para Bulk Upload

### Para Gameflip:
```csv
name,platform,category,price,description,digital,digital_deliverable,digital_code,image_url,tags,shipping_within_days
Game Name,PC,GAME_KEY,19.99,Game description,true,code,ABC123,https://image.jpg,action;rpg,1
```

### Para Ko-fi:
```csv
Nombre,Descripción,Resumen,Precio,URL de entrega,Imagen,Buyer Message
Product Name,Full description,Short summary,9.99,https://delivery-url.com,https://image.jpg,Instructions for buyer
```

## 🔧 Configuración Avanzada

### APIs Requeridas

#### Gameflip API
1. Regístrate en [Gameflip Developer](https://gameflip.com/developer)
2. Obtén tu API token
3. Configúralo en la aplicación

#### Google Sheets API
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita Google Sheets API
4. Crea credenciales de cuenta de servicio
5. Descarga el archivo JSON

#### Discord Webhooks
1. Ve a configuración del servidor Discord
2. Integraciones → Webhooks
3. Crea nuevo webhook
4. Copia la URL

## ⌨️ Atajos de Teclado (Electron)

- `F5` - Iniciar scraping
- `F6` - Pausar/reanudar
- `F7` - Detener scraping
- `Ctrl+N` - Nuevo scraping
- `Ctrl+E` - Exportar CSV
- `Ctrl+F` - Buscar producto
- `Ctrl+A` - Seleccionar todo
- `Ctrl+,` - Configuración

## 🐛 Solución de Problemas

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de Electron
```bash
npm run postinstall
```

### Error de permisos (macOS/Linux)
```bash
sudo chmod +x node_modules/.bin/*
```

### Error de API de Xbox
- Verifica tu conexión a internet
- Algunos productos pueden no estar disponibles en ciertas regiones
- Usa diferentes Product IDs para probar

## 🔄 Actualizaciones

Para actualizar a una nueva versión:
```bash
git pull origin main
npm install
npm run build
```

## 📝 Estructura del Proyecto

```
├── App.tsx                 # Componente principal
├── components/             # Componentes React
│   ├── BulkUploadManager.tsx
│   ├── GameflipIntegration.tsx
│   ├── KofiIntegration.tsx
│   ├── XboxProductViewer.tsx
│   └── ui/                # Componentes UI base
├── hooks/                 # React hooks
│   ├── useScraper.ts
│   └── useXboxAPI.ts
├── electron/              # Archivos de Electron
│   ├── main.ts
│   └── preload.ts
├── types/                 # Definiciones TypeScript
└── styles/               # Estilos CSS
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## ⚠️ Disclaimer

Esta herramienta es para uso educativo y personal. Respeta los términos de servicio de las plataformas que uses. No nos hacemos responsables del uso indebido de esta aplicación.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa la sección de solución de problemas
2. Busca en issues existentes
3. Crea un nuevo issue con detalles del problema

## 🎯 Próximas Funcionalidades

- [ ] Integración con más marketplaces
- [ ] Machine Learning para predicción de precios
- [ ] API REST para integraciones externas
- [ ] Modo de monitoreo en tiempo real
- [ ] Notificaciones push móviles
- [ ] Análisis avanzado de tendencias

---

**¡Disfruta usando XboxNow Professional Scraper!** 🎮✨