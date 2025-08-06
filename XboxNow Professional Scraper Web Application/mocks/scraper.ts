import { randomFloat, randomBool, randomInt } from './random';
import type { Game, RegionStats, PriceHistory } from '../types/scraper';

export const mockGames: Game[] = [
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

export const mockRegionStats: RegionStats[] = [
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

export const mockPriceHistory: PriceHistory[] = [
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

export function generateMockGame(region: string, index: number): Game {
  const id = `game-${Date.now()}-${randomInt(0, 100000)}`;
  return {
    id,
    title: `Sample Game ${index}`,
    productId: `9N${randomInt(0, 1e6).toString(36).toUpperCase()}`,
    region,
    imageUrl: 'https://via.placeholder.com/300x400',
    lowestPriceUsd: randomFloat(0, 60),
    originalPriceUsd: randomFloat(20, 100),
    discount: randomInt(0, 90),
    currency: region === 'US' ? 'USD' : 'EUR',
    dealUntil: randomBool(0.5) ? '2024-12-31' : '',
    releaseDate: new Date(Date.now() - randomFloat(0, 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    developer: 'Sample Developer',
    publisher: 'Sample Publisher',
    categories: ['Action', 'Adventure'],
    platforms: ['Xbox', 'PC'],
    description: 'A sample game description',
    rating: 'T',
    url: 'https://www.xbox.com/games/sample',
    lastUpdated: new Date().toISOString()
  };
}
