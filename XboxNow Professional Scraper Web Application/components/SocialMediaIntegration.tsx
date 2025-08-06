import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Share2, 
  MessageSquare, 
  Twitter, 
  Instagram, 
  Send,
  Settings,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Game } from '../types/scraper';

interface SocialMediaIntegrationProps {
  selectedGames: Game[];
}

export function SocialMediaIntegration({ selectedGames }: SocialMediaIntegrationProps) {
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [discordEnabled, setDiscordEnabled] = useState(false);
  const [twitterEnabled, setTwitterEnabled] = useState(false);
  const [instagramEnabled, setInstagramEnabled] = useState(false);
  const [customMessage, setCustomMessage] = useState('🎮 New Xbox Game Deal Alert!\n\n{title} is now {discount}% off!\nWas: ${originalPrice}\nNow: ${currentPrice}\n\n🔗 {url}');
  const [isPosting, setIsPosting] = useState(false);

  const handleDiscordPost = async () => {
    if (!discordWebhook.trim()) {
      alert('Please enter a Discord webhook URL');
      return;
    }

    if (selectedGames.length === 0) {
      alert('Please select games to post');
      return;
    }

    setIsPosting(true);

    try {
      for (const game of selectedGames.slice(0, 5)) { // Limit to 5 games
        const message = customMessage
          .replace('{title}', game.title)
          .replace('{discount}', game.discount.toString())
          .replace('{originalPrice}', game.originalPriceUsd.toFixed(2))
          .replace('{currentPrice}', game.lowestPriceUsd.toFixed(2))
          .replace('{url}', game.url);

        // Simulate Discord webhook post
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Posted to Discord:', message);
      }

      alert(`Successfully posted ${Math.min(selectedGames.length, 5)} games to Discord!`);
    } catch (error) {
      alert('Error posting to Discord: ' + (error as Error).message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleTwitterPost = async () => {
    if (selectedGames.length === 0) {
      alert('Please select games to post');
      return;
    }

    setIsPosting(true);

    try {
      // Simulate Twitter API post
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const game = selectedGames[0];
      const tweetText = `🎮 ${game.title} is ${game.discount}% off! Get it now for $${game.lowestPriceUsd}! #Xbox #Gaming #Deal`;
      
      console.log('Posted to Twitter:', tweetText);
      alert('Successfully posted to Twitter!');
    } catch (error) {
      alert('Error posting to Twitter: ' + (error as Error).message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleInstagramPost = async () => {
    if (selectedGames.length === 0) {
      alert('Please select games to post');
      return;
    }

    setIsPosting(true);

    try {
      // Simulate Instagram API post
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Posted to Instagram');
      alert('Successfully posted to Instagram!');
    } catch (error) {
      alert('Error posting to Instagram: ' + (error as Error).message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Social Media Integration</h2>
          <Badge variant="outline">{selectedGames.length} games selected</Badge>
        </div>
      </div>

      {/* Platform Tabs */}
      <Tabs defaultValue="discord" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discord">
            <MessageSquare className="mr-2 h-4 w-4" />
            Discord
          </TabsTrigger>
          <TabsTrigger value="twitter">
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </TabsTrigger>
          <TabsTrigger value="instagram">
            <Instagram className="mr-2 h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Discord Tab */}
        <TabsContent value="discord" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Discord Integration
                <Switch
                  checked={discordEnabled}
                  onCheckedChange={setDiscordEnabled}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                <Input
                  id="discordWebhook"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  disabled={!discordEnabled}
                />
                <p className="text-sm text-muted-foreground">
                  Create a webhook in your Discord server settings
                </p>
              </div>

              <div className="space-y-2">
                <Label>Message Preview</Label>
                <div className="p-3 bg-muted rounded-lg">
                  {selectedGames.length > 0 ? (
                    <div className="space-y-2">
                      {selectedGames.slice(0, 3).map((game) => (
                        <div key={game.id} className="text-sm">
                          🎮 {game.title} is {game.discount}% off!<br />
                          Was: ${game.originalPriceUsd.toFixed(2)}<br />
                          Now: ${game.lowestPriceUsd.toFixed(2)}<br />
                          🔗 {game.url}
                        </div>
                      ))}
                      {selectedGames.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{selectedGames.length - 3} more games...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Select games to preview messages
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleDiscordPost}
                disabled={!discordEnabled || isPosting || selectedGames.length === 0}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {isPosting ? 'Posting...' : `Post to Discord (${Math.min(selectedGames.length, 5)} games)`}
              </Button>

              {selectedGames.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No games selected. Please select games in the main table first.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Twitter Tab */}
        <TabsContent value="twitter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Twitter className="h-5 w-5" />
                Twitter Integration
                <Switch
                  checked={twitterEnabled}
                  onCheckedChange={setTwitterEnabled}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Twitter API integration requires API keys. This is a demo version.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Tweet Preview</Label>
                <div className="p-3 bg-muted rounded-lg">
                  {selectedGames.length > 0 ? (
                    <div className="text-sm">
                      🎮 {selectedGames[0].title} is {selectedGames[0].discount}% off! Get it now for ${selectedGames[0].lowestPriceUsd}! #Xbox #Gaming #Deal
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Select games to preview tweet
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleTwitterPost}
                disabled={!twitterEnabled || isPosting || selectedGames.length === 0}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {isPosting ? 'Posting...' : 'Post to Twitter'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Instagram Integration
                <Switch
                  checked={instagramEnabled}
                  onCheckedChange={setInstagramEnabled}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Instagram API integration requires Meta Business account. This is a demo version.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Post Preview</Label>
                <div className="p-3 bg-muted rounded-lg">
                  {selectedGames.length > 0 ? (
                    <div className="text-sm">
                      🎮 Amazing Xbox deal! {selectedGames[0].title} is now {selectedGames[0].discount}% off! 
                      #Xbox #Gaming #Deal #VideoGames
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Select games to preview post
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleInstagramPost}
                disabled={!instagramEnabled || isPosting || selectedGames.length === 0}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {isPosting ? 'Posting...' : 'Post to Instagram'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customMessage">Custom Message Template</Label>
                <Textarea
                  id="customMessage"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={6}
                  placeholder="Enter your custom message template..."
                />
                <p className="text-sm text-muted-foreground">
                  Available variables: {'{title}'}, {'{discount}'}, {'{originalPrice}'}, {'{currentPrice}'}, {'{url}'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Platform Status</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Discord</span>
                    <Badge variant={discordEnabled ? "default" : "secondary"}>
                      {discordEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Twitter</span>
                    <Badge variant={twitterEnabled ? "default" : "secondary"}>
                      {twitterEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Instagram</span>
                    <Badge variant={instagramEnabled ? "default" : "secondary"}>
                      {instagramEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}