import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  Settings, 
  Clock, 
  Globe, 
  Database,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { ScrapingProgress, ScrapingConfig, MAIN_REGIONS } from '../types/scraper';

interface ScrapingControlsProps {
  progress: ScrapingProgress;
  onStartScraping: (config: ScrapingConfig) => void;
  onPauseScraping: () => void;
  onStopScraping: () => void;
  onExportCSV: () => void;
}

export function ScrapingControls({
  progress,
  onStartScraping,
  onPauseScraping,
  onStopScraping,
  onExportCSV
}: ScrapingControlsProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['US']);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(10);
  const [delay, setDelay] = useState(1000);
  const [skipExisting, setSkipExisting] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleRegionChange = useCallback((region: string, checked: boolean) => {
    setSelectedRegions(prev => 
      checked 
        ? [...prev, region]
        : prev.filter(r => r !== region)
    );
  }, []);

  const selectAllRegions = useCallback(() => {
    setSelectedRegions([...MAIN_REGIONS]);
  }, []);

  const clearAllRegions = useCallback(() => {
    setSelectedRegions([]);
  }, []);

  const handleStartScraping = useCallback(() => {
    if (selectedRegions.length === 0) {
      alert('Please select at least one region');
      return;
    }

    const config: ScrapingConfig = {
      regions: selectedRegions,
      startPage,
      endPage,
      delay,
      skipExisting
    };

    onStartScraping(config);
  }, [selectedRegions, startPage, endPage, delay, skipExisting, onStartScraping]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getProgressPercentage = (): number => {
    if (progress.totalPages === 0) return 0;
    return Math.round((progress.currentPage / progress.totalPages) * 100);
  };

  const estimatedPages = (endPage - startPage + 1) * selectedRegions.length;
  const estimatedTime = Math.round((estimatedPages * delay) / 1000);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Scraping Controls
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={progress.isActive ? "default" : "secondary"}>
              {progress.status}
            </Badge>
            {progress.processedGames > 0 && (
              <Badge variant="outline">
                {progress.processedGames.toLocaleString()} games found
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Section */}
        {(progress.isActive || progress.status !== 'Ready') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {progress.isActive ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                ) : progress.status === 'Completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="font-medium">{progress.status}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {getProgressPercentage()}%
              </div>
            </div>

            <Progress value={getProgressPercentage()} className="w-full" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Pages</div>
                <div className="font-medium">
                  {progress.currentPage} / {progress.totalPages}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Region</div>
                <div className="font-medium font-mono">
                  {progress.currentRegion || 'N/A'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Games Found</div>
                <div className="font-medium">
                  {progress.processedGames.toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Time Remaining</div>
                <div className="font-medium">
                  {progress.estimatedTimeRemaining > 0 
                    ? formatTime(Math.floor(progress.estimatedTimeRemaining / 1000))
                    : 'N/A'
                  }
                </div>
              </div>
            </div>

            {progress.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div>Errors encountered during scraping:</div>
                    <ul className="list-disc list-inside text-xs space-y-1 max-h-20 overflow-y-auto">
                      {progress.errors.slice(-5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Separator />

        {/* Configuration Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Configuration</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="mr-2 h-4 w-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>

          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startPage">Start Page</Label>
              <Input
                id="startPage"
                type="number"
                min="1"
                value={startPage}
                onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                disabled={progress.isActive}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endPage">End Page</Label>
              <Input
                id="endPage"
                type="number"
                min="1"
                value={endPage}
                onChange={(e) => setEndPage(parseInt(e.target.value) || 10)}
                disabled={progress.isActive}
              />
            </div>
          </div>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delay">Delay between requests (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={delay}
                    onChange={(e) => setDelay(parseInt(e.target.value) || 1000)}
                    disabled={progress.isActive}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-7">
                  <Checkbox
                    id="skipExisting"
                    checked={skipExisting}
                    onCheckedChange={(checked) => setSkipExisting(checked as boolean)}
                    disabled={progress.isActive}
                  />
                  <Label htmlFor="skipExisting">Skip existing games</Label>
                </div>
              </div>
            </div>
          )}

          {/* Estimation */}
          <div className="bg-muted rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium">Estimation</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total pages:</span>
                <span className="ml-2 font-mono">{estimatedPages.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated time:</span>
                <span className="ml-2 font-mono">{formatTime(estimatedTime)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Selected regions:</span>
                <span className="ml-2 font-mono">{selectedRegions.length}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Region Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Regions ({selectedRegions.length})
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllRegions}
                disabled={progress.isActive}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllRegions}
                disabled={progress.isActive}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
            {MAIN_REGIONS.map((region) => (
              <div key={region} className="flex items-center space-x-2">
                <Checkbox
                  id={region}
                  checked={selectedRegions.includes(region)}
                  onCheckedChange={(checked) => handleRegionChange(region, checked as boolean)}
                  disabled={progress.isActive}
                />
                <Label
                  htmlFor={region}
                  className="text-xs font-mono cursor-pointer"
                >
                  {region}
                </Label>
              </div>
            ))}
          </div>

          {selectedRegions.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select at least one region to start scraping.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!progress.isActive ? (
              <Button
                onClick={handleStartScraping}
                disabled={selectedRegions.length === 0}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Scraping
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={onPauseScraping}
                  className="flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button
                  variant="destructive"
                  onClick={onStopScraping}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}