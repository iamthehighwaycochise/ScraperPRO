import { randomFloat, randomBool } from './random';
import type { XboxMarket, RegionalPrice } from '../types/scraper';

export function generateMockRegionalPrice(
  market: XboxMarket,
  convertToUSD: (price: number, currency: string) => number
): RegionalPrice {
  const basePrice = randomFloat(10, 70);
  const discountPercent = randomBool(0.7) ? randomFloat(0, 80) : 0;
  const originalPrice = basePrice / (1 - discountPercent / 100);
  return {
    region: market.region,
    regionCode: market.code,
    countryName: market.name,
    currency: market.currency,
    price: parseFloat(basePrice.toFixed(2)),
    originalPrice: parseFloat(originalPrice.toFixed(2)),
    discount: parseFloat(discountPercent.toFixed(1)),
    priceUSD: convertToUSD(basePrice, market.currency),
    isFree: randomBool(0.95),
    isOnSale: discountPercent > 0,
    dealUntil: discountPercent > 0
      ? new Date(Date.now() + randomFloat(0, 30 * 24 * 60 * 60 * 1000)).toISOString()
      : undefined,
    lastUpdated: new Date().toISOString()
  };
}
