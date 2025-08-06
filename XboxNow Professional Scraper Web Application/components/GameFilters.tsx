import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Slider } from './ui/slider';
import { Filter, X, Search, DollarSign, Percent, Globe, Gift } from 'lucide-react';
import { FilterOptions, MAIN_REGIONS, REGION_NAMES } from '../types/scraper';

interface GameFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  totalGames: number;
  filteredCount: number;
}

export function GameFilters({ onFiltersChange, totalGames, filteredCount }: GameFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minDiscount, setMinDiscount] = useState([0]);
  const [maxDiscount, setMaxDiscount] = useState([100]);
  const [maxPrice, setMaxPrice] = useState([1000]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [hasDeals, setHasDeals] = useState(false);

  const updateFilters = useCallback(() => {
    const filters: FilterOptions = {
      searchTerm,
      minDiscount: minDiscount[0],
      maxDiscount: maxDiscount[0],
      maxPrice: maxPrice[0] === 1000 ? Infinity : maxPrice[0],
      freeOnly,
      selectedRegions,
      hasDeals
    };
    onFiltersChange(filters);
  }, [searchTerm, minDiscount, maxDiscount, maxPrice, freeOnly, selectedRegions, hasDeals, onFiltersChange]);

  // Update filters whenever any filter changes
  useEffect(() => {
    updateFilters();
  }, [updateFilters]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleMinDiscountChange = (value: number[]) => {
    setMinDiscount(value);
  };

  const handleMaxDiscountChange = (value: number[]) => {
    setMaxDiscount(value);
  };

  const handleMaxPriceChange = (value: number[]) => {
    setMaxPrice(value);
  };

  const handleFreeOnlyChange = (checked: boolean) => {
    setFreeOnly(checked);
  };

  const handleHasDealsChange = (checked: boolean) => {
    setHasDeals(checked);
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => {
      return prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region];
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setMinDiscount([0]);
    setMaxDiscount([100]);
    setMaxPrice([1000]);
    setFreeOnly(false);
    setSelectedRegions([]);
    setHasDeals(false);
  };

  const clearRegions = () => {
    setSelectedRegions([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Results Summary */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <span className="font-medium">{filteredCount.toLocaleString()}</span> of{' '}
            <span className="font-medium">{totalGames.toLocaleString()}</span> games
          </div>
          <Badge variant="secondary">
            {totalGames > 0 ? Math.round((filteredCount / totalGames) * 100) : 0}% visible
          </Badge>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Games
          </Label>
          <Input
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title, Product ID, or region..."
            className="w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearchChange('')}
              className="w-full"
            >
              Clear search
            </Button>
          )}
        </div>

        <Separator />

        {/* Discount Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Discount Range
          </Label>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Minimum: {minDiscount[0]}%</span>
                <span>Maximum: {maxDiscount[0]}%</span>
              </div>
              <Slider
                value={minDiscount}
                onValueChange={handleMinDiscountChange}
                max={100}
                step={5}
                className="w-full"
              />
              <Slider
                value={maxDiscount}
                onValueChange={handleMaxDiscountChange}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Maximum Price: ${maxPrice[0] === 1000 ? '∞' : maxPrice[0]}
          </Label>
          <Slider
            value={maxPrice}
            onValueChange={handleMaxPriceChange}
            max={1000}
            step={5}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Special Filters */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Special Filters
          </Label>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="freeOnly"
              checked={freeOnly}
              onCheckedChange={handleFreeOnlyChange}
            />
            <Label htmlFor="freeOnly">Free games only</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="hasDeals"
              checked={hasDeals}
              onCheckedChange={handleHasDealsChange}
            />
            <Label htmlFor="hasDeals">Active deals only</Label>
          </div>
        </div>

        <Separator />

        {/* Region Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Regions ({selectedRegions.length})
            </Label>
            {selectedRegions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRegions}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          {selectedRegions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedRegions.map((region) => (
                <Badge
                  key={region}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRegionToggle(region)}
                >
                  {region}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}

          <ScrollArea className="h-48 w-full border rounded-md p-2">
            <div className="space-y-2">
              {MAIN_REGIONS.map((region) => (
                <div
                  key={region}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted ${
                    selectedRegions.includes(region) ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => handleRegionToggle(region)}
                >
                  <span className="font-mono text-sm">{region}</span>
                  <span className="text-xs text-muted-foreground">
                    {REGION_NAMES[region] || region}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="text-xs text-muted-foreground">
            Click regions to filter. {selectedRegions.length === 0 ? 'All regions shown' : `${selectedRegions.length} regions selected`}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFreeOnlyChange(true)}
            className="w-full"
          >
            Show Free Games
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMinDiscountChange([50])}
            className="w-full"
          >
            50%+ Discounts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}