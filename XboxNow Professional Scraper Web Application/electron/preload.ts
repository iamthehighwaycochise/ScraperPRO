import { contextBridge, ipcRenderer } from 'electron';

// Configuración de eventos personalizados
export type ElectronAPI = {
  // Información de la aplicación
  getVersion: () => Promise<string>;
  
  // Diálogos del sistema
  showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
  showOpenDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
  
  // Navegación externa
  openExternal: (url: string) => Promise<void>;
  
  // Eventos del menú
  onMenuEvent: (callback: (event: string, data?: any) => void) => void;
  removeMenuEventListener: (callback: (event: string, data?: any) => void) => void;
  
  // Sistema de archivos (para exportar/importar)
  platform: NodeJS.Platform;
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', {
      // Información de la aplicación
      getVersion: () => ipcRenderer.invoke('app-version'),
      
      // Diálogos del sistema
      showSaveDialog: (options: Electron.SaveDialogOptions) => 
        ipcRenderer.invoke('show-save-dialog', options),
      showOpenDialog: (options: Electron.OpenDialogOptions) => 
        ipcRenderer.invoke('show-open-dialog', options),
      showMessageBox: (options: Electron.MessageBoxOptions) => 
        ipcRenderer.invoke('show-message-box', options),
      
      // Navegación externa
      openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
      
      // Eventos del menú
      onMenuEvent: (callback: (event: string, data?: any) => void) => {
        const menuEvents = [
          'menu-new-scraping',
          'menu-open-file',
          'menu-export-csv',
          'menu-export-excel',
          'menu-open-settings',
          'menu-search',
          'menu-start-scraping',
          'menu-pause-scraping',
          'menu-stop-scraping',
          'menu-select-all-games',
          'menu-clear-selection',
          'menu-price-history',
          'menu-stats',
          'menu-toggle-theme'
        ];
        
        menuEvents.forEach(event => {
          ipcRenderer.on(event, (_, data) => callback(event, data));
        });
      },
      
      removeMenuEventListener: (callback: (event: string, data?: any) => void) => {
        ipcRenderer.removeAllListeners('menu-new-scraping');
        ipcRenderer.removeAllListeners('menu-open-file');
        ipcRenderer.removeAllListeners('menu-export-csv');
        ipcRenderer.removeAllListeners('menu-export-excel');
        ipcRenderer.removeAllListeners('menu-open-settings');
        ipcRenderer.removeAllListeners('menu-search');
        ipcRenderer.removeAllListeners('menu-start-scraping');
        ipcRenderer.removeAllListeners('menu-pause-scraping');
        ipcRenderer.removeAllListeners('menu-stop-scraping');
        ipcRenderer.removeAllListeners('menu-select-all-games');
        ipcRenderer.removeAllListeners('menu-clear-selection');
        ipcRenderer.removeAllListeners('menu-price-history');
        ipcRenderer.removeAllListeners('menu-stats');
        ipcRenderer.removeAllListeners('menu-toggle-theme');
      },
      
      // Información del sistema
      platform: process.platform
    } as ElectronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = {
    getVersion: () => ipcRenderer.invoke('app-version'),
    showSaveDialog: (options: Electron.SaveDialogOptions) => 
      ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options: Electron.OpenDialogOptions) => 
      ipcRenderer.invoke('show-open-dialog', options),
    showMessageBox: (options: Electron.MessageBoxOptions) => 
      ipcRenderer.invoke('show-message-box', options),
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
    onMenuEvent: (callback: (event: string, data?: any) => void) => {
      const menuEvents = [
        'menu-new-scraping',
        'menu-open-file',
        'menu-export-csv',
        'menu-export-excel',
        'menu-open-settings',
        'menu-search',
        'menu-start-scraping',
        'menu-pause-scraping',
        'menu-stop-scraping',
        'menu-select-all-games',
        'menu-clear-selection',
        'menu-price-history',
        'menu-stats',
        'menu-toggle-theme'
      ];
      
      menuEvents.forEach(event => {
        ipcRenderer.on(event, (_, data) => callback(event, data));
      });
    },
    removeMenuEventListener: () => {
      ipcRenderer.removeAllListeners('menu-new-scraping');
      ipcRenderer.removeAllListeners('menu-open-file');
      ipcRenderer.removeAllListeners('menu-export-csv');
      ipcRenderer.removeAllListeners('menu-export-excel');
      ipcRenderer.removeAllListeners('menu-open-settings');
      ipcRenderer.removeAllListeners('menu-search');
      ipcRenderer.removeAllListeners('menu-start-scraping');
      ipcRenderer.removeAllListeners('menu-pause-scraping');
      ipcRenderer.removeAllListeners('menu-stop-scraping');
      ipcRenderer.removeAllListeners('menu-select-all-games');
      ipcRenderer.removeAllListeners('menu-clear-selection');
      ipcRenderer.removeAllListeners('menu-price-history');
      ipcRenderer.removeAllListeners('menu-stats');
      ipcRenderer.removeAllListeners('menu-toggle-theme');
    },
    platform: process.platform
  } as ElectronAPI;
}