export interface Game {
  id: string;
  productId: string;
  title: string;
  description?: string;
  category?: string;
  price: number;
  originalPrice: number;
  lowestPriceUsd: number;
  discount: number;
  currency: string;
  region: string;
  regionCode: string;
  countryName: string;
  store: string;
  dealUntil: string;
  url: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  screenshots?: string[];
  rating?: number;
  ratingCount?: number;
  contentRating?: string;
  genres?: string[];
  platforms?: string[];
  publisher?: string;
  developer?: string;
  releaseDate?: string;
  lastModified?: string;
  packageFamilyName?: string;
  isFree?: boolean;
  hasGamePass?: boolean;
  isOnSale?: boolean;
  isNew?: boolean;
  popularity?: number;
  tags?: string[];
}

export interface RegionalPriceData {
  productId: string;
  title: string;
  regions: RegionalPrice[];
  lowestPrice: RegionalPrice;
  highestPrice: RegionalPrice;
  averagePrice: number;
  priceVariance: number;
  totalRegions: number;
  lastUpdated: string;
}

export interface RegionalPrice {
  region: string;
  regionCode: string;
  countryName: string;
  currency: string;
  price: number;
  originalPrice: number;
  discount: number;
  priceUSD: number;
  isFree: boolean;
  isOnSale: boolean;
  dealUntil?: string;
  lastUpdated: string;
}

export interface XboxMarket {
  code: string;
  name: string;
  currency: string;
  locale: string;
  region: string;
  flag?: string;
  active: boolean;
}

export interface ProductDetails {
  productId: string;
  title: string;
  description?: string;
  longDescription?: string;
  shortDescription?: string;
  category: string;
  genres: string[];
  platforms: string[];
  developer: string;
  publisher: string;
  releaseDate: string;
  rating: number;
  ratingCount: number;
  contentRating: string;
  packageFamilyName: string;
  images: {
    icon?: string;
    hero?: string;
    screenshots: string[];
    logos: string[];
    tiles: string[];
  };
  videos?: {
    trailers: string[];
    gameplay: string[];
  };
  features: string[];
  requirements: {
    minimum?: any;
    recommended?: any;
  };
  fileSize?: number;
  languages: string[];
  accessibility: string[];
  capabilities: string[];
  isGamePass: boolean;
  gamePassTier?: string;
  dlcInfo?: any[];
  bundleInfo?: any[];
}

export interface FilterOptions {
  searchTerm: string;
  minDiscount: number;
  maxDiscount: number;
  maxPrice: number;
  freeOnly: boolean;
  selectedRegions: string[];
  hasDeals: boolean;
  categories?: string[];
  genres?: string[];
  platforms?: string[];
  contentRatings?: string[];
  sortBy?: 'price' | 'discount' | 'rating' | 'release' | 'title' | 'priceVariance';
  sortOrder?: 'asc' | 'desc';
  showGamePassOnly?: boolean;
  showNewOnly?: boolean;
}

export interface ScrapingProgress {
  isActive: boolean;
  status: string;
  currentPage: number;
  totalPages: number;
  processedGames: number;
  currentRegion: string;
  regionsCompleted: number;
  totalRegions: number;
  estimatedTimeRemaining: number;
  errors: string[];
}

export interface RegionStats {
  region: string;
  regionCode: string;
  countryName: string;
  totalGames: number;
  averagePrice: number;
  averageDiscount: number;
  freeGames: number;
  gamesOnSale: number;
  currency: string;
  lastUpdated: string;
  priceIndex: number; // Price index compared to US market
}

export interface PriceHistoryEntry {
  productId: string;
  region: string;
  price: number;
  discount: number;
  timestamp: string;
  priceUSD: number;
}

export interface MarketAnalysis {
  productId: string;
  title: string;
  globalStats: {
    averagePrice: number;
    medianPrice: number;
    lowestPrice: RegionalPrice;
    highestPrice: RegionalPrice;
    priceSpread: number;
    coefficientOfVariation: number;
  };
  regionalRanking: RegionalPrice[];
  priceCategories: {
    free: RegionalPrice[];
    veryLow: RegionalPrice[];
    low: RegionalPrice[];
    medium: RegionalPrice[];
    high: RegionalPrice[];
    veryHigh: RegionalPrice[];
  };
  discountAnalysis: {
    bestDiscounts: RegionalPrice[];
    noDiscounts: RegionalPrice[];
    averageDiscount: number;
  };
  recommendations: {
    bestValue: RegionalPrice;
    bestForRegion: { [region: string]: RegionalPrice };
    arbitrageOpportunities: {
      buy: RegionalPrice;
      sell: RegionalPrice;
      profit: number;
    }[];
  };
}

// Main regions for filtering and display
export const MAIN_REGIONS = [
  'US', 'CA', 'MX', 'BR', 'AR', // Americas
  'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'PL', // Europe
  'JP', 'CN', 'KR', 'AU', 'NZ', 'SG', 'HK', 'IN', // Asia Pacific
  'AE', 'SA', 'ZA', 'NG', 'EG', 'IL' // Middle East & Africa
] as const;

// Region names mapping
export const REGION_NAMES: Record<string, string> = {
  'US': 'United States',
  'CA': 'Canada',
  'MX': 'Mexico',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'SK': 'Slovakia',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'PT': 'Portugal',
  'GR': 'Greece',
  'IE': 'Ireland',
  'RU': 'Russia',
  'UA': 'Ukraine',
  'TR': 'Turkey',
  'JP': 'Japan',
  'CN': 'China',
  'KR': 'South Korea',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'SG': 'Singapore',
  'HK': 'Hong Kong',
  'TW': 'Taiwan',
  'MY': 'Malaysia',
  'TH': 'Thailand',
  'PH': 'Philippines',
  'ID': 'Indonesia',
  'VN': 'Vietnam',
  'IN': 'India',
  'AE': 'United Arab Emirates',
  'SA': 'Saudi Arabia',
  'EG': 'Egypt',
  'ZA': 'South Africa',
  'IL': 'Israel',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'GH': 'Ghana'
};

// Regional groupings
export const REGION_GROUPS = {
  'Americas': ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE'],
  'Europe': ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SI', 'SK', 'LT', 'LV', 'EE', 'PT', 'GR', 'IE', 'RU', 'UA', 'TR'],
  'Asia Pacific': ['JP', 'CN', 'KR', 'AU', 'NZ', 'SG', 'HK', 'TW', 'MY', 'TH', 'PH', 'ID', 'VN', 'IN'],
  'Middle East & Africa': ['AE', 'SA', 'EG', 'ZA', 'IL', 'NG', 'KE', 'GH']
} as const;

export type MainRegion = typeof MAIN_REGIONS[number];
export type RegionGroup = keyof typeof REGION_GROUPS;