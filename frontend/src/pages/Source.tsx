import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Rss, File, Globe, Loader2, Copy, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Add dot pattern style for design consistency
const dotPatternStyle: React.CSSProperties = {
  backgroundSize: '24px 24px',
  backgroundImage: `radial-gradient(circle, rgba(128, 90, 213, 0.1) 2px, transparent 2px)`,
  backgroundPosition: '0 0',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
};

const ContentSourceInput = () => {
  const [activeTab, setActiveTab] = useState("article");
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-12 relative">
      <div style={dotPatternStyle}></div>

      <div className="container mx-auto max-w-6xl py-8 px-4 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm text-sm font-medium shadow-sm mb-2">
              <div className="flex h-2 w-2 rounded-full bg-purple-600 mr-2"></div>
              <span className="text-gray-700">Content Source</span>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Add Content to Summarize
            </h1>
            <p className="text-gray-700 mt-1">Enter a URL or upload a document to generate an AI summary</p>
          </div>
          <Button
            className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            onClick={() => navigate('/dashboard')}
          >
            <Sparkles className="h-4 w-4 mr-2" /> View Summaries
          </Button>
        </div>

        <Card className="border-0 shadow-xl rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden group transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-500/10 rounded-full"></div>

          <CardContent className="py-6 px-6">
            <Tabs defaultValue="article" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-8 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
                <TabsTrigger
                  value="article"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Globe className="h-4 w-4 mr-2" /> Article
                </TabsTrigger>
                <TabsTrigger
                  value="youtube"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Youtube className="h-4 w-4 mr-2" /> YouTube
                </TabsTrigger>
                <TabsTrigger
                  value="podcast"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Rss className="h-4 w-4 mr-2" /> Podcast
                </TabsTrigger>
                <TabsTrigger
                  value="document"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <File className="h-4 w-4 mr-2" /> Document
                </TabsTrigger>
              </TabsList>

              <TabsContent value="article" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                <div>
                  <Label htmlFor="article-url" className="text-base font-medium text-gray-700 mb-2 block">Article URL</Label>
                  <div className="flex mt-1.5">
                    <Input
                      id="article-url"
                      placeholder={getPlaceholder()}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-grow shadow-sm focus:border-purple-500"
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={isProcessing || !url}
                      className="ml-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
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

              <TabsContent value="youtube" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                <div>
                  <Label htmlFor="youtube-url" className="text-base font-medium text-gray-700 mb-2 block">YouTube URL</Label>
                  <div className="flex mt-1.5">
                    <Input
                      id="youtube-url"
                      placeholder={getPlaceholder()}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-grow shadow-sm focus:border-purple-500"
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={isProcessing || !url}
                      className="ml-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
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

              <TabsContent value="podcast" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                <div>
                  <Label htmlFor="podcast-url" className="text-base font-medium text-gray-700 mb-2 block">Podcast URL</Label>
                  <div className="flex mt-1.5">
                    <Input
                      id="podcast-url"
                      placeholder={getPlaceholder()}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-grow shadow-sm focus:border-purple-500"
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={isProcessing || !url}
                      className="ml-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
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

              <TabsContent value="document" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                <div>
                  <Label htmlFor="document-url" className="text-base font-medium text-gray-700 mb-2 block">Document URL or Upload</Label>
                  <div className="flex mt-1.5">
                    <Input
                      id="document-url"
                      placeholder={getPlaceholder()}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-grow shadow-sm focus:border-purple-500"
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={isProcessing || (!url && !file)}
                      className="ml-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>{getIcon()}Summarize</>
                      )}
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="document-upload" className="text-base font-medium text-gray-700 mb-2 block">Or upload a document:</Label>
                    <div className="flex items-center">
                      <div className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                        <Input
                          id="document-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileChange}
                          className="w-full"
                        />
                        {file && (
                          <div className="mt-3 flex items-center">
                            <File className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {file && (
                      <Button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="mt-3 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <File className="h-4 w-4 mr-2" />
                        )}
                        Upload & Summarize
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Enhanced summary result display with color and collapse/expand */}
            {result && !result.error && (
              <div className="mt-8">
                <Card className="w-full shadow-xl border-0 rounded-xl overflow-hidden" style={{
                  background: "linear-gradient(135deg, #f0f4ff 0%, #e0f7fa 100%)",
                  boxShadow: "0 10px 40px 0 rgba(80, 120, 200, 0.15)"
                }}>
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-500/10 rounded-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-xl font-semibold text-primary-800">Summary</CardTitle>
                      <CardDescription className="text-primary-600 text-sm mt-1">
                        AI-generated concise summary of your content
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(c => !c)}
                        className="hover:bg-primary/10 rounded-full"
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
                        className="hover:bg-primary/10 rounded-full"
                        aria-label="Copy summary"
                      >
                        <Copy className="h-5 w-5 text-primary-700" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div
                      className="prose prose-sm max-w-none text-gray-900 leading-relaxed whitespace-pre-line rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        borderRadius: "0.75rem",
                        padding: "1.25rem",
                        color: "#1a237e",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05) inset"
                      }}
                      dangerouslySetInnerHTML={{
                        __html: collapsed
                          ? formatSummaryToHtml(getPreview(result.summary!))
                          : formatSummaryToHtml(result.summary!)
                      }}
                    />
                    {collapsed && (
                      <div className="text-xs text-primary-500 mt-3 text-center">
                        (Click expand to see full summary)
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-end">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">Powered by AI</span>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Error display */}
            {result && result.error && (
              <div className="mt-8">
                <Card className="w-full border-0 shadow-xl rounded-xl overflow-hidden" style={{
                  background: "linear-gradient(135deg, #ffeaea 0%, #fff5f5 100%)",
                  boxShadow: "0 10px 40px 0 rgba(200, 80, 80, 0.15)"
                }}>
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-red-500/10 rounded-full"></div>
                  <CardHeader>
                    <CardTitle className="text-destructive text-xl font-semibold">Error</CardTitle>
                    <CardDescription className="text-red-600">We couldn't process your request</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="bg-white/85 rounded-xl p-5 text-red-700">
                      {result.error}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setResult(null)}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default ContentSourceInput;