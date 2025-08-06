import { useState, useCallback, useEffect, useRef } from 'react';
import { Game, RegionStats, PriceHistory, ScrapingProgress, ScrapingConfig } from '../types/scraper';

// Mock data para desarrollo
const mockGames: Game[] = [
  {
    id: '1',
    title: 'Halo Infinite',
    productId: '9PP5G1F0C2B6',
    region: 'US',
    imageUrl: 'https://store-images.s-microsoft.com/image/apps.1692.13727851868390641.c9cc5f66-aff8-406c-8c45-8cd48d31bb8d.57f1c8c9-b2c7-416b-b2bb-e89551bb24c7',
    lowestPriceUsd: 0,
    originalPriceUsd: 59.99,
    discount: 100,
    currency: 'USD',
    dealUntil: '2024-12-31',
    releaseDate: '2021-12-08',
    developer: '343 Industries',
    publisher: 'Microsoft Studios',
    categories: ['Action', 'Shooter'],
    platforms: ['Xbox', 'PC'],
    description: 'Master Chief returns in Halo Infinite – the next chapter of the legendary franchise.',
    rating: 'T',
    url: 'https://www.xbox.com/games/halo-infinite',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Forza Horizon 5',
    productId: '9NKX70BBXVGZ',
    region: 'US',
    imageUrl: 'https://store-images.s-microsoft.com/image/apps.12467.13727851868390641.c9cc5f66-aff8-406c-8c45-8cd48d31bb8d.57f1c8c9-b2c7-416b-b2bb-e89551bb24c7',
    lowestPriceUsd: 29.99,
    originalPriceUsd: 59.99,
    discount: 50,
    currency: 'USD',
    dealUntil: '2024-01-15',
    releaseDate: '2021-11-09',
    developer: 'Playground Games',
    publisher: 'Microsoft Studios',
    categories: ['Racing', 'Sports'],
    platforms: ['Xbox', 'PC'],
    description: 'Your Ultimate Horizon Adventure awaits! Explore the vibrant and ever-evolving open world landscapes of Mexico.',
    rating: 'T',
    url: 'https://www.xbox.com/games/forza-horizon-5',
    lastUpdated: new Date().toISOString()
  }
];

const mockRegionStats: RegionStats[] = [
  {
    region: 'US',
    totalGames: 2456,
    averageDiscount: 35,
    totalValue: 125000,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  },
  {
    region: 'AR',
    totalGames: 1890,
    averageDiscount: 42,
    totalValue: 85000,
    currency: 'ARS',
    lastUpdated: new Date().toISOString()
  }
];

const mockPriceHistory: PriceHistory[] = [
  {
    productId: '9PP5G1F0C2B6',
    region: 'US',
    date: '2024-01-01',
    price: 59.99,
    discount: 0,
    currency: 'USD'
  },
  {
    productId: '9PP5G1F0C2B6',
    region: 'US',
    date: '2024-01-15',
    price: 29.99,
    discount: 50,
    currency: 'USD'
  }
];

export function useScraper() {
  const [games, setGames] = useState<Game[]>(mockGames);
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [regionStats, setRegionStats] = useState<RegionStats[]>(mockRegionStats);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>(mockPriceHistory);
  const [progress, setProgress] = useState<ScrapingProgress>({
    isActive: false,
    status: 'Ready',
    currentPage: 0,
    totalPages: 0,
    processedGames: 0,
    currentRegion: '',
    startTime: null,
    estimatedTimeRemaining: 0,
    errors: []
  });

  const scrapingWorkerRef = useRef<AbortController | null>(null);

  // Simulate scraping process
  const simulateScraping = useCallback(async (config: ScrapingConfig) => {
    const totalPages = (config.endPage - config.startPage + 1) * config.regions.length;
    let processedPages = 0;
    let processedGames = 0;

    setProgress(prev => ({
      ...prev,
      isActive: true,
      status: 'Scraping',
      totalPages,
      startTime: new Date()
    }));

    for (const region of config.regions) {
      if (scrapingWorkerRef.current?.signal.aborted) break;

      setProgress(prev => ({
        ...prev,
        currentRegion: region
      }));

      for (let page = config.startPage; page <= config.endPage; page++) {
        if (scrapingWorkerRef.current?.signal.aborted) break;

        processedPages++;
        const gamesPerPage = Math.floor(Math.random() * 20) + 5; // 5-25 games per page
        processedGames += gamesPerPage;

        setProgress(prev => ({
          ...prev,
          currentPage: page,
          processedGames,
          estimatedTimeRemaining: ((totalPages - processedPages) * 2000) // 2 seconds per page estimate
        }));

        // Simulate finding new games
        if (Math.random() > 0.7) { // 30% chance of finding new games
          const newGame: Game = {
            id: `game-${Date.now()}-${Math.random()}`,
            title: `Sample Game ${processedGames}`,
            productId: `9N${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            region,
            imageUrl: 'https://via.placeholder.com/300x400',
            lowestPriceUsd: Math.random() * 60,
            originalPriceUsd: Math.random() * 80 + 20,
            discount: Math.floor(Math.random() * 90),
            currency: region === 'US' ? 'USD' : 'EUR',
            dealUntil: Math.random() > 0.5 ? '2024-12-31' : '',
            releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            developer: 'Sample Developer',
            publisher: 'Sample Publisher',
            categories: ['Action', 'Adventure'],
            platforms: ['Xbox', 'PC'],
            description: 'A sample game description',
            rating: 'T',
            url: 'https://www.xbox.com/games/sample',
            lastUpdated: new Date().toISOString()
          };

          setGames(prev => [...prev, newGame]);
        }

        // Simulate page processing delay
        await new Promise(resolve => setTimeout(resolve, config.delay || 1000));
      }
    }

    setProgress(prev => ({
      ...prev,
      isActive: false,
      status: scrapingWorkerRef.current?.signal.aborted ? 'Paused' : 'Completed'
    }));
  }, []);

  const startScraping = useCallback(async (config: ScrapingConfig) => {
    scrapingWorkerRef.current = new AbortController();
    await simulateScraping(config);
  }, [simulateScraping]);

  const pauseScraping = useCallback(() => {
    scrapingWorkerRef.current?.abort();
    setProgress(prev => ({
      ...prev,
      isActive: false,
      status: 'Paused'
    }));
  }, []);

  const stopScraping = useCallback(() => {
    scrapingWorkerRef.current?.abort();
    setProgress(prev => ({
      ...prev,
      isActive: false,
      status: 'Stopped',
      currentPage: 0,
      processedGames: 0,
      currentRegion: '',
      startTime: null,
      estimatedTimeRemaining: 0
    }));
  }, []);

  const toggleGameSelection = useCallback((gameId: string) => {
    setSelectedGames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  }, []);

  const selectAllGames = useCallback(() => {
    setSelectedGames(new Set(games.map(game => game.id)));
  }, [games]);

  const deselectAllGames = useCallback(() => {
    setSelectedGames(new Set());
  }, []);

  const exportToCSV = useCallback((selectedOnly: boolean = false) => {
    const gamesToExport = selectedOnly 
      ? games.filter(game => selectedGames.has(game.id))
      : games;

    const csvContent = [
      // Header
      'Title,Product ID,Region,Price USD,Original Price USD,Discount %,Currency,Deal Until,Release Date,Developer,Publisher,Categories,Platforms,Rating,URL',
      // Data
      ...gamesToExport.map(game => [
        game.title,
        game.productId,
        game.region,
        game.lowestPriceUsd,
        game.originalPriceUsd,
        game.discount,
        game.currency,
        game.dealUntil,
        game.releaseDate,
        game.developer,
        game.publisher,
        game.categories.join(';'),
        game.platforms.join(';'),
        game.rating,
        game.url
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xbox-games-${selectedOnly ? 'selected' : 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [games, selectedGames]);

  // Update region stats when games change
  useEffect(() => {
    const stats = games.reduce((acc, game) => {
      const existing = acc.find(s => s.region === game.region);
      if (existing) {
        existing.totalGames++;
        existing.averageDiscount = (existing.averageDiscount + game.discount) / 2;
        existing.totalValue += game.lowestPriceUsd;
      } else {
        acc.push({
          region: game.region,
          totalGames: 1,
          averageDiscount: game.discount,
          totalValue: game.lowestPriceUsd,
          currency: game.currency,
          lastUpdated: new Date().toISOString()
        });
      }
      return acc;
    }, [] as RegionStats[]);

    setRegionStats(stats);
  }, [games]);

  return {
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
  };
}