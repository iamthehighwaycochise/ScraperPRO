import { useState, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Upload,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Filter,
  Package,
  Settings,
  Download,
  RefreshCw,
  Search,
  Plus,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';
import { simulateNetworkDelay, mockUploadSuccess } from '../mocks/demoUtils';

interface GameUploadItem {
  id: string;
  title: string;
  productId?: string;
  platform: string;
  price: number;
  description: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  digitalCode?: string;
  deliveryUrl?: string;
  selected: boolean;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  uploadedTo: string[];
}

interface BatchConfig {
  batchSize: number;
  delayBetweenBatches: number;
  platforms: string[];
  autoRetry: boolean;
  maxRetries: number;
}

interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  currentItem: number;
  totalItems: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  currentPlatform: string;
  itemsProcessed: number;
  itemsSuccess: number;
  itemsError: number;
}

export function BulkUploadManager() {
  const [items, setItems] = useState<GameUploadItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GameUploadItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [batchConfig, setBatchConfig] = useState<BatchConfig>({
    batchSize: 10,
    delayBetweenBatches: 5000,
    platforms: ['gameflip'],
    autoRetry: true,
    maxRetries: 3
  });
  const [progress, setProgress] = useState<BatchProgress>({
    currentBatch: 0,
    totalBatches: 0,
    currentItem: 0,
    totalItems: 0,
    status: 'idle',
    currentPlatform: '',
    itemsProcessed: 0,
    itemsSuccess: 0,
    itemsError: 0
  });
  const [activeTab, setActiveTab] = useState('list');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadWorkerRef = useRef<AbortController | null>(null);

  // Available platforms
  const platforms = [
    { id: 'gameflip', name: 'Gameflip', icon: '🎮' },
    { id: 'kofi', name: 'Ko-fi', icon: '☕' },
    { id: 'discord', name: 'Discord', icon: '💬' },
    { id: 'custom', name: 'Custom API', icon: '🔧' }
  ];

  // Filter items based on search and filters
  const applyFilters = useCallback(() => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(item => item.platform === platformFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Show selected only
    if (showSelectedOnly) {
      filtered = filtered.filter(item => item.selected);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, platformFilter, statusFilter, showSelectedOnly]);

  // Apply filters when dependencies change
  useMemo(() => {
    applyFilters();
  }, [applyFilters]);

  // Get selected items
  const selectedItems = useMemo(() => {
    return items.filter(item => item.selected);
  }, [items]);

  // Import games from CSV
  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newItems: GameUploadItem[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const itemData: any = {};
          
          headers.forEach((header, index) => {
            itemData[header] = values[index] || '';
          });
          
          const item: GameUploadItem = {
            id: `item-${Date.now()}-${i}`,
            title: itemData.title || itemData.name || `Item ${i}`,
            productId: itemData.productid || itemData['product id'] || '',
            platform: itemData.platform || 'PC',
            price: parseFloat(itemData.price) || 0,
            description: itemData.description || '',
            imageUrl: itemData.imageurl || itemData.image || '',
            category: itemData.category || 'GAME_KEY',
            tags: (itemData.tags || '').split(';').filter((t: string) => t.trim()),
            digitalCode: itemData.digitalcode || itemData.code || '',
            deliveryUrl: itemData.deliveryurl || itemData.url || '',
            selected: false,
            status: 'pending',
            uploadedTo: []
          };
          
          newItems.push(item);
        }
        
        setItems(prev => [...prev, ...newItems]);
        alert(`Imported ${newItems.length} items from CSV`);
      } catch (error) {
        alert('Error parsing CSV file: ' + error);
      }
    };
    
    reader.readAsText(file);
  };

  // Add single item manually
  const addManualItem = () => {
    const newItem: GameUploadItem = {
      id: `manual-${Date.now()}`,
      title: 'New Game',
      platform: 'PC',
      price: 0,
      description: '',
      category: 'GAME_KEY',
      tags: [],
      selected: false,
      status: 'pending',
      uploadedTo: []
    };
    
    setItems(prev => [...prev, newItem]);
  };

  // Update item
  const updateItem = (id: string, updates: Partial<GameUploadItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  // Select all filtered items
  const selectAllFiltered = () => {
    const filteredIds = new Set(filteredItems.map(item => item.id));
    setItems(prev => prev.map(item => 
      filteredIds.has(item.id) ? { ...item, selected: true } : item
    ));
  };

  // Deselect all
  const deselectAll = () => {
    setItems(prev => prev.map(item => ({ ...item, selected: false })));
  };

  // Simulate upload to platform
  const uploadToPlatform = async (item: GameUploadItem, platform: string): Promise<boolean> => {
    // Simulate API call delay
    await simulateNetworkDelay();

    // Simulate success/failure (90% success rate)
    const success = mockUploadSuccess();
    
    if (success) {
      updateItem(item.id, {
        status: 'success',
        uploadedTo: [...item.uploadedTo, platform]
      });
    } else {
      updateItem(item.id, {
        status: 'error',
        error: `Failed to upload to ${platform}: Network error`
      });
    }
    
    return success;
  };

  // Start batch upload
  const startBatchUpload = async () => {
    const selectedItemsList = selectedItems.filter(item => item.status !== 'success');
    
    if (selectedItemsList.length === 0) {
      alert('No items selected for upload');
      return;
    }

    // Calculate batches
    const totalBatches = Math.ceil(selectedItemsList.length / batchConfig.batchSize);
    
    setProgress({
      currentBatch: 0,
      totalBatches,
      currentItem: 0,
      totalItems: selectedItemsList.length,
      status: 'running',
      currentPlatform: batchConfig.platforms[0],
      itemsProcessed: 0,
      itemsSuccess: 0,
      itemsError: 0
    });

    // Create abort controller
    uploadWorkerRef.current = new AbortController();

    let itemsProcessed = 0;
    let itemsSuccess = 0;
    let itemsError = 0;

    // Process each batch
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      if (uploadWorkerRef.current?.signal.aborted) break;

      const batchStart = batchIndex * batchConfig.batchSize;
      const batchEnd = Math.min(batchStart + batchConfig.batchSize, selectedItemsList.length);
      const batch = selectedItemsList.slice(batchStart, batchEnd);

      setProgress(prev => ({
        ...prev,
        currentBatch: batchIndex + 1,
        currentItem: batchStart + 1
      }));

      // Process each item in the batch
      for (const item of batch) {
        if (uploadWorkerRef.current?.signal.aborted) break;

        updateItem(item.id, { status: 'uploading' });

        // Upload to each selected platform
        for (const platform of batchConfig.platforms) {
          if (uploadWorkerRef.current?.signal.aborted) break;

          setProgress(prev => ({
            ...prev,
            currentPlatform: platform
          }));

          const success = await uploadToPlatform(item, platform);
          
          if (success) {
            itemsSuccess++;
          } else {
            itemsError++;
            
            // Retry logic
            if (batchConfig.autoRetry) {
              for (let retry = 0; retry < batchConfig.maxRetries; retry++) {
                if (uploadWorkerRef.current?.signal.aborted) break;
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                const retrySuccess = await uploadToPlatform(item, platform);
                
                if (retrySuccess) {
                  itemsSuccess++;
                  itemsError--;
                  break;
                }
              }
            }
          }
        }

        itemsProcessed++;
        setProgress(prev => ({
          ...prev,
          itemsProcessed,
          itemsSuccess,
          itemsError
        }));
      }

      // Delay between batches
      if (batchIndex < totalBatches - 1 && !uploadWorkerRef.current?.signal.aborted) {
        await new Promise(resolve => setTimeout(resolve, batchConfig.delayBetweenBatches));
      }
    }

    setProgress(prev => ({
      ...prev,
      status: uploadWorkerRef.current?.signal.aborted ? 'paused' : 'completed'
    }));
  };

  // Pause upload
  const pauseUpload = () => {
    uploadWorkerRef.current?.abort();
    setProgress(prev => ({ ...prev, status: 'paused' }));
  };

  // Export results
  const exportResults = () => {
    const csv = [
      'Title,Product ID,Platform,Price,Status,Uploaded To,Error',
      ...items.map(item => [
        item.title,
        item.productId || '',
        item.platform,
        item.price,
        item.status,
        item.uploadedTo.join(';'),
        item.error || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-upload-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Bulk Upload Manager</h2>
          <Badge variant="outline">{items.length} items total</Badge>
          <Badge variant="secondary">{selectedItems.length} selected</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          
          <Button
            variant="outline"
            onClick={addManualItem}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          
          <Button
            variant="outline"
            onClick={exportResults}
            disabled={items.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={importFromCSV}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload Progress */}
      {progress.status !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Batch Upload Progress</span>
              <div className="flex items-center gap-2">
                {progress.status === 'running' && (
                  <Button variant="outline" size="sm" onClick={pauseUpload}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Badge variant={
                  progress.status === 'completed' ? 'default' : 
                  progress.status === 'error' ? 'destructive' : 'secondary'
                }>
                  {progress.status}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Batch Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Batch: {progress.currentBatch} / {progress.totalBatches}</span>
                <span>Items: {progress.itemsProcessed} / {progress.totalItems}</span>
              </div>
              <Progress value={(progress.itemsProcessed / progress.totalItems) * 100} />
              {progress.currentPlatform && (
                <p className="text-sm text-muted-foreground">
                  Currently uploading to: {progress.currentPlatform}
                </p>
              )}
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{progress.itemsSuccess}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">{progress.itemsError}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{progress.itemsProcessed}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">
            <FileText className="mr-2 h-4 w-4" />
            Item List ({filteredItems.length})
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="mr-2 h-4 w-4" />
            Batch Configuration
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Play className="mr-2 h-4 w-4" />
            Upload Control
          </TabsTrigger>
        </TabsList>

        {/* Item List Tab */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search items..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="PC">PC</SelectItem>
                      <SelectItem value="Xbox">Xbox</SelectItem>
                      <SelectItem value="PlayStation">PlayStation</SelectItem>
                      <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="uploading">Uploading</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="selectedOnly"
                      checked={showSelectedOnly}
                      onCheckedChange={setShowSelectedOnly}
                    />
                    <Label htmlFor="selectedOnly">Selected only</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllFiltered}>
                  Select All Filtered ({filteredItems.length})
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} of {items.length} items selected
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No items found matching your filters</p>
                  <p className="text-sm">Try adjusting your search or import some items</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{item.title}</h4>
                            <Badge
                              variant={
                                item.status === 'success' ? 'default' :
                                item.status === 'error' ? 'destructive' :
                                item.status === 'uploading' ? 'secondary' : 'outline'
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.platform} • ${item.price} • {item.category}
                            {item.uploadedTo.length > 0 && (
                              <span> • Uploaded to: {item.uploadedTo.join(', ')}</span>
                            )}
                          </div>
                          {item.error && (
                            <div className="text-sm text-red-600 mt-1">{item.error}</div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Edit item logic here
                              const newTitle = prompt('Edit title:', item.title);
                              if (newTitle) {
                                updateItem(item.id, { title: newTitle });
                              }
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Upload Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Batch Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="1"
                    max="100"
                    value={batchConfig.batchSize}
                    onChange={(e) => setBatchConfig(prev => ({
                      ...prev,
                      batchSize: parseInt(e.target.value) || 10
                    }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of items to upload in each batch
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay">Delay Between Batches (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="1000"
                    value={batchConfig.delayBetweenBatches}
                    onChange={(e) => setBatchConfig(prev => ({
                      ...prev,
                      delayBetweenBatches: parseInt(e.target.value) || 5000
                    }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Delay between batches to avoid rate limiting
                  </p>
                </div>
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label>Upload Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform.id}
                        checked={batchConfig.platforms.includes(platform.id)}
                        onCheckedChange={(checked) => {
                          setBatchConfig(prev => ({
                            ...prev,
                            platforms: checked
                              ? [...prev.platforms, platform.id]
                              : prev.platforms.filter(p => p !== platform.id)
                          }));
                        }}
                      />
                      <Label htmlFor={platform.id} className="flex items-center gap-2">
                        <span>{platform.icon}</span>
                        {platform.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retry Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoRetry"
                    checked={batchConfig.autoRetry}
                    onCheckedChange={(checked) => setBatchConfig(prev => ({
                      ...prev,
                      autoRetry: checked
                    }))}
                  />
                  <Label htmlFor="autoRetry">Auto-retry failed uploads</Label>
                </div>

                {batchConfig.autoRetry && (
                  <div className="space-y-2">
                    <Label htmlFor="maxRetries">Max Retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      min="1"
                      max="10"
                      value={batchConfig.maxRetries}
                      onChange={(e) => setBatchConfig(prev => ({
                        ...prev,
                        maxRetries: parseInt(e.target.value) || 3
                      }))}
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              {/* Configuration Summary */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuration Summary:</strong><br />
                  • Upload {selectedItems.length} selected items in batches of {batchConfig.batchSize}<br />
                  • {Math.ceil(selectedItems.length / batchConfig.batchSize)} total batches<br />
                  • Upload to: {batchConfig.platforms.map(p => platforms.find(pl => pl.id === p)?.name).join(', ')}<br />
                  • Estimated time: ~{Math.ceil((selectedItems.length * 2 + Math.ceil(selectedItems.length / batchConfig.batchSize) * batchConfig.delayBetweenBatches / 1000) / 60)} minutes
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Control Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upload Control</span>
                <Badge variant="outline">
                  {selectedItems.length} items ready
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItems.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No items selected for upload. Go to the Item List tab and select items to upload.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{selectedItems.length}</div>
                        <div className="text-sm text-muted-foreground">Items Selected</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{Math.ceil(selectedItems.length / batchConfig.batchSize)}</div>
                        <div className="text-sm text-muted-foreground">Batches</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{batchConfig.platforms.length}</div>
                        <div className="text-sm text-muted-foreground">Platforms</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={startBatchUpload}
                        disabled={progress.status === 'running' || batchConfig.platforms.length === 0}
                        size="lg"
                      >
                        {progress.status === 'running' ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        Start Batch Upload
                      </Button>

                      {progress.status === 'running' && (
                        <Button
                          variant="outline"
                          onClick={pauseUpload}
                          size="lg"
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Pause Upload
                        </Button>
                      )}
                    </div>

                    {batchConfig.platforms.length === 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Please select at least one platform in the Configuration tab.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}