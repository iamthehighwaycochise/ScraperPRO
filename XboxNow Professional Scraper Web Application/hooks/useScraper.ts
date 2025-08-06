import { useState, useCallback, useEffect, useRef } from 'react';
import { Game, RegionStats, PriceHistory, ScrapingProgress, ScrapingConfig } from '../types/scraper';
import { mockGames, mockRegionStats, mockPriceHistory, generateMockGame } from '../mocks/scraper';
import { randomInt, randomBool, mockEnabled } from '../mocks/random';

export function useScraper() {
  const [games, setGames] = useState<Game[]>(mockEnabled ? mockGames : []);
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [regionStats, setRegionStats] = useState<RegionStats[]>(mockEnabled ? mockRegionStats : []);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>(mockEnabled ? mockPriceHistory : []);
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
        const gamesPerPage = mockEnabled ? randomInt(5, 25) : 0;
        processedGames += gamesPerPage;

        setProgress(prev => ({
          ...prev,
          currentPage: page,
          processedGames,
          estimatedTimeRemaining: ((totalPages - processedPages) * 2000) // 2 seconds per page estimate
        }));

        // Simulate finding new games
        if (mockEnabled && randomBool(0.7)) {
          const newGame = generateMockGame(region, processedGames);
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