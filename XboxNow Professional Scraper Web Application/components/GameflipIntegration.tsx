import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { 
  Upload, 
  Gamepad2, 
  DollarSign, 
  Settings, 
  Play, 
  Pause, 
  Square,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface GameflipListing {
  name: string;
  platform: string;
  category: string;
  price: number;
  description?: string;
  digital: boolean;
  digital_deliverable: string;
  digital_code?: string;
  image_url?: string;
  tags: string;
  shipping_within_days: number;
}

interface GameflipProgress {
  current: number;
  total: number;
  status: 'idle' | 'uploading' | 'paused' | 'completed' | 'error';
  currentItem: string;
  errors: string[];
  successes: string[];
}

const GAMEFLIP_CATEGORIES = [
  'ACCOUNT', 'DIGITAL_INGAME', 'GIFTCARD', 'GAME_KEY', 'COLLECTIBLE'
];

const GAMING_PLATFORMS = [
  'PC', 'Xbox', 'PlayStation', 'Nintendo Switch', 'Mobile', 'Steam', 'Epic Games',
  'Origin', 'Uplay', 'Battle.net', 'GoG', 'Microsoft Store'
];

const DIGITAL_DELIVERABLES = [
  'code', 'account', 'item', 'instruction'
];

export function GameflipIntegration() {
  const [apiToken, setApiToken] = useState('');
  const [listings, setListings] = useState<GameflipListing[]>([]);
  const [currentListing, setCurrentListing] = useState<GameflipListing>({
    name: '',
    platform: '',
    category: 'GAME_KEY',
    price: 0,
    description: '',
    digital: true,
    digital_deliverable: 'code',
    digital_code: '',
    image_url: '',
    tags: '',
    shipping_within_days: 1
  });
  const [progress, setProgress] = useState<GameflipProgress>({
    current: 0,
    total: 0,
    status: 'idle',
    currentItem: '',
    errors: [],
    successes: []
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadWorkerRef = useRef<AbortController | null>(null);

  // Gameflip API Base URL
  const GAMEFLIP_API_BASE = 'https://production-gameflip.fingershock.com/api/v1';

  // API Headers
  const getHeaders = (contentType = 'application/json') => ({
    'Authorization': apiToken,
    'Content-Type': contentType,
    'User-Agent': 'XboxNow-Scraper/2.0'
  });

  // Resize image to square
  const resizeImageToSquare = async (imageFile: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const size = 640;
        const ratio = size / Math.max(img.width, img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = size;
        canvas.height = size;
        
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        // Center image
        const offsetX = (size - newWidth) / 2;
        const offsetY = (size - newHeight) / 2;
        
        ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.9);
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  };

  // Download and process image from URL
  const downloadAndProcessImage = async (url: string): Promise<Blob | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      
      return await resizeImageToSquare(file);
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  };

  // Create Gameflip listing
  const createListing = async (listing: GameflipListing): Promise<{ id: string; version: string } | null> => {
    try {
      const payload = {
        status: 'draft',
        digital: listing.digital,
        digital_region: 'none',
        shipping_predefined_package: 'None',
        shipping_paid_by: 'seller',
        digital_deliverable: listing.digital_deliverable,
        expire_in_days: 30,
        kind: 'item',
        category: listing.category,
        name: listing.name,
        platform: listing.platform,
        price: Math.round(listing.price * 100), // Convert to cents
        accept_currency: 'USD',
        tags: listing.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        shipping_within_days: listing.shipping_within_days,
        description: listing.description?.trim() || ''
      };

      const response = await fetch(`${GAMEFLIP_API_BASE}/listing`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return {
        id: data.data.id,
        version: data.data.version || '0'
      };
    } catch (error) {
      console.error('Error creating listing:', error);
      return null;
    }
  };

  // Upload photo to listing
  const uploadPhoto = async (listingId: string, imageBlob: Blob): Promise<string | null> => {
    try {
      // Request upload URL
      const uploadResponse = await fetch(`${GAMEFLIP_API_BASE}/listing/${listingId}/photo`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (!uploadResponse.ok) throw new Error('Failed to get upload URL');

      const uploadData = await uploadResponse.json();
      const { id: photoId, upload_url } = uploadData.data;

      // Upload image
      const putResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public,max-age=2592000'
        },
        body: imageBlob
      });

      if (!putResponse.ok) throw new Error('Failed to upload image');

      return photoId;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  // Activate photo and add digital code
  const finalizeListing = async (
    listingId: string, 
    photoId: string | null, 
    digitalCode: string | null, 
    version: string
  ): Promise<boolean> => {
    try {
      const patches: any[] = [];

      // Activate photo if uploaded
      if (photoId) {
        patches.push(
          { op: 'replace', path: `/photo/${photoId}/status`, value: 'active' },
          { op: 'replace', path: `/photo/${photoId}/display_order`, value: 0 }
        );
      }

      // Add digital code if provided
      if (digitalCode?.trim()) {
        patches.push(
          { op: 'replace', path: '/digital_code', value: digitalCode.trim() }
        );
      }

      // Apply patches if any
      if (patches.length > 0) {
        const patchResponse = await fetch(`${GAMEFLIP_API_BASE}/listing/${listingId}`, {
          method: 'PATCH',
          headers: getHeaders('application/json-patch+json'),
          body: JSON.stringify(patches)
        });

        if (!patchResponse.ok) {
          console.warn('Some patches failed, but continuing...');
        }
      }

      // Publish listing
      const publishResponse = await fetch(`${GAMEFLIP_API_BASE}/listing/${listingId}`, {
        method: 'PATCH',
        headers: getHeaders('application/json-patch+json'),
        body: JSON.stringify([
          { op: 'replace', path: '/status', value: 'onsale' }
        ])
      });

      return publishResponse.ok;
    } catch (error) {
      console.error('Error finalizing listing:', error);
      return false;
    }
  };

  // Process single listing
  const processListing = async (listing: GameflipListing): Promise<boolean> => {
    try {
      // Create listing
      const listingData = await createListing(listing);
      if (!listingData) {
        throw new Error('Failed to create listing');
      }

      let photoId: string | null = null;

      // Upload image if provided
      if (listing.image_url?.trim()) {
        const imageBlob = await downloadAndProcessImage(listing.image_url);
        if (imageBlob) {
          photoId = await uploadPhoto(listingData.id, imageBlob);
        }
      }

      // Finalize listing
      const success = await finalizeListing(
        listingData.id,
        photoId,
        listing.digital_code || null,
        listingData.version
      );

      if (success) {
        return true;
      } else {
        throw new Error('Failed to publish listing');
      }
    } catch (error) {
      console.error('Error processing listing:', error);
      return false;
    }
  };

  // Start upload process
  const startUpload = async () => {
    if (!apiToken.trim()) {
      alert('Please enter your Gameflip API token');
      return;
    }

    if (listings.length === 0) {
      alert('No listings to upload');
      return;
    }

    // Create abort controller
    uploadWorkerRef.current = new AbortController();

    setProgress({
      current: 0,
      total: listings.length,
      status: 'uploading',
      currentItem: '',
      errors: [],
      successes: []
    });

    const errors: string[] = [];
    const successes: string[] = [];

    for (let i = 0; i < listings.length; i++) {
      if (uploadWorkerRef.current?.signal.aborted) {
        break;
      }

      const listing = listings[i];
      
      setProgress(prev => ({
        ...prev,
        current: i + 1,
        currentItem: listing.name
      }));

      try {
        const success = await processListing(listing);
        
        if (success) {
          successes.push(`✅ ${listing.name}`);
        } else {
          errors.push(`❌ ${listing.name}: Upload failed`);
        }
      } catch (error) {
        errors.push(`❌ ${listing.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setProgress(prev => ({
      ...prev,
      status: 'completed',
      errors,
      successes,
      currentItem: ''
    }));
  };

  // Pause/Stop upload
  const stopUpload = () => {
    uploadWorkerRef.current?.abort();
    setProgress(prev => ({
      ...prev,
      status: 'paused'
    }));
  };

  // Add listing
  const addListing = () => {
    if (!currentListing.name.trim() || !currentListing.platform.trim()) {
      alert('Please fill in at least the name and platform');
      return;
    }

    setListings(prev => [...prev, { ...currentListing }]);
    
    // Reset form
    setCurrentListing({
      name: '',
      platform: '',
      category: 'GAME_KEY',
      price: 0,
      description: '',
      digital: true,
      digital_deliverable: 'code',
      digital_code: '',
      image_url: '',
      tags: '',
      shipping_within_days: 1
    });
  };

  // Remove listing
  const removeListing = (index: number) => {
    setListings(prev => prev.filter((_, i) => i !== index));
  };

  // Import from CSV
  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const newListings: GameflipListing[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const listing: any = {};
          
          headers.forEach((header, index) => {
            listing[header] = values[index] || '';
          });
          
          // Convert and validate
          const gameflipListing: GameflipListing = {
            name: listing.name || listing.title || '',
            platform: listing.platform || 'PC',
            category: listing.category || 'GAME_KEY',
            price: parseFloat(listing.price) || 0,
            description: listing.description || '',
            digital: listing.digital?.toLowerCase() !== 'false',
            digital_deliverable: listing.digital_deliverable || 'code',
            digital_code: listing.digital_code || listing.code || '',
            image_url: listing.image_url || listing.image || '',
            tags: listing.tags || '',
            shipping_within_days: parseInt(listing.shipping_within_days) || 1
          };
          
          if (gameflipListing.name) {
            newListings.push(gameflipListing);
          }
        }
        
        setListings(prev => [...prev, ...newListings]);
      } catch (error) {
        alert('Error parsing CSV file');
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Gameflip Integration</h2>
          <Badge variant="outline">Upload listings to Gameflip</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
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

      {/* Settings Panel */}
      {isConfigOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Gameflip Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiToken">Gameflip API Token</Label>
              <Input
                id="apiToken"
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Gameflip izeql9Fu29L7VzjmarrBdXvelejfF5mn7MrtQgiYedbD"
              />
              <p className="text-sm text-muted-foreground">
                Get your API token from Gameflip Developer Settings
              </p>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your Gameflip account has seller permissions and API access enabled.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {progress.status !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upload Progress</span>
              <div className="flex items-center gap-2">
                {progress.status === 'uploading' && (
                  <Button variant="outline" size="sm" onClick={stopUpload}>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress: {progress.current} / {progress.total}</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
              {progress.currentItem && (
                <p className="text-sm text-muted-foreground">
                  Currently processing: {progress.currentItem}
                </p>
              )}
            </div>

            {(progress.successes.length > 0 || progress.errors.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progress.successes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Successful ({progress.successes.length})
                    </h4>
                    <ScrollArea className="h-32 border rounded p-2">
                      {progress.successes.map((success, i) => (
                        <div key={i} className="text-sm text-green-600">{success}</div>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                {progress.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Errors ({progress.errors.length})
                    </h4>
                    <ScrollArea className="h-32 border rounded p-2">
                      {progress.errors.map((error, i) => (
                        <div key={i} className="text-sm text-red-600">{error}</div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add New Listing */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={currentListing.name}
                onChange={(e) => setCurrentListing(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Game or item name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select 
                value={currentListing.platform}
                onValueChange={(value) => setCurrentListing(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {GAMING_PLATFORMS.map(platform => (
                    <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={currentListing.category}
                onValueChange={(value) => setCurrentListing(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GAMEFLIP_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={currentListing.price}
                onChange={(e) => setCurrentListing(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliverable">Digital Deliverable</Label>
              <Select 
                value={currentListing.digital_deliverable}
                onValueChange={(value) => setCurrentListing(prev => ({ ...prev, digital_deliverable: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIGITAL_DELIVERABLES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipping">Shipping Days</Label>
              <Input
                id="shipping"
                type="number"
                min="1"
                value={currentListing.shipping_within_days}
                onChange={(e) => setCurrentListing(prev => ({ ...prev, shipping_within_days: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentListing.description}
              onChange={(e) => setCurrentListing(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the item"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="digitalCode">Digital Code</Label>
              <Input
                id="digitalCode"
                value={currentListing.digital_code}
                onChange={(e) => setCurrentListing(prev => ({ ...prev, digital_code: e.target.value }))}
                placeholder="Game key or redemption code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={currentListing.image_url}
                onChange={(e) => setCurrentListing(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={currentListing.tags}
              onChange={(e) => setCurrentListing(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="action, rpg, multiplayer"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="digital"
              checked={currentListing.digital}
              onCheckedChange={(checked) => setCurrentListing(prev => ({ ...prev, digital: checked }))}
            />
            <Label htmlFor="digital">Digital Item</Label>
          </div>

          <Button onClick={addListing} className="w-full">
            Add to Listings
          </Button>
        </CardContent>
      </Card>

      {/* Listings Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload Queue ({listings.length})</span>
            <div className="flex items-center gap-2">
              {listings.length > 0 && (
                <Button 
                  onClick={startUpload}
                  disabled={progress.status === 'uploading'}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Upload
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No listings in queue. Add some listings above or import from CSV.
            </p>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {listings.map((listing, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{listing.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {listing.platform} • {listing.category} • ${listing.price}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeListing(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}