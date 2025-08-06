import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Game, PriceHistory } from '../types/scraper';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

interface PriceHistoryChartProps {
  games: Game[];
  priceHistory: PriceHistory[];
}

export function PriceHistoryChart({ games, priceHistory }: PriceHistoryChartProps) {
  // Process price history data
  const chartData = priceHistory.reduce((acc, entry) => {
    const date = entry.date;
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.totalPrice += entry.price;
      existing.totalDiscount += entry.discount;
      existing.count += 1;
    } else {
      acc.push({
        date,
        totalPrice: entry.price,
        totalDiscount: entry.discount,
        count: 1
      });
    }
    
    return acc;
  }, [] as { date: string; totalPrice: number; totalDiscount: number; count: number }[]);

  // Calculate averages
  const processedData = chartData.map(item => ({
    date: item.date,
    avgPrice: item.totalPrice / item.count,
    avgDiscount: item.totalDiscount / item.count
  }));

  // Sort by date
  processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate trends
  const currentAvgPrice = processedData.length > 0 ? processedData[processedData.length - 1].avgPrice : 0;
  const previousAvgPrice = processedData.length > 1 ? processedData[processedData.length - 2].avgPrice : currentAvgPrice;
  const priceTrend = currentAvgPrice - previousAvgPrice;

  const currentAvgDiscount = processedData.length > 0 ? processedData[processedData.length - 1].avgDiscount : 0;
  const previousAvgDiscount = processedData.length > 1 ? processedData[processedData.length - 2].avgDiscount : currentAvgDiscount;
  const discountTrend = currentAvgDiscount - previousAvgDiscount;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">${currentAvgPrice.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Avg Price</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {priceTrend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <div>
                <div className="text-2xl font-bold">
                  {priceTrend >= 0 ? '+' : ''}${priceTrend.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Price Trend</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{currentAvgDiscount.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Avg Discount</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{priceHistory.length}</div>
                <div className="text-sm text-muted-foreground">Data Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price History Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {processedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis yAxisId="price" orientation="left" />
                <YAxis yAxisId="discount" orientation="right" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [
                    name === 'avgPrice' ? `$${value.toFixed(2)}` : `${value.toFixed(1)}%`,
                    name === 'avgPrice' ? 'Average Price' : 'Average Discount'
                  ]}
                />
                <Legend />
                <Line 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="avgPrice" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Average Price"
                />
                <Line 
                  yAxisId="discount"
                  type="monotone" 
                  dataKey="avgDiscount" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Average Discount"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>No price history data available</p>
                <p className="text-sm">Start scraping to build price history</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Price Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Price Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {games.slice(0, 10).map((game) => (
              <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{game.title}</div>
                  <div className="text-sm text-muted-foreground">{game.region}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${game.lowestPriceUsd.toFixed(2)}</div>
                  {game.discount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {game.discount}% off
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}