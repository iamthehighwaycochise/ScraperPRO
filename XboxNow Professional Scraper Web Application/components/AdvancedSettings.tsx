import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Settings, 
  Palette, 
  Globe, 
  Database, 
  Bell, 
  Download,
  Zap,
  Shield
} from 'lucide-react';

export function AdvancedSettings() {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [autoScraping, setAutoScraping] = useState(false);
  const [scrapingInterval, setScrapingInterval] = useState(60);
  const [maxRetries, setMaxRetries] = useState(3);
  const [requestDelay, setRequestDelay] = useState(1000);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [autoExport, setAutoExport] = useState(false);

  const handleReset = () => {
    setTheme('dark');
    setLanguage('en');
    setAutoScraping(false);
    setScrapingInterval(60);
    setMaxRetries(3);
    setRequestDelay(1000);
    setDesktopNotifications(true);
    setSoundNotifications(false);
    setExportFormat('csv');
    setAutoExport(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Advanced Settings</h2>
        </div>
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="scraping">
            <Database className="mr-2 h-4 w-4" />
            Scraping
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="mr-2 h-4 w-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Language</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scraping Settings */}
        <TabsContent value="scraping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoScraping"
                  checked={autoScraping}
                  onCheckedChange={setAutoScraping}
                />
                <Label htmlFor="autoScraping">Enable automatic scraping</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scrapingInterval">Scraping interval (minutes)</Label>
                <Input
                  id="scrapingInterval"
                  type="number"
                  min="5"
                  max="1440"
                  value={scrapingInterval}
                  onChange={(e) => setScrapingInterval(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRetries">Max retries per request</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="0"
                  max="10"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestDelay">Request delay (ms)</Label>
                <Input
                  id="requestDelay"
                  type="number"
                  min="100"
                  max="10000"
                  value={requestDelay}
                  onChange={(e) => setRequestDelay(parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="desktopNotifications"
                  checked={desktopNotifications}
                  onCheckedChange={setDesktopNotifications}
                />
                <Label htmlFor="desktopNotifications">Desktop notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="soundNotifications"
                  checked={soundNotifications}
                  onCheckedChange={setSoundNotifications}
                />
                <Label htmlFor="soundNotifications">Sound notifications</Label>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="freeGames" defaultChecked />
                    <Label htmlFor="freeGames">Free games found</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="bigDiscounts" defaultChecked />
                    <Label htmlFor="bigDiscounts">Big discounts (80%+)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="scrapingComplete" defaultChecked />
                    <Label htmlFor="scrapingComplete">Scraping completed</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Settings */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="exportFormat">Default export format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoExport"
                  checked={autoExport}
                  onCheckedChange={setAutoExport}
                />
                <Label htmlFor="autoExport">Auto-export after scraping</Label>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Export Options</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="includeImages" defaultChecked />
                    <Label htmlFor="includeImages">Include image URLs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="includeMetadata" defaultChecked />
                    <Label htmlFor="includeMetadata">Include metadata</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxConcurrent">Max concurrent requests</Label>
                <Input
                  id="maxConcurrent"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cacheSize">Cache size (MB)</Label>
                <Input
                  id="cacheSize"
                  type="number"
                  min="50"
                  max="1000"
                  defaultValue="100"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="enableCache" defaultChecked />
                <Label htmlFor="enableCache">Enable caching</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="enableCompression" defaultChecked />
                <Label htmlFor="enableCompression">Enable data compression</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch id="collectAnalytics" />
                <Label htmlFor="collectAnalytics">Send anonymous usage data</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="autoUpdate" defaultChecked />
                <Label htmlFor="autoUpdate">Auto-update application</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userAgent">Custom User-Agent</Label>
                <Input
                  id="userAgent"
                  placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proxyUrl">Proxy URL (optional)</Label>
                <Input
                  id="proxyUrl"
                  placeholder="http://proxy.example.com:8080"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}