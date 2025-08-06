import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

// Configuración de la ventana principal
function createWindow(): void {
  // Crear la ventana del navegador
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 600,
    show: false,
    autoHideMenuBar: false,
    icon: icon,
    titleBarStyle: 'default',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Configurar la ventana
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR para renderer basado en electron-vite cli.
  // Cargar la app remota en desarrollo, sino cargar el archivo local.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Abrir DevTools en desarrollo
  if (is.dev) {
    mainWindow.webContents.openDevTools();
  }
}

// Este método se ejecuta cuando Electron ha terminado de inicializarse
// y está listo para crear ventanas del navegador.
app.whenReady().then(() => {
  // Configuración por defecto para aplicaciones Electron de MacOS
  electronApp.setAppUserModelId('com.xboxnow.scraper');

  // Configurar el menú de la aplicación
  createApplicationMenu();

  // Configurar eventos de la aplicación
  setupAppEvents();

  createWindow();

  app.on('activate', function () {
    // En macOS es común re-crear una ventana cuando
    // el icono del dock es clickeado y no hay otras ventanas abiertas.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Configurar el menú de la aplicación
function createApplicationMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nuevo Scraping',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Enviar evento al renderer para iniciar nuevo scraping
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-new-scraping');
          }
        },
        {
          label: 'Abrir Archivo...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { name: 'CSV Files', extensions: ['csv'] },
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu-open-file', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exportar CSV',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-export-csv');
          }
        },
        {
          label: 'Exportar Excel',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-export-excel');
          }
        },
        { type: 'separator' },
        {
          label: 'Configuración',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-open-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'selectall', label: 'Seleccionar Todo' },
        { type: 'separator' },
        {
          label: 'Buscar',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-search');
          }
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar Recarga' },
        { role: 'toggleDevTools', label: 'Herramientas de Desarrollador' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla Completa' }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Iniciar Scraping',
          accelerator: 'F5',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-start-scraping');
          }
        },
        {
          label: 'Pausar/Reanudar',
          accelerator: 'F6',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-pause-scraping');
          }
        },
        {
          label: 'Detener Scraping',
          accelerator: 'F7',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-stop-scraping');
          }
        },
        { type: 'separator' },
        {
          label: 'Seleccionar Todos los Juegos',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-select-all-games');
          }
        },
        {
          label: 'Limpiar Selección',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-clear-selection');
          }
        },
        { type: 'separator' },
        {
          label: 'Historial de Precios',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-price-history');
          }
        },
        {
          label: 'Estadísticas',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-stats');
          }
        }
      ]
    },
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Cerrar' },
        { type: 'separator' },
        {
          label: 'Tema Oscuro',
          type: 'checkbox',
          checked: true,
          click: (menuItem) => {
            BrowserWindow.getFocusedWindow()?.webContents.send('menu-toggle-theme', menuItem.checked);
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de XboxNow Scraper',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'Acerca de XboxNow Professional Scraper',
              message: 'XboxNow Professional Scraper v2.0',
              detail: 'Aplicación avanzada para scraping de ofertas de Xbox con integración a Google Sheets y redes sociales.\n\nDesarrollado con Electron + React + TypeScript'
            });
          }
        },
        {
          label: 'Documentación',
          click: () => {
            shell.openExternal('https://github.com/your-repo/xbox-scraper');
          }
        },
        {
          label: 'Reportar Bug',
          click: () => {
            shell.openExternal('https://github.com/your-repo/xbox-scraper/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Configurar eventos de la aplicación
function setupAppEvents(): void {
  // Manejar eventos IPC desde el renderer
  ipcMain.handle('app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('show-save-dialog', async (_, options) => {
    const result = await dialog.showSaveDialog(options);
    return result;
  });

  ipcMain.handle('show-open-dialog', async (_, options) => {
    const result = await dialog.showOpenDialog(options);
    return result;
  });

  ipcMain.handle('show-message-box', async (_, options) => {
    const result = await dialog.showMessageBox(options);
    return result;
  });

  ipcMain.handle('open-external', (_, url) => {
    shell.openExternal(url);
  });

  // Optimizar para desarrollo en Windows
  if (is.dev && process.platform === 'win32') {
    app.setAppUserModelId(app.getName());
  }
}

// En este archivo, puedes incluir el resto del código específico de tu proceso principal
// Los archivos de Electron se van a incluir automáticamente al hacer el build.