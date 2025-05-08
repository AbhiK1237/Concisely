import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Rss, File, Globe, Loader2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const ContentSourceInput = () => {
  const [activeTab, setActiveTab] = useState("article");
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  type ResultType = { summary?: string; error?: string } | null;
  const [result, setResult] = useState<ResultType>(null);

  const handleSubmit = async () => {
    if (!url && !file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      let response;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (activeTab === "document" && file) {
        // Handle file upload
        const formData = new FormData();
        formData.append('document', file);
        const fileName = file.name;
        const titleFromFileName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        formData.append('title', titleFromFileName);

        response = await axios.post(`${API_URL}/summaries/document`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // Handle URL-based summarization
        response = await axios.post(`${API_URL}/summaries/${activeTab}`, {
          url: url
        }, { headers });
      }

      if (response.data) {
        // Check if the summary is in response.data.data structure (common for API response wrappers)
        if (response.data.data && response.data.data.summary) {
          setResult({ summary: response.data.data.summary });
        }
        // Or if it's directly in response.data
        else if (response.data.summary) {
          setResult({ summary: response.data.summary });
        }
        // If you can't find the summary anywhere, log the response to debug
        else {
          console.log("Response structure:", response.data);
          setResult({ error: "Summary not found in response" });
        }

        toast({
          title: "Summary generated",
          description: "Your content has been successfully summarized",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error processing content:", error);
      setResult({ error: "Failed to process content. Please try again." });
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCopySummary = () => {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard.",
        variant: "success",
      });
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
        return "Enter document URL (or use the upload button below)";
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

  // Utility to strip markdown bold/italic and convert to HTML
  function formatSummaryToHtml(summary: string): string {
    // Remove ** and __ for bold, * and _ for italic, but keep the text
    let html = summary
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-primary-700">$1</span>')
      .replace(/__(.*?)__/g, '<span class="font-semibold text-primary-700">$1</span>')
      .replace(/\*(.*?)\*/g, '<span class="italic text-primary-500">$1</span>')
      .replace(/_(.*?)_/g, '<span class="italic text-primary-500">$1</span>');
    // Convert line breaks to <br>
    html = html.replace(/\n/g, "<br>");
    return html;
  }

  // Show only the first 3 lines as preview if collapsed
  function getPreview(summary: string): string {
    const lines = summary.split('\n');
    return lines.slice(0, 3).join(' ') + (lines.length > 3 ? ' ...' : '');
  }

  return (
    <>
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
                      disabled={isProcessing || (!url && !file)}
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
                    <Label htmlFor="document-upload" className="block mb-2">Or upload a document:</Label>
                    <div className="flex items-center">
                      <Input
                        id="document-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                        className="flex-grow"
                      />
                      {file && (
                        <Button
                          onClick={handleSubmit}
                          disabled={isProcessing}
                          className="ml-2"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>Upload & Summarize</>
                          )}
                        </Button>
                      )}
                    </div>
                    {file && (
                      <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Enhanced summary result display with color and collapse/expand */}
            {result && !result.error && (
              <div className="mt-8 flex justify-center">
                <Card className="w-full max-w-2xl shadow-lg border-0" style={{
                  background: "linear-gradient(135deg, #f0f4ff 0%, #e0f7fa 100%)",
                  boxShadow: "0 4px 24px 0 rgba(80, 120, 200, 0.10)"
                }}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg text-primary-800">Summary</CardTitle>
                      <CardDescription className="text-primary-500 text-xs mt-1">
                        AI-generated concise summary of your content
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(c => !c)}
                        className="hover:bg-primary/10"
                        aria-label={collapsed ? "Expand summary" : "Collapse summary"}
                      >
                        {collapsed ? (
                          <ChevronDown className="h-5 w-5 text-primary-700" />
                        ) : (
                          <ChevronUp className="h-5 w-5 text-primary-700" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopySummary}
                        className="hover:bg-primary/10"
                        aria-label="Copy summary"
                      >
                        <Copy className="h-5 w-5 text-primary-700" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none text-gray-900 leading-relaxed whitespace-pre-line"
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        color: "#1a237e"
                      }}
                      dangerouslySetInnerHTML={{
                        __html: collapsed
                          ? formatSummaryToHtml(getPreview(result.summary!))
                          : formatSummaryToHtml(result.summary!)
                      }}
                    />
                    {collapsed && (
                      <div className="text-xs text-primary-400 mt-2">
                        (Preview only. Click expand to see full summary.)
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-end">
                    <span className="text-xs text-primary-500">Powered by AI</span>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Error display */}
            {result && result.error && (
              <div className="mt-8 flex justify-center">
                <Card className="w-full max-w-2xl border-0" style={{
                  background: "linear-gradient(135deg, #ffeaea 0%, #fff5f5 100%)",
                  boxShadow: "0 4px 24px 0 rgba(200, 80, 80, 0.10)"
                }}>
                  <CardHeader>
                    <CardTitle className="text-destructive text-base">Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-destructive">{result.error}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </>
  );
};

export default ContentSourceInput;