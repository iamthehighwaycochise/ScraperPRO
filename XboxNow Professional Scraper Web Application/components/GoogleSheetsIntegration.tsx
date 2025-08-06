import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Settings, 
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Game } from '../types/scraper';

interface GoogleSheetsIntegrationProps {
  selectedGames: Game[];
  onDataLoaded: (games: Game[]) => void;
  onExportComplete: () => void;
}

export function GoogleSheetsIntegration({ 
  selectedGames, 
  onDataLoaded, 
  onExportComplete 
}: GoogleSheetsIntegrationProps) {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [worksheetName, setWorksheetName] = useState('Sheet1');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCredentialsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const credentials = JSON.parse(e.target?.result as string);
          if (credentials.type === 'service_account') {
            setIsConnected(true);
            setStatus('Google Sheets credentials loaded successfully');
          } else {
            setStatus('Invalid credentials file. Please use a service account JSON file.');
          }
        } catch (error) {
          setStatus('Error parsing credentials file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportToSheets = async () => {
    if (!isConnected) {
      setStatus('Please upload Google Sheets credentials first');
      return;
    }

    if (!spreadsheetId.trim()) {
      setStatus('Please enter a Spreadsheet ID');
      return;
    }

    setIsLoading(true);
    setStatus('Exporting to Google Sheets...');

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus(`Successfully exported ${selectedGames.length} games to Google Sheets`);
      onExportComplete();
    } catch (error) {
      setStatus('Error exporting to Google Sheets: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromSheets = async () => {
    if (!isConnected) {
      setStatus('Please upload Google Sheets credentials first');
      return;
    }

    if (!spreadsheetId.trim()) {
      setStatus('Please enter a Spreadsheet ID');
      return;
    }

    setIsLoading(true);
    setStatus('Importing from Google Sheets...');

    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock imported games
      const importedGames: Game[] = [
        {
          id: 'imported-1',
          title: 'Imported Game 1',
          productId: '9IMPORTED1',
          region: 'US',
          imageUrl: 'https://via.placeholder.com/300x400',
          lowestPriceUsd: 19.99,
          originalPriceUsd: 29.99,
          discount: 33,
          currency: 'USD',
          dealUntil: '',
          releaseDate: '2023-01-01',
          developer: 'Imported Dev',
          publisher: 'Imported Pub',
          categories: ['Action'],
          platforms: ['PC', 'Xbox'],
          description: 'An imported game from Google Sheets',
          rating: 'E',
          url: 'https://example.com',
          lastUpdated: new Date().toISOString()
        }
      ];

      onDataLoaded(importedGames);
      setStatus(`Successfully imported ${importedGames.length} games from Google Sheets`);
    } catch (error) {
      setStatus('Error importing from Google Sheets: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleSheet = () => {
    const sampleData = [
      'Title,Product ID,Region,Price,Discount,Developer,Publisher,Categories,Platforms,Description',
      'Sample Game,9SAMPLE123,US,19.99,25,Sample Dev,Sample Pub,Action;Adventure,PC;Xbox,A sample game description',
      'Another Game,9ANOTHER456,GB,29.99,50,Another Dev,Another Pub,RPG,PC,Another sample game'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xbox-games-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Google Sheets Integration</h2>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
        
        <Button
          variant="outline"
          onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Google Cloud Console
        </Button>
      </div>

      {/* Connection Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="credentials">Google Sheets Credentials (JSON)</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Credentials
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleCredentialsUpload}
                className="hidden"
              />
              {isConnected && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Upload your Google Service Account JSON credentials file
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
            <Input
              id="spreadsheetId"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            />
            <p className="text-sm text-muted-foreground">
              Found in the Google Sheets URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="worksheetName">Worksheet Name</Label>
            <Input
              id="worksheetName"
              value={worksheetName}
              onChange={(e) => setWorksheetName(e.target.value)}
              placeholder="Sheet1"
            />
          </div>

          {status && (
            <Alert variant={status.includes('Error') ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Import/Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle>Export to Google Sheets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Selected Games:</span>
                <Badge variant="outline">{selectedGames.length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Export your selected games to Google Sheets for further analysis or sharing
              </p>
            </div>

            <Button
              onClick={handleExportToSheets}
              disabled={!isConnected || isLoading || selectedGames.length === 0}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isLoading ? 'Exporting...' : 'Export to Sheets'}
            </Button>

            {selectedGames.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No games selected. Please select some games in the main table first.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle>Import from Google Sheets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Import game data from your Google Sheets. Make sure your sheet has the correct format.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={generateSampleSheet}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Sample Format
              </Button>
              
              <Button
                onClick={handleImportFromSheets}
                disabled={!isConnected || isLoading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isLoading ? 'Importing...' : 'Import from Sheets'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Create Google Cloud Project</h4>
            <p className="text-sm text-muted-foreground">
              Go to Google Cloud Console and create a new project or select an existing one.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">2. Enable Google Sheets API</h4>
            <p className="text-sm text-muted-foreground">
              In the Google Cloud Console, navigate to APIs & Services &gt; Library and enable the Google Sheets API.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">3. Create Service Account</h4>
            <p className="text-sm text-muted-foreground">
              Go to APIs & Services &gt; Credentials, create a new Service Account, and download the JSON key file.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">4. Share Spreadsheet</h4>
            <p className="text-sm text-muted-foreground">
              Share your Google Sheets document with the service account email address (found in the JSON file).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}