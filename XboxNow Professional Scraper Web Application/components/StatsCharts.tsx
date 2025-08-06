import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Game, RegionStats } from '../types/scraper';
import { TrendingUp, Globe, DollarSign, Percent } from 'lucide-react';

interface StatsChartsProps {
  games: Game[];
  regionStats: RegionStats[];
}

export function StatsCharts({ games, regionStats }: StatsChartsProps) {
  // Process data for charts
  const discountData = games.reduce((acc, game) => {
    const range = game.discount >= 80 ? '80-100%' :
                 game.discount >= 60 ? '60-80%' :
                 game.discount >= 40 ? '40-60%' :
                 game.discount >= 20 ? '20-40%' :
                 game.discount > 0 ? '1-20%' : '0%';
    
    const existing = acc.find(item => item.range === range);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ range, count: 1 });
    }
    return acc;
  }, [] as { range: string; count: number }[]);

  const priceData = games.reduce((acc, game) => {
    const range = game.lowestPriceUsd === 0 ? 'Free' :
                 game.lowestPriceUsd <= 10 ? '$0-10' :
                 game.lowestPriceUsd <= 25 ? '$10-25' :
                 game.lowestPriceUsd <= 50 ? '$25-50' : '$50+';
    
    const existing = acc.find(item => item.range === range);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ range, count: 1 });
    }
    return acc;
  }, [] as { range: string; count: number }[]);

  const regionData = regionStats.map(stat => ({
    region: stat.region,
    games: stat.totalGames,
    avgDiscount: stat.averageDiscount,
    totalValue: stat.totalValue
  }));

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{games.length}</div>
                <div className="text-sm text-muted-foreground">Total Games</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{regionStats.length}</div>
                <div className="text-sm text-muted-foreground">Regions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{games.filter(g => g.lowestPriceUsd === 0).length}</div>
                <div className="text-sm text-muted-foreground">Free Games</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {games.length > 0 ? Math.round(games.reduce((sum, g) => sum + g.discount, 0) / games.length) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Discount</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discount Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={discountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Price Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {priceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Regional Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="games" fill="#8884d8" name="Total Games" />
                <Bar dataKey="avgDiscount" fill="#82ca9d" name="Avg Discount %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}