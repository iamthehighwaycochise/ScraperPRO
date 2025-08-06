import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  ChevronUp, 
  ChevronDown, 
  ExternalLink, 
  Calendar, 
  DollarSign,
  Percent,
  Search,
  SortAsc,
  SortDesc,
  Filter
} from 'lucide-react';
import { Game, FilterOptions } from '../types/scraper';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GameTableProps {
  games: Game[];
  selectedGames: Set<string>;
  onToggleSelection: (gameId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  filters: FilterOptions;
}

type SortField = 'title' | 'price' | 'discount' | 'region' | 'releaseDate';
type SortDirection = 'asc' | 'desc';

export function GameTable({
  games,
  selectedGames,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  filters
}: GameTableProps) {
  const [sortField, setSortField] = useState<SortField>('discount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickSearch, setQuickSearch] = useState('');

  // Apply quick search on top of existing filters
  const searchFilteredGames = useMemo(() => {
    if (!quickSearch.trim()) return games;
    
    const searchTerm = quickSearch.toLowerCase();
    return games.filter(game =>
      game.title.toLowerCase().includes(searchTerm) ||
      game.productId.toLowerCase().includes(searchTerm) ||
      game.developer.toLowerCase().includes(searchTerm) ||
      game.publisher.toLowerCase().includes(searchTerm)
    );
  }, [games, quickSearch]);

  // Sort games
  const sortedGames = useMemo(() => {
    return [...searchFilteredGames].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle special cases
      if (sortField === 'price') {
        aValue = a.lowestPriceUsd;
        bValue = b.lowestPriceUsd;
      } else if (sortField === 'releaseDate') {
        aValue = new Date(a.releaseDate || '1970-01-01');
        bValue = new Date(b.releaseDate || '1970-01-01');
      }

      // Handle string vs number comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let result = 0;
      if (aValue < bValue) result = -1;
      else if (aValue > bValue) result = 1;

      return sortDirection === 'desc' ? -result : result;
    });
  }, [searchFilteredGames, sortField, sortDirection]);

  // Paginate games
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedGames.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedGames, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedGames.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAllVisible = () => {
    const allVisibleSelected = paginatedGames.every(game => selectedGames.has(game.id));
    if (allVisibleSelected) {
      paginatedGames.forEach(game => onToggleSelection(game.id));
    } else {
      paginatedGames.forEach(game => {
        if (!selectedGames.has(game.id)) {
          onToggleSelection(game.id);
        }
      });
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'FREE';
    return `${price.toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <SortAsc className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const allVisibleSelected = paginatedGames.length > 0 && paginatedGames.every(game => selectedGames.has(game.id));
  const someVisibleSelected = paginatedGames.some(game => selectedGames.has(game.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Games Table</span>
            <Badge variant="outline">
              {sortedGames.length.toLocaleString()} games
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {selectedGames.size > 0 && (
              <>
                <Badge variant="secondary">
                  {selectedGames.size} selected
                </Badge>
                <Button variant="outline" size="sm" onClick={onDeselectAll}>
                  Clear Selection
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Table Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Quick search in table..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={handleSelectAllVisible}
                disabled={paginatedGames.length === 0}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllVisible}
                disabled={paginatedGames.length === 0}
              >
                Select Page
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={games.length === 0}
            >
              Select All ({games.length})
            </Button>
          </div>
        </div>

        {/* Games Table */}
        <div className="border rounded-lg overflow-hidden">
          <ScrollArea className="h-[600px]">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b font-medium text-sm sticky top-0 bg-background z-10">
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={handleSelectAllVisible}
                  />
                </div>
                <div className="col-span-1">Image</div>
                <div 
                  className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-primary"
                  onClick={() => handleSort('title')}
                >
                  Title {getSortIcon('title')}
                </div>
                <div 
                  className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-primary"
                  onClick={() => handleSort('region')}
                >
                  Region {getSortIcon('region')}
                </div>
                <div 
                  className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-primary"
                  onClick={() => handleSort('price')}
                >
                  Price {getSortIcon('price')}
                </div>
                <div 
                  className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-primary"
                  onClick={() => handleSort('discount')}
                >
                  Discount {getSortIcon('discount')}
                </div>
                <div 
                  className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-primary"
                  onClick={() => handleSort('releaseDate')}
                >
                  Release Date {getSortIcon('releaseDate')}
                </div>
                <div className="col-span-2">Developer</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Body */}
              {paginatedGames.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4" />
                  <p>No games match your current filters</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              ) : (
                paginatedGames.map((game, index) => (
                  <div
                    key={game.id}
                    className={`grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/25 transition-colors ${
                      selectedGames.has(game.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="col-span-1 flex items-center">
                      <Checkbox
                        checked={selectedGames.has(game.id)}
                        onCheckedChange={() => onToggleSelection(game.id)}
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <ImageWithFallback
                        src={game.imageUrl}
                        alt={game.title}
                        className="w-12 h-16 object-cover rounded border"
                      />
                    </div>
                    
                    <div className="col-span-3 space-y-1">
                      <div className="font-medium truncate" title={game.title}>
                        {game.title}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {game.productId}
                      </div>
                      {game.categories.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {game.categories.slice(0, 2).map((category, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-1">
                      <Badge variant="secondary" className="font-mono">
                        {game.region}
                      </Badge>
                    </div>
                    
                    <div className="col-span-1 space-y-1">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className={`font-medium ${game.lowestPriceUsd === 0 ? 'text-green-600' : ''}`}>
                          {formatPrice(game.lowestPriceUsd, game.currency)}
                        </span>
                      </div>
                      {game.originalPriceUsd > game.lowestPriceUsd && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatPrice(game.originalPriceUsd, game.currency)}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-1">
                      {game.discount > 0 && (
                        <Badge 
                          variant={game.discount >= 50 ? "destructive" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <Percent className="h-3 w-3" />
                          {game.discount}%
                        </Badge>
                      )}
                      {game.dealUntil && (
                        <div className="text-xs text-orange-600 mt-1">
                          Until {formatDate(game.dealUntil)}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-2 space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(game.releaseDate)}
                      </div>
                      {game.rating && (
                        <Badge variant="outline" className="text-xs">
                          {game.rating}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="col-span-2 text-sm space-y-1">
                      <div className="truncate" title={game.developer}>
                        <strong>Dev:</strong> {game.developer}
                      </div>
                      <div className="truncate text-muted-foreground" title={game.publisher}>
                        <strong>Pub:</strong> {game.publisher}
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(game.url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedGames.length)} of {sortedGames.length.toLocaleString()} games
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}