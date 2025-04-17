import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Rss, File, Globe, Loader2 } from "lucide-react";
import { Label } from '@/components/ui/label';

const ContentSourceInput = () => {
  const [activeTab, setActiveTab] = useState("article");
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  type ResultType = { summary?: string; error?: string } | null;
  const [result, setResult] = useState<ResultType>(null);

  const handleSubmit = async () => {
    if (!url) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      // This would connect to your backend API
      const response = await fetch(`/api/summarize/${activeTab}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error processing content:", error);
      setResult({ error: "Failed to process content. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case "article":
        return "Enter article URL (e.g., https://example.com/article)";
      case "youtube":
        return "Enter YouTube video URL";
      case "podcast":
        return "Enter podcast episode URL or RSS feed";
      case "document":
        return "Upload a PDF or paste a document URL";
      default:
        return "Enter URL";
    }
  };

  const getIcon = () => {
    switch (activeTab) {
      case "article":
        return <Globe className="h-4 w-4 mr-2" />;
      case "youtube":
        return <Youtube className="h-4 w-4 mr-2" />;
      case "podcast":
        return <Rss className="h-4 w-4 mr-2" />;
      case "document":
        return <File className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-items-center w-[80vw]">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add Content to Summarize</CardTitle>
          <CardDescription>
            Enter a URL or upload a file to generate a summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="article" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="article">Article</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="podcast">Podcast</TabsTrigger>
              <TabsTrigger value="document">Document</TabsTrigger>
            </TabsList>
            
            <TabsContent value="article" className="space-y-4">
              <div>
                <Label htmlFor="article-url">Article URL</Label>
                <div className="flex mt-1.5">
                  <Input
                    id="article-url"
                    placeholder={getPlaceholder()}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isProcessing || !url} 
                    className="ml-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>{getIcon()}Summarize</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="youtube" className="space-y-4">
              <div>
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <div className="flex mt-1.5">
                  <Input
                    id="youtube-url"
                    placeholder={getPlaceholder()}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isProcessing || !url} 
                    className="ml-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>{getIcon()}Summarize</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="podcast" className="space-y-4">
              <div>
                <Label htmlFor="podcast-url">Podcast URL</Label>
                <div className="flex mt-1.5">
                  <Input
                    id="podcast-url"
                    placeholder={getPlaceholder()}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isProcessing || !url} 
                    className="ml-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>{getIcon()}Summarize</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="document" className="space-y-4">
              <div>
                <Label htmlFor="document-url">Document URL or Upload</Label>
                <div className="flex mt-1.5">
                  <Input
                    id="document-url"
                    placeholder={getPlaceholder()}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isProcessing || !url} 
                    className="ml-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>{getIcon()}Summarize</>
                    )}
                  </Button>
                </div>
                <div className="mt-2">
                  <Button variant="outline" className="w-full">
                    <File className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {result && !result.error && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Summary Preview:</h3>
              <p className="text-gray-700">{result.summary}</p>
            </div>
          )}

          {result && result.error && (
            <div className="mt-6 p-4 border rounded-md bg-red-50 text-red-800">
              {result.error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSourceInput;