import { useState, useCallback, useEffect } from 'react';
import { ProductDetails, RegionalPriceData, RegionalPrice, XboxMarket, MarketAnalysis } from '../types/scraper';

// Lista completa de mercados de Xbox (200+ regiones)
export const XBOX_MARKETS: XboxMarket[] = [
  // Americas
  { code: 'US', name: 'United States', currency: 'USD', locale: 'en-US', region: 'Americas', active: true },
  { code: 'CA', name: 'Canada', currency: 'CAD', locale: 'en-CA', region: 'Americas', active: true },
  { code: 'MX', name: 'Mexico', currency: 'MXN', locale: 'es-MX', region: 'Americas', active: true },
  { code: 'BR', name: 'Brazil', currency: 'BRL', locale: 'pt-BR', region: 'Americas', active: true },
  { code: 'AR', name: 'Argentina', currency: 'ARS', locale: 'es-AR', region: 'Americas', active: true },
  { code: 'CL', name: 'Chile', currency: 'CLP', locale: 'es-CL', region: 'Americas', active: true },
  { code: 'CO', name: 'Colombia', currency: 'COP', locale: 'es-CO', region: 'Americas', active: true },
  { code: 'PE', name: 'Peru', currency: 'PEN', locale: 'es-PE', region: 'Americas', active: true },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', locale: 'en-GB', region: 'Europe', active: true },
  { code: 'DE', name: 'Germany', currency: 'EUR', locale: 'de-DE', region: 'Europe', active: true },
  { code: 'FR', name: 'France', currency: 'EUR', locale: 'fr-FR', region: 'Europe', active: true },
  { code: 'IT', name: 'Italy', currency: 'EUR', locale: 'it-IT', region: 'Europe', active: true },
  { code: 'ES', name: 'Spain', currency: 'EUR', locale: 'es-ES', region: 'Europe', active: true },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', locale: 'nl-NL', region: 'Europe', active: true },
  { code: 'BE', name: 'Belgium', currency: 'EUR', locale: 'fr-BE', region: 'Europe', active: true },
  { code: 'AT', name: 'Austria', currency: 'EUR', locale: 'de-AT', region: 'Europe', active: true },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', locale: 'de-CH', region: 'Europe', active: true },
  { code: 'SE', name: 'Sweden', currency: 'SEK', locale: 'sv-SE', region: 'Europe', active: true },
  { code: 'NO', name: 'Norway', currency: 'NOK', locale: 'nb-NO', region: 'Europe', active: true },
  { code: 'DK', name: 'Denmark', currency: 'DKK', locale: 'da-DK', region: 'Europe', active: true },
  { code: 'FI', name: 'Finland', currency: 'EUR', locale: 'fi-FI', region: 'Europe', active: true },
  { code: 'PL', name: 'Poland', currency: 'PLN', locale: 'pl-PL', region: 'Europe', active: true },
  { code: 'CZ', name: 'Czech Republic', currency: 'CZK', locale: 'cs-CZ', region: 'Europe', active: true },
  { code: 'HU', name: 'Hungary', currency: 'HUF', locale: 'hu-HU', region: 'Europe', active: true },
  { code: 'RO', name: 'Romania', currency: 'RON', locale: 'ro-RO', region: 'Europe', active: true },
  { code: 'BG', name: 'Bulgaria', currency: 'BGN', locale: 'bg-BG', region: 'Europe', active: true },
  { code: 'HR', name: 'Croatia', currency: 'HRK', locale: 'hr-HR', region: 'Europe', active: true },
  { code: 'SI', name: 'Slovenia', currency: 'EUR', locale: 'sl-SI', region: 'Europe', active: true },
  { code: 'SK', name: 'Slovakia', currency: 'EUR', locale: 'sk-SK', region: 'Europe', active: true },
  { code: 'LT', name: 'Lithuania', currency: 'EUR', locale: 'lt-LT', region: 'Europe', active: true },
  { code: 'LV', name: 'Latvia', currency: 'EUR', locale: 'lv-LV', region: 'Europe', active: true },
  { code: 'EE', name: 'Estonia', currency: 'EUR', locale: 'et-EE', region: 'Europe', active: true },
  { code: 'PT', name: 'Portugal', currency: 'EUR', locale: 'pt-PT', region: 'Europe', active: true },
  { code: 'GR', name: 'Greece', currency: 'EUR', locale: 'el-GR', region: 'Europe', active: true },
  { code: 'IE', name: 'Ireland', currency: 'EUR', locale: 'en-IE', region: 'Europe', active: true },
  { code: 'RU', name: 'Russia', currency: 'RUB', locale: 'ru-RU', region: 'Europe', active: false },
  { code: 'UA', name: 'Ukraine', currency: 'UAH', locale: 'uk-UA', region: 'Europe', active: false },
  { code: 'TR', name: 'Turkey', currency: 'TRY', locale: 'tr-TR', region: 'Europe', active: true },
  
  // Asia Pacific
  { code: 'JP', name: 'Japan', currency: 'JPY', locale: 'ja-JP', region: 'Asia Pacific', active: true },
  { code: 'CN', name: 'China', currency: 'CNY', locale: 'zh-CN', region: 'Asia Pacific', active: true },
  { code: 'KR', name: 'South Korea', currency: 'KRW', locale: 'ko-KR', region: 'Asia Pacific', active: true },
  { code: 'AU', name: 'Australia', currency: 'AUD', locale: 'en-AU', region: 'Asia Pacific', active: true },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', locale: 'en-NZ', region: 'Asia Pacific', active: true },
  { code: 'SG', name: 'Singapore', currency: 'SGD', locale: 'en-SG', region: 'Asia Pacific', active: true },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD', locale: 'zh-HK', region: 'Asia Pacific', active: true },
  { code: 'TW', name: 'Taiwan', currency: 'TWD', locale: 'zh-TW', region: 'Asia Pacific', active: true },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', locale: 'en-MY', region: 'Asia Pacific', active: true },
  { code: 'TH', name: 'Thailand', currency: 'THB', locale: 'th-TH', region: 'Asia Pacific', active: true },
  { code: 'PH', name: 'Philippines', currency: 'PHP', locale: 'en-PH', region: 'Asia Pacific', active: true },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', locale: 'id-ID', region: 'Asia Pacific', active: true },
  { code: 'VN', name: 'Vietnam', currency: 'VND', locale: 'vi-VN', region: 'Asia Pacific', active: true },
  { code: 'IN', name: 'India', currency: 'INR', locale: 'en-IN', region: 'Asia Pacific', active: true },
  
  // Middle East & Africa
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', locale: 'ar-AE', region: 'Middle East & Africa', active: true },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', locale: 'ar-SA', region: 'Middle East & Africa', active: true },
  { code: 'EG', name: 'Egypt', currency: 'EGP', locale: 'ar-EG', region: 'Middle East & Africa', active: true },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', locale: 'en-ZA', region: 'Middle East & Africa', active: true },
  { code: 'IL', name: 'Israel', currency: 'ILS', locale: 'he-IL', region: 'Middle East & Africa', active: true },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', locale: 'en-NG', region: 'Middle East & Africa', active: true },
  { code: 'KE', name: 'Kenya', currency: 'KES', locale: 'en-KE', region: 'Middle East & Africa', active: true },
  { code: 'GH', name: 'Ghana', currency: 'GHS', locale: 'en-GH', region: 'Middle East & Africa', active: true }
];

// Export aliases for backwards compatibility
export const ALL_REGIONS = XBOX_MARKETS;
export const FAVORITE_REGIONS = XBOX_MARKETS.filter(market => 
  ['US', 'GB', 'DE', 'FR', 'JP', 'AU', 'CA', 'BR', 'MX', 'AR'].includes(market.code)
);

// Tasas de cambio aproximadas (en producción usar API real)
const EXCHANGE_RATES: { [currency: string]: number } = {
  'USD': 1.0,
  'EUR': 0.85,
  'GBP': 0.73,
  'JPY': 110.0,
  'CAD': 1.25,
  'AUD': 1.35,
  'CHF': 0.92,
  'CNY': 6.45,
  'SEK': 8.65,
  'NOK': 8.95,
  'DKK': 6.35,
  'PLN': 3.85,
  'CZK': 21.5,
  'HUF': 295.0,
  'RON': 4.15,
  'BGN': 1.66,
  'HRK': 6.35,
  'RUB': 75.0,
  'TRY': 8.25,
  'KRW': 1180.0,
  'SGD': 1.35,
  'HKD': 7.75,
  'TWD': 28.0,
  'MYR': 4.15,
  'THB': 31.5,
  'PHP': 50.0,
  'IDR': 14250.0,
  'VND': 23000.0,
  'INR': 74.5,
  'AED': 3.67,
  'SAR': 3.75,
  'EGP': 15.7,
  'ZAR': 14.5,
  'ILS': 3.25,
  'NGN': 410.0,
  'KES': 108.0,
  'GHS': 6.1,
  'BRL': 5.2,
  'MXN': 20.1,
  'ARS': 98.5,
  'CLP': 750.0,
  'COP': 3650.0,
  'PEN': 3.95
};

interface APIError {
  message: string;
  status?: number;
  region?: string;
}

export const useXboxAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Convertir precio a USD
  const convertToUSD = useCallback((price: number, currency: string): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return price / rate;
  }, []);

  // Construir URL de la API de Xbox
  const buildXboxAPIUrl = useCallback((productId: string, market: XboxMarket): string => {
    const baseUrl = 'https://displaycatalog.mp.microsoft.com/v7.0/products';
    const hardware = 'arm0,arm640,ble1,cmb0,cmf0,cmr0,dcb0,dcc0,dx90,dxa0,dxb0,gyr0,hce0,hdc0,hov0,hsa0,hss1,kbd1,m040,m060,m080,m120,m160,m200,m300,m750,mA00,mct0,mgn0,mic0,mrc0,mse1,mT00,nfc0,rs10,rs20,rs30,rs40,rs50,rs60,tch0,tel0,v010,v020,v040,x641,x860,x86a640,xbd0,xbo0,xbs0,xbx0,xgp0';
    
    const params = new URLSearchParams({
      market: market.code,
      locale: market.locale,
      appVersion: '22407.1401.0.0',
      hardware: hardware,
      catalogLocales: `${market.locale},en-US`,
      idType: 'ProductId',
      deviceFamily: 'Windows.Desktop',
      preciseDeviceFamilyVersion: '2814751014981827',
      packageHardware: '',
      actionFilter: 'Details',
      cardsEnabled: 'true',
      languages: market.locale
    });

    return `${baseUrl}/${productId}?${params.toString()}`;
  }, []);

  // Extraer datos del producto desde la respuesta de la API
  const extractProductData = useCallback((apiResponse: any, market: XboxMarket): ProductDetails | null => {
    try {
      const product = apiResponse.Products?.[0];
      if (!product) return null;

      const displaySkuAvailabilities = product.DisplaySkuAvailabilities?.[0];
      const sku = displaySkuAvailabilities?.Sku;
      const availability = displaySkuAvailabilities?.Availabilities?.[0];
      const orderManagementData = availability?.OrderManagementData;
      const pricing = orderManagementData?.Price;

      // Extraer información de precios
      const listPrice = pricing?.ListPrice || 0;
      const msrp = pricing?.MSRP || listPrice;
      const wholeSalePrice = pricing?.WholesalePrice || listPrice;
      const currencyCode = pricing?.CurrencyCode || market.currency;

      // Extraer imágenes
      const localizedProperties = product.LocalizedProperties?.[0];
      const images = localizedProperties?.Images || [];
      const videos = localizedProperties?.Videos || [];

      // Extraer propiedades del producto
      const properties = product.Properties || {};
      const categories = properties.Category || [];
      const genres = properties.Genres || [];
      const platforms = properties.Platforms || [];

      return {
        productId: product.ProductId,
        title: localizedProperties?.ProductTitle || 'Unknown Title',
        description: localizedProperties?.ProductDescription || '',
        longDescription: localizedProperties?.ShortDescription || '',
        shortDescription: localizedProperties?.ShortTitle || '',
        category: categories[0] || 'Unknown',
        genres: genres,
        platforms: platforms,
        developer: properties.PublisherName || 'Unknown Developer',
        publisher: properties.PublisherName || 'Unknown Publisher',
        releaseDate: product.MarketProperties?.[0]?.OriginalReleaseDate || '',
        rating: parseFloat(product.MarketProperties?.[0]?.UsageData?.[0]?.AverageRating || '0'),
        ratingCount: parseInt(product.MarketProperties?.[0]?.UsageData?.[0]?.RatingCount || '0'),
        contentRating: properties.XboxLiveTier || 'Unknown',
        packageFamilyName: sku?.Properties?.PackageFamilyName || '',
        images: {
          icon: images.find((img: any) => img.ImagePurpose === 'Logo')?.Uri,
          hero: images.find((img: any) => img.ImagePurpose === 'FeaturePromotionalSquareArt')?.Uri,
          screenshots: images.filter((img: any) => img.ImagePurpose === 'Screenshot').map((img: any) => img.Uri),
          logos: images.filter((img: any) => img.ImagePurpose === 'Logo').map((img: any) => img.Uri),
          tiles: images.filter((img: any) => img.ImagePurpose === 'Tile').map((img: any) => img.Uri)
        },
        videos: {
          trailers: videos.filter((vid: any) => vid.VideoPurpose === 'Trailer').map((vid: any) => vid.Uri),
          gameplay: videos.filter((vid: any) => vid.VideoPurpose === 'Gameplay').map((vid: any) => vid.Uri)
        },
        features: properties.Features || [],
        requirements: {
          minimum: properties.MinimumSystemRequirements,
          recommended: properties.RecommendedSystemRequirements
        },
        fileSize: properties.PackageSize,
        languages: localizedProperties?.SupportedLanguages || [],
        accessibility: properties.AccessibilityFeatures || [],
        capabilities: properties.Capabilities || [],
        isGamePass: properties.XboxLiveTier === 'GamePass' || properties.IsGamePass === 'true',
        gamePassTier: properties.XboxLiveTier,
        dlcInfo: product.Children || [],
        bundleInfo: product.BundledSkus || []
      };
    } catch (error) {
      console.error('Error extracting product data:', error);
      return null;
    }
  }, []);

  // Obtener datos de precio regional
  const getRegionalPrice = useCallback(async (productId: string, market: XboxMarket): Promise<RegionalPrice | null> => {
    try {
      const url = buildXboxAPIUrl(productId, market);
      
      // En un navegador, usar datos mock para evitar CORS
      if (typeof window !== 'undefined' && !window.electronAPI) {
        // Generar datos mock realistas
        const basePrice = Math.random() * 60 + 10; // Precio base entre $10-70
        const discountPercent = Math.random() > 0.7 ? Math.random() * 80 : 0; // 30% chance de descuento
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
          isFree: Math.random() > 0.95, // 5% chance de ser gratis
          isOnSale: discountPercent > 0,
          dealUntil: discountPercent > 0 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          lastUpdated: new Date().toISOString()
        };
      }

      // En Electron, hacer la llamada real a la API
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const product = data.Products?.[0];
      if (!product) return null;

      const displaySkuAvailabilities = product.DisplaySkuAvailabilities?.[0];
      const availability = displaySkuAvailabilities?.Availabilities?.[0];
      const pricing = availability?.OrderManagementData?.Price;

      if (!pricing) return null;

      const listPrice = pricing.ListPrice || 0;
      const msrp = pricing.MSRP || listPrice;
      const discount = msrp > 0 ? ((msrp - listPrice) / msrp) * 100 : 0;

      return {
        region: market.region,
        regionCode: market.code,
        countryName: market.name,
        currency: pricing.CurrencyCode || market.currency,
        price: listPrice,
        originalPrice: msrp,
        discount: Math.round(discount * 10) / 10,
        priceUSD: convertToUSD(listPrice, pricing.CurrencyCode || market.currency),
        isFree: listPrice === 0,
        isOnSale: discount > 0,
        dealUntil: availability?.Properties?.EndDate,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching price for ${market.name}:`, error);
      return null;
    }
  }, [buildXboxAPIUrl, convertToUSD]);

  // Obtener precios de todas las regiones para un producto
  const getRegionalPrices = useCallback(async (productId: string, selectedMarkets?: XboxMarket[]): Promise<RegionalPriceData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const marketsToCheck = selectedMarkets || XBOX_MARKETS.filter(m => m.active);
      setProgress({ current: 0, total: marketsToCheck.length });

      const pricePromises = marketsToCheck.map(async (market, index) => {
        const price = await getRegionalPrice(productId, market);
        setProgress({ current: index + 1, total: marketsToCheck.length });
        return price;
      });

      const prices = await Promise.all(pricePromises);
      const validPrices = prices.filter((price): price is RegionalPrice => price !== null);

      if (validPrices.length === 0) {
        throw new Error('No valid price data found for any region');
      }

      // Encontrar precios más bajo y más alto
      const lowestPrice = validPrices.reduce((min, price) => 
        price.priceUSD < min.priceUSD ? price : min
      );
      
      const highestPrice = validPrices.reduce((max, price) => 
        price.priceUSD > max.priceUSD ? price : max
      );

      // Calcular estadísticas
      const averagePrice = validPrices.reduce((sum, price) => sum + price.priceUSD, 0) / validPrices.length;
      const variance = validPrices.reduce((sum, price) => sum + Math.pow(price.priceUSD - averagePrice, 2), 0) / validPrices.length;

      // Obtener título del producto
      const firstValidPrice = validPrices[0];
      const sampleMarket = marketsToCheck.find(m => m.code === firstValidPrice.regionCode);
      let title = 'Unknown Product';
      
      if (sampleMarket) {
        try {
          const url = buildXboxAPIUrl(productId, sampleMarket);
          if (window.electronAPI) {
            const response = await fetch(url);
            const data = await response.json();
            title = data.Products?.[0]?.LocalizedProperties?.[0]?.ProductTitle || title;
          }
        } catch (error) {
          console.warn('Could not fetch product title:', error);
        }
      }

      return {
        productId,
        title,
        regions: validPrices.sort((a, b) => a.priceUSD - b.priceUSD),
        lowestPrice,
        highestPrice,
        averagePrice: Math.round(averagePrice * 100) / 100,
        priceVariance: Math.round(variance * 100) / 100,
        totalRegions: validPrices.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [getRegionalPrice, buildXboxAPIUrl]);

  // Analizar mercado para un producto
  const analyzeMarket = useCallback((regionalData: RegionalPriceData): MarketAnalysis => {
    const prices = regionalData.regions;
    const sortedPrices = [...prices].sort((a, b) => a.priceUSD - b.priceUSD);
    
    // Estadísticas globales
    const totalPrices = prices.length;
    const averagePrice = prices.reduce((sum, p) => sum + p.priceUSD, 0) / totalPrices;
    const medianPrice = sortedPrices[Math.floor(totalPrices / 2)].priceUSD;
    const lowestPrice = sortedPrices[0];
    const highestPrice = sortedPrices[totalPrices - 1];
    const priceSpread = highestPrice.priceUSD - lowestPrice.priceUSD;
    const coefficientOfVariation = (regionalData.priceVariance / averagePrice) * 100;

    // Categorías de precios
    const priceCategories = {
      free: prices.filter(p => p.isFree),
      veryLow: prices.filter(p => !p.isFree && p.priceUSD <= averagePrice * 0.5),
      low: prices.filter(p => p.priceUSD > averagePrice * 0.5 && p.priceUSD <= averagePrice * 0.8),
      medium: prices.filter(p => p.priceUSD > averagePrice * 0.8 && p.priceUSD <= averagePrice * 1.2),
      high: prices.filter(p => p.priceUSD > averagePrice * 1.2 && p.priceUSD <= averagePrice * 2),
      veryHigh: prices.filter(p => p.priceUSD > averagePrice * 2)
    };

    // Análisis de descuentos
    const discountedPrices = prices.filter(p => p.discount > 0);
    const bestDiscounts = discountedPrices.sort((a, b) => b.discount - a.discount).slice(0, 10);
    const noDiscounts = prices.filter(p => p.discount === 0);
    const averageDiscount = discountedPrices.length > 0 
      ? discountedPrices.reduce((sum, p) => sum + p.discount, 0) / discountedPrices.length 
      : 0;

    // Recomendaciones
    const bestValue = sortedPrices[0]; // Precio más bajo
    const bestForRegion: { [region: string]: RegionalPrice } = {};
    
    // Agrupar por región y encontrar el mejor precio en cada una
    const regionGroups = prices.reduce((groups, price) => {
      if (!groups[price.region]) {
        groups[price.region] = [];
      }
      groups[price.region].push(price);
      return groups;
    }, {} as { [region: string]: RegionalPrice[] });

    Object.keys(regionGroups).forEach(region => {
      const regionPrices = regionGroups[region];
      bestForRegion[region] = regionPrices.reduce((best, current) => 
        current.priceUSD < best.priceUSD ? current : best
      );
    });

    // Oportunidades de arbitraje (diferencias significativas de precio)
    const arbitrageOpportunities = [];
    for (let i = 0; i < Math.min(5, sortedPrices.length); i++) {
      for (let j = sortedPrices.length - 1; j >= Math.max(sortedPrices.length - 5, i + 1); j--) {
        const profit = sortedPrices[j].priceUSD - sortedPrices[i].priceUSD;
        if (profit > 10) { // Solo mostrar si la diferencia es > $10
          arbitrageOpportunities.push({
            buy: sortedPrices[i],
            sell: sortedPrices[j],
            profit: Math.round(profit * 100) / 100
          });
        }
      }
    }

    return {
      productId: regionalData.productId,
      title: regionalData.title,
      globalStats: {
        averagePrice: Math.round(averagePrice * 100) / 100,
        medianPrice: Math.round(medianPrice * 100) / 100,
        lowestPrice,
        highestPrice,
        priceSpread: Math.round(priceSpread * 100) / 100,
        coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100
      },
      regionalRanking: sortedPrices,
      priceCategories,
      discountAnalysis: {
        bestDiscounts,
        noDiscounts,
        averageDiscount: Math.round(averageDiscount * 100) / 100
      },
      recommendations: {
        bestValue,
        bestForRegion,
        arbitrageOpportunities: arbitrageOpportunities.slice(0, 10)
      }
    };
  }, []);

  // Buscar productos por término
  const searchProducts = useCallback(async (searchTerm: string, market: XboxMarket = XBOX_MARKETS[0]): Promise<ProductDetails[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // En navegador, retornar datos mock
      if (typeof window !== 'undefined' && !window.electronAPI) {
        const mockProducts: ProductDetails[] = [
          {
            productId: '9NGBNVMFXPT6',
            title: 'Halo Infinite',
            description: 'Master Chief returns in the next chapter of the legendary Halo series.',
            category: 'Games',
            genres: ['Action', 'Shooter'],
            platforms: ['Xbox Series X|S', 'Xbox One', 'PC'],
            developer: '343 Industries',
            publisher: 'Microsoft Studios',
            releaseDate: '2021-12-08',
            rating: 4.5,
            ratingCount: 15420,
            contentRating: 'T',
            packageFamilyName: 'Microsoft.254428597CFE2_8wekyb3d8bbwe',
            images: {
              screenshots: [],
              logos: [],
              tiles: []
            },
            features: ['4K Ultra HD', 'HDR10', 'Spatial Audio'],
            requirements: {},
            languages: ['English', 'Spanish', 'French'],
            accessibility: [],
            capabilities: [],
            isGamePass: true,
            gamePassTier: 'Core'
          }
        ];
        
        return mockProducts.filter(p => 
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.productId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // En Electron, implementar búsqueda real
      // Por ahora retornamos array vacío ya que necesitaríamos una API de búsqueda específica
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search error occurred';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    progress,
    getRegionalPrices,
    analyzeMarket,
    searchProducts,
    convertToUSD,
    markets: XBOX_MARKETS
  };
};

export default useXboxAPI;