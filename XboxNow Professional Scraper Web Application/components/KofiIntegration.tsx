import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { 
  Coffee, 
  Upload, 
  Play, 
  Pause, 
  Square,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  FileImage
} from 'lucide-react';

interface KofiProduct {
  nombre: string;
  descripcion: string;
  resumen: string;
  precio: number;
  urlEntrega: string;
  imagen?: string;
  buyerMessage?: string;
  enabled: boolean;
}

interface KofiProgress {
  current: number;
  total: number;
  status: 'idle' | 'uploading' | 'paused' | 'completed' | 'error';
  currentItem: string;
  errors: string[];
  successes: string[];
}

interface KofiSettings {
  profilePath: string;
  autoTermsAccept: boolean;
  uploadDelay: number;
  retryAttempts: number;
  headless: boolean;
}

export function KofiIntegration() {
  const [products, setProducts] = useState<KofiProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState<KofiProduct>({
    nombre: '',
    descripcion: '',
    resumen: '',
    precio: 0,
    urlEntrega: '',
    imagen: '',
    buyerMessage: '',
    enabled: true
  });
  const [progress, setProgress] = useState<KofiProgress>({
    current: 0,
    total: 0,
    status: 'idle',
    currentItem: '',
    errors: [],
    successes: []
  });
  const [settings, setSettings] = useState<KofiSettings>({
    profilePath: '',
    autoTermsAccept: true,
    uploadDelay: 2000,
    retryAttempts: 3,
    headless: false
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadWorkerRef = useRef<AbortController | null>(null);

  // Ko-fi automation endpoints (simulate browser automation)
  const KOFI_BASE_URL = 'https://ko-fi.com';
  const KOFI_SHOP_URL = `${KOFI_BASE_URL}/shop/settings?addnewitem=true&productType=0`;

  // Simulate Ko-fi upload process
  const simulateKofiUpload = async (product: KofiProduct): Promise<boolean> => {
    // This would normally use browser automation like Selenium
    // For now, we'll simulate the process and provide manual instructions
    
    console.log(`Simulating Ko-fi upload for: ${product.nombre}`);
    
    // Simulate API calls that would happen in browser automation
    try {
      // Step 1: Navigate to Ko-fi shop settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Fill initial modal
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Fill complete form
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Upload image if provided
      if (product.imagen) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Step 5: Accept terms and publish
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Ko-fi upload simulation failed:', error);
      return false;
    }
  };

  // Download and validate image
  const validateImage = async (url: string): Promise<boolean> => {
    if (!url.trim()) return false;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && contentType?.startsWith('image/');
    } catch {
      return false;
    }
  };

  // Clean text for Ko-fi (remove special characters)
  const cleanText = (text: string): string => {
    return text.replace(/[\u{10000}-\u{10FFFF}]/gu, '').trim();
  };

  // Process single product
  const processProduct = async (product: KofiProduct): Promise<boolean> => {
    try {
      // Validate required fields
      if (!product.nombre.trim()) {
        throw new Error('Product name is required');
      }
      
      if (!product.urlEntrega.trim()) {
        throw new Error('Delivery URL is required');
      }
      
      if (product.precio <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Validate image if provided
      if (product.imagen && !(await validateImage(product.imagen))) {
        console.warn(`Invalid image URL for ${product.nombre}, skipping image`);
      }

      // Simulate the upload process
      const success = await simulateKofiUpload(product);
      
      if (!success) {
        throw new Error('Upload simulation failed');
      }

      return true;
    } catch (error) {
      console.error(`Error processing ${product.nombre}:`, error);
      return false;
    }
  };

  // Start upload process
  const startUpload = async () => {
    const enabledProducts = products.filter(p => p.enabled);
    
    if (enabledProducts.length === 0) {
      alert('No enabled products to upload');
      return;
    }

    // Create abort controller
    uploadWorkerRef.current = new AbortController();

    setProgress({
      current: 0,
      total: enabledProducts.length,
      status: 'uploading',
      currentItem: '',
      errors: [],
      successes: []
    });

    const errors: string[] = [];
    const successes: string[] = [];

    for (let i = 0; i < enabledProducts.length; i++) {
      if (uploadWorkerRef.current?.signal.aborted) {
        break;
      }

      const product = enabledProducts[i];
      
      setProgress(prev => ({
        ...prev,
        current: i + 1,
        currentItem: product.nombre
      }));

      try {
        const success = await processProduct(product);
        
        if (success) {
          successes.push(`✅ ${product.nombre}`);
        } else {
          errors.push(`❌ ${product.nombre}: Upload failed`);
        }
      } catch (error) {
        errors.push(`❌ ${product.nombre}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, settings.uploadDelay));
    }

    setProgress(prev => ({
      ...prev,
      status: 'completed',
      errors,
      successes,
      currentItem: ''
    }));
  };

  // Stop upload
  const stopUpload = () => {
    uploadWorkerRef.current?.abort();
    setProgress(prev => ({
      ...prev,
      status: 'paused'
    }));
  };

  // Add product
  const addProduct = () => {
    if (!currentProduct.nombre.trim()) {
      alert('Please enter a product name');
      return;
    }

    if (!currentProduct.urlEntrega.trim()) {
      alert('Please enter a delivery URL');
      return;
    }

    if (currentProduct.precio <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setProducts(prev => [...prev, { ...currentProduct }]);
    
    // Reset form
    setCurrentProduct({
      nombre: '',
      descripcion: '',
      resumen: '',
      precio: 0,
      urlEntrega: '',
      imagen: '',
      buyerMessage: '',
      enabled: true
    });
  };

  // Remove product
  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle product enabled
  const toggleProduct = (index: number) => {
    setProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, enabled: !product.enabled } : product
    ));
  };

  // Import from Google Sheets format
  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newProducts: KofiProduct[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const productData: any = {};
          
          headers.forEach((header, index) => {
            productData[header] = values[index] || '';
          });
          
          // Map CSV columns to Ko-fi product structure
          const product: KofiProduct = {
            nombre: productData.nombre || productData.name || productData.title || '',
            descripcion: productData.descripcion || productData.description || '',
            resumen: productData.resumen || productData.summary || productData.subtitle || '',
            precio: parseFloat(productData.precio || productData.price) || 0,
            urlEntrega: productData['url de entrega'] || productData.url || productData.link || '',
            imagen: productData.imagen || productData.image || '',
            buyerMessage: productData['buyer message'] || productData.message || '',
            enabled: true
          };
          
          if (product.nombre && product.urlEntrega && product.precio > 0) {
            newProducts.push(product);
          }
        }
        
        setProducts(prev => [...prev, ...newProducts]);
        alert(`Imported ${newProducts.length} products from CSV`);
      } catch (error) {
        alert('Error parsing CSV file');
      }
    };
    
    reader.readAsText(file);
  };

  // Generate manual instructions
  const generateInstructions = () => {
    const enabledProducts = products.filter(p => p.enabled);
    if (enabledProducts.length === 0) return;

    const instructions = enabledProducts.map((product, index) => {
      return `
Product ${index + 1}: ${product.nombre}
- Go to: ${KOFI_SHOP_URL}
- Name: ${product.nombre}
- Description: ${product.descripcion}
- Summary: ${product.resumen}
- Price: $${product.precio}
- Delivery URL: ${product.urlEntrega}
${product.imagen ? `- Image: ${product.imagen}` : ''}
${product.buyerMessage ? `- Buyer Message: ${product.buyerMessage}` : ''}
- Accept terms and publish
---`;
    }).join('\n\n');

    // Download as text file
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kofi-upload-instructions.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coffee className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Ko-fi Integration</h2>
          <Badge variant="outline">Upload products to Ko-fi</Badge>
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
          
          <Button
            variant="outline"
            onClick={generateInstructions}
            disabled={products.filter(p => p.enabled).length === 0}
          >
            <FileImage className="mr-2 h-4 w-4" />
            Manual Instructions
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
            <CardTitle>Ko-fi Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profilePath">Chrome Profile Path</Label>
                <Input
                  id="profilePath"
                  value={settings.profilePath}
                  onChange={(e) => setSettings(prev => ({ ...prev, profilePath: e.target.value }))}
                  placeholder="C:/Users/USER/Chrome/Profile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uploadDelay">Upload Delay (ms)</Label>
                <Input
                  id="uploadDelay"
                  type="number"
                  min="1000"
                  value={settings.uploadDelay}
                  onChange={(e) => setSettings(prev => ({ ...prev, uploadDelay: parseInt(e.target.value) || 2000 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryAttempts">Retry Attempts</Label>
                <Input
                  id="retryAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.retryAttempts}
                  onChange={(e) => setSettings(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) || 3 }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoTerms"
                  checked={settings.autoTermsAccept}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoTermsAccept: checked }))}
                />
                <Label htmlFor="autoTerms">Auto-accept terms</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="headless"
                  checked={settings.headless}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, headless: checked }))}
                />
                <Label htmlFor="headless">Headless mode</Label>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ko-fi automation requires browser automation. Make sure you're logged into Ko-fi in your specified Chrome profile.
                This feature simulates the upload process and provides manual instructions.
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

      {/* Add New Product */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Product Name *</Label>
              <Input
                id="nombre"
                value={currentProduct.nombre}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Amazing Game Deal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Price (USD) *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                value={currentProduct.precio}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumen">Summary</Label>
            <Input
              id="resumen"
              value={currentProduct.resumen}
              onChange={(e) => setCurrentProduct(prev => ({ ...prev, resumen: e.target.value }))}
              placeholder="Short description for the product card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Description</Label>
            <Textarea
              id="descripcion"
              value={currentProduct.descripcion}
              onChange={(e) => setCurrentProduct(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Detailed product description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urlEntrega">Delivery URL *</Label>
              <Input
                id="urlEntrega"
                value={currentProduct.urlEntrega}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, urlEntrega: e.target.value }))}
                placeholder="https://example.com/download"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagen">Image URL</Label>
              <Input
                id="imagen"
                value={currentProduct.imagen}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, imagen: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerMessage">Buyer Message</Label>
            <Textarea
              id="buyerMessage"
              value={currentProduct.buyerMessage}
              onChange={(e) => setCurrentProduct(prev => ({ ...prev, buyerMessage: e.target.value }))}
              placeholder="Instructions for the buyer after purchase"
              rows={2}
            />
          </div>

          <Button onClick={addProduct} className="w-full">
            Add Product
          </Button>
        </CardContent>
      </Card>

      {/* Products Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload Queue ({products.filter(p => p.enabled).length} enabled)</span>
            <div className="flex items-center gap-2">
              {products.length > 0 && (
                <Button 
                  onClick={startUpload}
                  disabled={progress.status === 'uploading' || products.filter(p => p.enabled).length === 0}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Upload (Simulated)
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No products in queue. Add some products above or import from CSV.
            </p>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {products.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={product.enabled}
                        onCheckedChange={() => toggleProduct(index)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{product.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          ${product.precio} • {product.resumen}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(index)}
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