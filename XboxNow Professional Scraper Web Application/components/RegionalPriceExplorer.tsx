import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Globe, 
  DollarSign, 
  Percent, 
  BarChart3,
  Download,
  RefreshCw,
  ArrowUpDown,
  Filter,
  Star,
  Trophy,
  AlertTriangle,
  Info,
  ExternalLink,
  Flag
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useXboxAPI, XBOX_MARKETS } from '../hooks/useXboxAPI';
import { RegionalPriceData, RegionalPrice, MarketAnalysis, XboxMarket } from '../types/scraper';

interface SortConfig {
  key: keyof RegionalPrice | 'priceUSD';
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  regions: string[];
  maxPrice: number;
  minDiscount: number;
  currencies: string[];
  onSaleOnly: boolean;
  freeOnly: boolean;
}

const RegionalPriceExplorer: React.FC = () => {
  const [productId, setProductId] = useState('9NGBNVMFXPT6'); // Halo Infinite como ejemplo
  const [regionalData, setRegionalData] = useState<RegionalPriceData | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'priceUSD', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    regions: [],
    maxPrice: Infinity,
    minDiscount: 0,
    currencies: [],
    onSaleOnly: false,
    freeOnly: false
  });
  const [selectedMarkets, setSelectedMarkets] = useState<XboxMarket[]>(XBOX_MARKETS.filter(m => m.active));
  const [activeTab, setActiveTab] = useState('table');

  const { loading, error, progress, getRegionalPrices, analyzeMarket } = useXboxAPI();

  // Colores para gráficos
  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00'];

  // Buscar precios regionales
  const handleSearch = useCallback(async () => {
    if (!productId.trim()) return;
    
    const data = await getRegionalPrices(productId.trim(), selectedMarkets);
    if (data) {
      setRegionalData(data);
      const analysis = analyzeMarket(data);
      setMarketAnalysis(analysis);
    }
  }, [productId, selectedMarkets, getRegionalPrices, analyzeMarket]);

  // Filtrar y ordenar datos
  const filteredAndSortedData = useMemo(() => {
    if (!regionalData) return [];

    let filtered = regionalData.regions.filter(price => {
      const matchesRegion = filterConfig.regions.length === 0 || filterConfig.regions.includes(price.region);
      const matchesPrice = price.priceUSD <= filterConfig.maxPrice;
      const matchesDiscount = price.discount >= filterConfig.minDiscount;
      const matchesCurrency = filterConfig.currencies.length === 0 || filterConfig.currencies.includes(price.currency);
      const matchesOnSale = !filterConfig.onSaleOnly || price.isOnSale;
      const matchesFree = !filterConfig.freeOnly || price.isFree;

      return matchesRegion && matchesPrice && matchesDiscount && matchesCurrency && matchesOnSale && matchesFree;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key as keyof RegionalPrice];
      let bValue = b[sortConfig.key as keyof RegionalPrice];

      if (sortConfig.key === 'priceUSD') {
        aValue = a.priceUSD;
        bValue = b.priceUSD;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [regionalData, filterConfig, sortConfig]);

  // Preparar datos para gráficos
  const chartData = useMemo(() => {
    if (!filteredAndSortedData.length) return [];
    
    return filteredAndSortedData.slice(0, 20).map((price, index) => ({
      name: price.countryName,
      price: price.priceUSD,
      originalPrice: price.priceUSD / (1 - price.discount / 100),
      discount: price.discount,
      currency: price.currency,
      region: price.region
    }));
  }, [filteredAndSortedData]);

  // Datos para el gráfico circular de regiones
  const regionDistribution = useMemo(() => {
    if (!filteredAndSortedData.length) return [];
    
    const regionCounts = filteredAndSortedData.reduce((acc, price) => {
      acc[price.region] = (acc[price.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(regionCounts).map(([region, count]) => ({
      name: region,
      value: count
    }));
  }, [filteredAndSortedData]);

  // Manejar ordenamiento
  const handleSort = (key: keyof RegionalPrice | 'priceUSD') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Exportar datos
  const exportData = useCallback((format: 'csv' | 'json') => {
    if (!filteredAndSortedData.length) return;

    const dataToExport = filteredAndSortedData.map(price => ({
      Product: regionalData?.title || 'Unknown',
      ProductId: regionalData?.productId || '',
      Country: price.countryName,
      Region: price.region,
      Currency: price.currency,
      Price: price.price,
      PriceUSD: price.priceUSD,
      OriginalPrice: price.originalPrice,
      Discount: price.discount,
      IsFree: price.isFree,
      IsOnSale: price.isOnSale,
      DealUntil: price.dealUntil || '',
      LastUpdated: price.lastUpdated
    }));

    if (format === 'csv') {
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xbox-regional-prices-${productId}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xbox-regional-prices-${productId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [filteredAndSortedData, regionalData, productId]);

  // Buscar automáticamente al cargar
  useEffect(() => {
    if (productId) {
      handleSearch();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Price Explorer & Database
          </CardTitle>
          <CardDescription>
            Explore and compare Xbox game prices across 200+ regions worldwide with advanced analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter Xbox Product ID (e.g., 9NGBNVMFXPT6)"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Progress bar */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Fetching regional data...</span>
                <span>{progress.current}/{progress.total}</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
            </div>
          )}

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quick stats */}
          {regionalData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${regionalData.lowestPrice.priceUSD.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Lowest Price</div>
                <div className="text-xs text-muted-foreground">{regionalData.lowestPrice.countryName}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  ${regionalData.highestPrice.priceUSD.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Highest Price</div>
                <div className="text-xs text-muted-foreground">{regionalData.highestPrice.countryName}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  ${regionalData.averagePrice.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Average Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {regionalData.totalRegions}
                </div>
                <div className="text-sm text-muted-foreground">Regions Found</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main content tabs */}
      {regionalData && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="table">
                <BarChart3 className="h-4 w-4 mr-1" />
                Table
              </TabsTrigger>
              <TabsTrigger value="charts">
                <TrendingUp className="h-4 w-4 mr-1" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <Trophy className="h-4 w-4 mr-1" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="filters">
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('json')}>
                <Download className="h-4 w-4 mr-1" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Table View */}
          <TabsContent value="table" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Regional Price Comparison - {regionalData.title}</span>
                  <Badge variant="outline">{filteredAndSortedData.length} regions</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Rank</TableHead>
                        <TableHead>
                          <Button variant="ghost" onClick={() => handleSort('countryName')} className="h-auto p-0">
                            Country <ArrowUpDown className="ml-1 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" onClick={() => handleSort('region')} className="h-auto p-0">
                            Region <ArrowUpDown className="ml-1 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" onClick={() => handleSort('priceUSD')} className="h-auto p-0">
                            Price (USD) <ArrowUpDown className="ml-1 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" onClick={() => handleSort('price')} className="h-auto p-0">
                            Local Price <ArrowUpDown className="ml-1 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" onClick={() => handleSort('discount')} className="h-auto p-0">
                            Discount <ArrowUpDown className="ml-1 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Savings vs Avg</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedData.map((price, index) => {
                        const savings = regionalData.averagePrice - price.priceUSD;
                        const savingsPercent = (savings / regionalData.averagePrice) * 100;
                        
                        return (
                          <TableRow key={`${price.regionCode}-${price.countryName}`}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {index + 1}
                                {index === 0 && <Trophy className="h-3 w-3 text-yellow-500" />}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Flag className="h-3 w-3" />
                                <span className="font-medium">{price.countryName}</span>
                                <Badge variant="outline" className="text-xs">{price.regionCode}</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{price.region}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span className="font-mono">{price.priceUSD.toFixed(2)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono">
                                {price.price.toFixed(2)} {price.currency}
                              </span>
                            </TableCell>
                            <TableCell>
                              {price.discount > 0 ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <TrendingDown className="h-3 w-3" />
                                  {price.discount.toFixed(1)}%
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">No discount</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {price.isFree && <Badge variant="secondary">Free</Badge>}
                                {price.isOnSale && <Badge variant="outline">On Sale</Badge>}
                                {!price.isFree && !price.isOnSale && (
                                  <span className="text-muted-foreground text-sm">Regular</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`flex items-center gap-1 ${savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {savings > 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                <span className="font-mono">
                                  {savings > 0 ? '-' : '+'}${Math.abs(savings).toFixed(2)}
                                </span>
                                <span className="text-xs">({savingsPercent.toFixed(1)}%)</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts View */}
          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Price Comparison Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Comparison (Top 20 Regions)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]} />
                      <Bar dataKey="price" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Regional Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Markets by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={regionDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {regionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Price Trend Line Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Price Distribution Across Regions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]} />
                      <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="originalPrice" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis View */}
          <TabsContent value="analysis" className="space-y-4">
            {marketAnalysis && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Global Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Global Market Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Average Price</div>
                        <div className="text-xl font-bold">${marketAnalysis.globalStats.averagePrice}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Median Price</div>
                        <div className="text-xl font-bold">${marketAnalysis.globalStats.medianPrice}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Price Spread</div>
                        <div className="text-xl font-bold">${marketAnalysis.globalStats.priceSpread}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Price Variance</div>
                        <div className="text-xl font-bold">{marketAnalysis.globalStats.coefficientOfVariation.toFixed(1)}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Best Value Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Best Value Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div>
                        <div className="font-medium">Best Overall Value</div>
                        <div className="text-sm text-muted-foreground">
                          {marketAnalysis.recommendations.bestValue.countryName}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        ${marketAnalysis.recommendations.bestValue.priceUSD.toFixed(2)}
                      </div>
                    </div>

                    {marketAnalysis.recommendations.arbitrageOpportunities.length > 0 && (
                      <div>
                        <div className="font-medium mb-2">Top Arbitrage Opportunities</div>
                        <div className="space-y-2">
                          {marketAnalysis.recommendations.arbitrageOpportunities.slice(0, 3).map((opp, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="text-sm">
                                <span className="text-green-600">{opp.buy.countryName}</span>
                                {' → '}
                                <span className="text-red-600">{opp.sell.countryName}</span>
                              </div>
                              <div className="font-bold text-green-600">
                                +${opp.profit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Price Categories */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Price Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Object.entries(marketAnalysis.priceCategories).map(([category, prices]) => (
                        <div key={category} className="text-center">
                          <div className="text-2xl font-bold">{prices.length}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Discount Analysis */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Discount Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{marketAnalysis.discountAnalysis.bestDiscounts.length}</div>
                        <div className="text-sm text-muted-foreground">Markets with Discounts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{marketAnalysis.discountAnalysis.averageDiscount.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Average Discount</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{marketAnalysis.discountAnalysis.noDiscounts.length}</div>
                        <div className="text-sm text-muted-foreground">Regular Price Markets</div>
                      </div>
                    </div>

                    {marketAnalysis.discountAnalysis.bestDiscounts.length > 0 && (
                      <div>
                        <div className="font-medium mb-2">Best Discounts</div>
                        <div className="space-y-2">
                          {marketAnalysis.discountAnalysis.bestDiscounts.slice(0, 5).map((discount, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="font-medium">{discount.countryName}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  ${discount.priceUSD.toFixed(2)}
                                </span>
                              </div>
                              <Badge variant="destructive">{discount.discount.toFixed(1)}% OFF</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Filters View */}
          <TabsContent value="filters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Filters</CardTitle>
                <CardDescription>
                  Customize the data view to focus on specific regions, price ranges, or market conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Region Filter */}
                  <div>
                    <label className="text-sm font-medium">Regions</label>
                    <div className="space-y-2 mt-1">
                      {['Americas', 'Europe', 'Asia Pacific', 'Middle East & Africa'].map(region => (
                        <label key={region} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filterConfig.regions.includes(region)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilterConfig(prev => ({
                                  ...prev,
                                  regions: [...prev.regions, region]
                                }));
                              } else {
                                setFilterConfig(prev => ({
                                  ...prev,
                                  regions: prev.regions.filter(r => r !== region)
                                }));
                              }
                            }}
                          />
                          <span className="text-sm">{region}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium">Max Price (USD)</label>
                    <Input
                      type="number"
                      value={filterConfig.maxPrice === Infinity ? '' : filterConfig.maxPrice}
                      onChange={(e) => setFilterConfig(prev => ({
                        ...prev,
                        maxPrice: e.target.value ? parseFloat(e.target.value) : Infinity
                      }))}
                      placeholder="No limit"
                    />
                  </div>

                  {/* Minimum Discount */}
                  <div>
                    <label className="text-sm font-medium">Min Discount (%)</label>
                    <Input
                      type="number"
                      value={filterConfig.minDiscount}
                      onChange={(e) => setFilterConfig(prev => ({
                        ...prev,
                        minDiscount: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0"
                    />
                  </div>

                  {/* Currency Filter */}
                  <div>
                    <label className="text-sm font-medium">Currencies</label>
                    <div className="space-y-2 mt-1">
                      {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map(currency => (
                        <label key={currency} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filterConfig.currencies.includes(currency)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilterConfig(prev => ({
                                  ...prev,
                                  currencies: [...prev.currencies, currency]
                                }));
                              } else {
                                setFilterConfig(prev => ({
                                  ...prev,
                                  currencies: prev.currencies.filter(c => c !== currency)
                                }));
                              }
                            }}
                          />
                          <span className="text-sm">{currency}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Special Filters */}
                  <div>
                    <label className="text-sm font-medium">Special Filters</label>
                    <div className="space-y-2 mt-1">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filterConfig.onSaleOnly}
                          onChange={(e) => setFilterConfig(prev => ({
                            ...prev,
                            onSaleOnly: e.target.checked
                          }))}
                        />
                        <span className="text-sm">On Sale Only</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filterConfig.freeOnly}
                          onChange={(e) => setFilterConfig(prev => ({
                            ...prev,
                            freeOnly: e.target.checked
                          }))}
                        />
                        <span className="text-sm">Free Games Only</span>
                      </label>
                    </div>
                  </div>

                  {/* Reset Filters */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => setFilterConfig({
                        regions: [],
                        maxPrice: Infinity,
                        minDiscount: 0,
                        currencies: [],
                        onSaleOnly: false,
                        freeOnly: false
                      })}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RegionalPriceExplorer;