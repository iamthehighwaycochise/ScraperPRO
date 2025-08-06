import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { 
  Moon, 
  Sun, 
  Database, 
  Settings, 
  HelpCircle, 
  Share2, 
  FileSpreadsheet,
  TrendingUp,
  Bell,
  Zap,
  Monitor,
  Maximize2,
  Gamepad2,
  Coffee,
  Search,
  ExternalLink,
  Package,
  Globe,
  BarChart3
} from 'lucide-react';

import { ScrapingControls } from './components/ScrapingControls';
import { GameFilters } from './components/GameFilters';
import { GameTable } from './components/GameTable';
import { StatsCharts } from './components/StatsCharts';
import { GoogleSheetsIntegration } from './components/GoogleSheetsIntegration';
import { SocialMediaIntegration } from './components/SocialMediaIntegration';
import { PriceHistoryChart } from './components/PriceHistoryChart';
import { AdvancedSettings } from './components/AdvancedSettings';
import { GameflipIntegration } from './components/GameflipIntegration';
import { KofiIntegration } from './components/KofiIntegration';
import { XboxProductViewer } from './components/XboxProductViewer';
import { BulkUploadManager } from './components/BulkUploadManager';
import RegionalPriceExplorer from './components/RegionalPriceExplorer';

import { useScraper } from './hooks/useScraper';
import { FilterOptions, Game } from './types/scraper';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('games');
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState('2.0.0');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    minDiscount: 0,
    maxDiscount: 100,
    maxPrice: Infinity,
    freeOnly: false,
    selectedRegions: [],
    hasDeals: false
  });

  const {
    games,
    selectedGames,
    regionStats,
    priceHistory,
    progress,
    startScraping,
    pauseScraping,
    stopScraping,
    toggleGameSelection,
    selectAllGames,
    deselectAllGames,
    exportToCSV
  } = useScraper();

  // Detectar si estamos ejecutando en Electron
  useEffect(() => {
    const checkElectron = async () => {
      if (window.electronAPI) {
        setIsElectron(true);
        try {
          const version = await window.electronAPI.getVersion();
          setAppVersion(version);
        } catch (error) {
          console.error('Error getting app version:', error);
        }
      }
    };
    
    checkElectron();
  }, []);

  // Configurar eventos del menú de Electron
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    const handleMenuEvent = (event: string, data?: any) => {
      switch (event) {
        case 'menu-new-scraping':
          // Limpiar datos y reiniciar
          deselectAllGames();
          setActiveTab('games');
          break;
        
        case 'menu-export-csv':
          handleExportAll();
          break;
        
        case 'menu-export-excel':
          handleExportExcel();
          break;
        
        case 'menu-open-settings':
          setShowAdvancedSettings(true);
          break;
        
        case 'menu-search':
          setActiveTab('viewer');
          // Enfocar el campo de búsqueda
          setTimeout(() => {
            const searchInput = document.querySelector('input[placeholder*="Product"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }, 100);
          break;
        
        case 'menu-regional-explorer':
          setActiveTab('regional');
          break;
        
        case 'menu-start-scraping':
          if (!progress.isActive) {
            startScraping({ regions: ['US'], startPage: 1, endPage: 10 });
          }
          break;
        
        case 'menu-pause-scraping':
          if (progress.isActive) {
            pauseScraping();
          }
          break;
        
        case 'menu-stop-scraping':
          if (progress.isActive) {
            stopScraping();
          }
          break;
        
        case 'menu-select-all-games':
          selectAllGames();
          break;
        
        case 'menu-clear-selection':
          deselectAllGames();
          break;
        
        case 'menu-price-history':
          setActiveTab('history');
          break;
        
        case 'menu-stats':
          setActiveTab('analytics');
          break;
        
        case 'menu-toggle-theme':
          setDarkMode(data);
          if (data) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          break;
        
        case 'menu-open-file':
          handleOpenFile(data);
          break;
      }
    };

    window.electronAPI.onMenuEvent(handleMenuEvent);

    return () => {
      window.electronAPI.removeMenuEventListener(handleMenuEvent);
    };
  }, [isElectron, progress.isActive, selectAllGames, deselectAllGames, pauseScraping, stopScraping, startScraping]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = !filters.searchTerm || 
        game.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        game.productId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        game.region.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesDiscount = game.discount >= filters.minDiscount && 
        game.discount <= filters.maxDiscount;

      const matchesPrice = game.lowestPriceUsd <= filters.maxPrice;

      const matchesFree = !filters.freeOnly || game.lowestPriceUsd === 0;

      const matchesRegion = filters.selectedRegions.length === 0 || 
        filters.selectedRegions.includes(game.region);

      const matchesDeals = !filters.hasDeals || game.dealUntil !== '';

      return matchesSearch && matchesDiscount && matchesPrice && 
             matchesFree && matchesRegion && matchesDeals;
    });
  }, [games, filters]);

  const selectedGameObjects = useMemo(() => {
    return games.filter(game => selectedGames.has(game.id));
  }, [games, selectedGames]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleExportSelected = async () => {
    if (isElectron && window.electronAPI) {
      try {
        const result = await window.electronAPI.showSaveDialog({
          defaultPath: `xbox-games-selected-${new Date().toISOString().split('T')[0]}.csv`,
          filters: [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (!result.canceled && result.filePath) {
          exportToCSV(true);
          addNotification(`Selected games exported to ${result.filePath}`);
        }
      } catch (error) {
        console.error('Error saving file:', error);
        exportToCSV(true);
      }
    } else {
      exportToCSV(true);
    }
  };

  const handleExportAll = async () => {
    if (isElectron && window.electronAPI) {
      try {
        const result = await window.electronAPI.showSaveDialog({
          defaultPath: `xbox-games-all-${new Date().toISOString().split('T')[0]}.csv`,
          filters: [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (!result.canceled && result.filePath) {
          exportToCSV(false);
          addNotification(`All games exported to ${result.filePath}`);
        }
      } catch (error) {
        console.error('Error saving file:', error);
        exportToCSV(false);
      }
    } else {
      exportToCSV(false);
    }
  };

  const handleExportExcel = async () => {
    if (isElectron && window.electronAPI) {
      try {
        const result = await window.electronAPI.showSaveDialog({
          defaultPath: `xbox-games-${new Date().toISOString().split('T')[0]}.xlsx`,
          filters: [
            { name: 'Excel Files', extensions: ['xlsx'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (!result.canceled && result.filePath) {
          // Aquí implementarías la exportación a Excel
          addNotification(`Games exported to Excel: ${result.filePath}`);
        }
      } catch (error) {
        console.error('Error saving Excel file:', error);
      }
    }
  };

  const handleOpenFile = async (filePath?: string) => {
    if (!filePath && isElectron && window.electronAPI) {
      try {
        const result = await window.electronAPI.showOpenDialog({
          properties: ['openFile'],
          filters: [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
          filePath = result.filePaths[0];
        }
      } catch (error) {
        console.error('Error opening file:', error);
      }
    }
    
    if (filePath) {
      addNotification(`File opened: ${filePath}`);
      // Aquí implementarías la carga del archivo
    }
  };

  const handleDataLoaded = (loadedGames: Game[]) => {
    console.log('Loaded games from Google Sheets:', loadedGames);
    addNotification(`Loaded ${loadedGames.length} games from Google Sheets`);
  };

  const handleExportComplete = () => {
    addNotification('Successfully exported to Google Sheets');
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1));
    }, 5000);
  };

  const openExternalLink = (url: string) => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  // Check for special offers
  const specialOffers = useMemo(() => {
    const freeGames = games.filter(g => g.lowestPriceUsd === 0);
    const bigDiscounts = games.filter(g => g.discount > 80);
    const newDeals = games.filter(g => g.dealUntil && new Date(g.dealUntil) > new Date());
    
    return { freeGames, bigDiscounts, newDeals };
  }, [games]);

  return (
    <div className={`min-h-screen bg-background transition-colors ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">XboxNow Professional Scraper</h1>
                  <p className="text-sm text-muted-foreground">
                    {isElectron ? (
                      <span className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        Desktop App v{appVersion} - Enhanced Regional Database
                      </span>
                    ) : (
                      'Advanced Web Edition with Global Price Database & Regional Analysis'
                    )}
                  </p>
                </div>
              </div>
              
              {progress.status !== 'Ready' && (
                <Badge variant={progress.isActive ? "default" : "secondary"}>
                  {progress.status}
                </Badge>
              )}

              {/* Special Offers Notifications */}
              {(specialOffers.freeGames.length > 0 || specialOffers.bigDiscounts.length > 0) && (
                <div className="flex items-center gap-2">
                  {specialOffers.freeGames.length > 0 && (
                    <Badge variant="secondary" className="animate-pulse">
                      🎉 {specialOffers.freeGames.length} Free Games!
                    </Badge>
                  )}
                  {specialOffers.bigDiscounts.length > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      🔥 {specialOffers.bigDiscounts.length} Big Discounts!
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <Button variant="outline" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {notifications.length}
                  </Badge>
                </div>
              )}

              {selectedGames.size > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleExportSelected}>
                    Export Selected ({selectedGames.size})
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllGames}>
                    Clear Selection
                  </Button>
                </>
              )}
              
              <Button variant="outline" size="sm" onClick={handleExportAll}>
                Export All ({games.length})
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowAdvancedSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => openExternalLink('https://github.com/your-repo/xbox-scraper')}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>

              {isElectron && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    if (window.electronAPI) {
                      window.electronAPI.showMessageBox({
                        type: 'info',
                        title: 'Keyboard Shortcuts',
                        message: 'Available Shortcuts',
                        detail: 'F5 - Start Scraping\nF6 - Pause/Resume\nF7 - Stop\nCtrl+N - New Scraping\nCtrl+E - Export CSV\nCtrl+F - Search\nCtrl+R - Regional Explorer\nCtrl+A - Select All\nCtrl+, - Settings'
                      });
                    }
                  }}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Toast */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-card border rounded-lg p-3 shadow-lg animate-in slide-in-from-right max-w-sm"
            >
              <p className="text-sm">{notification}</p>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Settings Dialog */}
      {showAdvancedSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <AdvancedSettings />
            <Button 
              onClick={() => setShowAdvancedSettings(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Scraping Controls */}
          <ScrapingControls
            progress={progress}
            onStartScraping={startScraping}
            onPauseScraping={pauseScraping}
            onStopScraping={stopScraping}
            onExportCSV={handleExportAll}
          />

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-11">
              <TabsTrigger value="games">
                <Database className="mr-2 h-4 w-4" />
                Games ({filteredGames.length})
              </TabsTrigger>
              <TabsTrigger value="regional">
                <Globe className="mr-2 h-4 w-4" />
                Regional DB
              </TabsTrigger>
              <TabsTrigger value="bulk">
                <Package className="mr-2 h-4 w-4" />
                Bulk Upload
              </TabsTrigger>
              <TabsTrigger value="viewer">
                <Search className="mr-2 h-4 w-4" />
                Product Viewer
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="history">
                <TrendingUp className="mr-2 h-4 w-4" />
                Price History
              </TabsTrigger>
              <TabsTrigger value="gameflip">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Gameflip
              </TabsTrigger>
              <TabsTrigger value="kofi">
                <Coffee className="mr-2 h-4 w-4" />
                Ko-fi
              </TabsTrigger>
              <TabsTrigger value="social">
                <Share2 className="mr-2 h-4 w-4" />
                Social Media
              </TabsTrigger>
              <TabsTrigger value="sheets">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Google Sheets
              </TabsTrigger>
              <TabsTrigger value="filters">
                Filters & Search
              </TabsTrigger>
            </TabsList>

            {/* Games Tab */}
            <TabsContent value="games" className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-1">
                  <GameFilters
                    onFiltersChange={setFilters}
                    totalGames={games.length}
                    filteredCount={filteredGames.length}
                  />
                </div>
                <div className="xl:col-span-3">
                  <GameTable
                    games={filteredGames}
                    selectedGames={selectedGames}
                    onToggleSelection={toggleGameSelection}
                    onSelectAll={selectAllGames}
                    onDeselectAll={deselectAllGames}
                    filters={filters}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Regional Price Explorer Tab */}
            <TabsContent value="regional">
              <RegionalPriceExplorer />
            </TabsContent>

            {/* Bulk Upload Manager Tab */}
            <TabsContent value="bulk">
              <BulkUploadManager />
            </TabsContent>

            {/* Xbox Product Viewer Tab */}
            <TabsContent value="viewer">
              <XboxProductViewer />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <StatsCharts games={games} regionStats={regionStats} />
            </TabsContent>

            {/* Price History Tab */}
            <TabsContent value="history">
              <PriceHistoryChart games={games} priceHistory={priceHistory} />
            </TabsContent>

            {/* Gameflip Integration Tab */}
            <TabsContent value="gameflip">
              <GameflipIntegration />
            </TabsContent>

            {/* Ko-fi Integration Tab */}
            <TabsContent value="kofi">
              <KofiIntegration />
            </TabsContent>

            {/* Social Media Tab */}
            <TabsContent value="social">
              <SocialMediaIntegration selectedGames={selectedGameObjects} />
            </TabsContent>

            {/* Google Sheets Tab */}
            <TabsContent value="sheets">
              <GoogleSheetsIntegration
                onDataLoaded={handleDataLoaded}
                selectedGames={selectedGameObjects}
                onExportComplete={handleExportComplete}
              />
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters">
              <div className="max-w-2xl mx-auto">
                <GameFilters
                  onFiltersChange={setFilters}
                  totalGames={games.length}
                  filteredCount={filteredGames.length}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold mb-2">XboxNow Professional Scraper</h3>
              <p className="text-sm text-muted-foreground">
                {isElectron ? 'Desktop Application' : 'Advanced Web Edition'} with comprehensive Xbox API integration, 
                global regional price database (200+ markets), bulk upload manager, Gameflip uploader, Ko-fi integration, 
                Google Sheets, and social media sharing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Current Session</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Total Games: {games.length}</div>
                <div>Selected: {selectedGames.size}</div>
                <div>Regions: {regionStats.length}</div>
                <div>Free Games: {specialOffers.freeGames.length}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Regional Database Features</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• 200+ Global Markets</div>
                <div>• Real-time Price Comparison</div>
                <div>• Arbitrage Analysis</div>
                <div>• Market Intelligence</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Quick Stats</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Big Discounts (80%+): {specialOffers.bigDiscounts.length}</div>
                <div>Active Deals: {specialOffers.newDeals.length}</div>
                <div>Price Points: {priceHistory.length}</div>
                <div>Status: {progress.status}</div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              © 2024 XboxNow Professional Scraper - {isElectron ? 'Desktop' : 'Web'} Edition with Global Regional Database
            </div>
            <div className="flex items-center gap-4">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <Badge variant="outline">v{appVersion}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openExternalLink('https://displaycatalog.mp.microsoft.com')}
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Xbox API
              </Button>
              {isElectron && (
                <Badge variant="secondary">
                  <Monitor className="mr-1 h-3 w-3" />
                  Desktop
                </Badge>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}