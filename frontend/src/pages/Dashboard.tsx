import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, ThumbsUp, Share2, Clock, Calendar, Youtube, FileText, Rss, Globe, Loader2, AlertCircle, BookOpen, Sparkles } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';
import { newsletterDisplayService } from '@/services/newsletterDisplayService';
import NewsletterDisplay from '@/components/NewsletterDisplay';

const API_URL = 'http://localhost:5001/api';

// Update the dot pattern style for better coverage
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

interface Summary {
  _id: string;
  title: string;
  sourceUrl: string;
  sourceType: string;
  createdAt: string;
  summary: string;
  topics: string[];
  userId: string;
  saved?: boolean;
}

interface Newsletter {
  _id: string;
  title: string;
  content: string;
  topics: string[];
  summaries: string[];
  status: string;
  scheduledDate: string;
  sentAt?: string;
}

const sourceTypeIcons: { [key: string]: React.ReactElement } = {
  article: <Globe className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  podcast: <Rss className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />
};

const Dashboard = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [recentSummaries, setRecentSummaries] = useState<Summary[]>([]);
  const [savedSummaries, setSavedSummaries] = useState<Summary[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [scheduledNewsletters, setScheduledNewsletters] = useState<Newsletter[]>([]);
  const [latestNewsletter, setLatestNewsletter] = useState<Newsletter | null>(null);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(true);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [isLoadingNewsletters, setIsLoadingNewsletters] = useState(true);
  const [isLoadingNewsletter, setIsLoadingNewsletter] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentSummaries = async () => {
      if (!token) return;

      try {
        setIsLoadingSummaries(true);
        const response = await axios.get(`${API_URL}/summaries`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setRecentSummaries(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch recent summaries:", error);
        setError("Failed to load recent summaries. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load recent summaries. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSummaries(false);
      }
    };

    fetchRecentSummaries();
  }, [token, toast]);

  useEffect(() => {
    const fetchSavedSummaries = async () => {
      if (!token) return;

      try {
        setIsLoadingSaved(true);
        const response = await axios.get(`${API_URL}/users/saved-summaries`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const savedItems = response.data.data || [];
        setSavedSummaries(savedItems);
        setSavedIds(savedItems.map((item: Summary) => item._id));
      } catch (error) {
        console.error("Failed to fetch saved summaries:", error);
        setSavedSummaries([]);
        setSavedIds([]);
      } finally {
        setIsLoadingSaved(false);
      }
    };

    fetchSavedSummaries();
  }, [token]);

  useEffect(() => {
    const fetchScheduledNewsletters = async () => {
      if (!token) return;

      try {
        setIsLoadingNewsletters(true);
        const response = await axios.get(`${API_URL}/newsletters`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const allNewsletters = response.data.data || [];
        const scheduled = allNewsletters.filter((newsletter: Newsletter) =>
          newsletter.status === 'scheduled' && new Date(newsletter.scheduledDate) > new Date()
        );

        setScheduledNewsletters(scheduled);
      } catch (error) {
        console.error("Failed to fetch scheduled newsletters:", error);
        toast({
          title: "Error",
          description: "Failed to load newsletter schedule. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingNewsletters(false);
      }
    };

    fetchScheduledNewsletters();
  }, [token, toast]);

  useEffect(() => {
    const fetchLatestNewsletter = async () => {
      if (!token) return;

      try {
        setIsLoadingNewsletter(true);
        const newsletter = await newsletterDisplayService.getLatestNewsletter(token);
        setLatestNewsletter(newsletter);
      } catch (error) {
        console.error("Failed to fetch latest newsletter:", error);
      } finally {
        setIsLoadingNewsletter(false);
      }
    };

    fetchLatestNewsletter();
  }, [token]);

  const toggleSave = async (summaryId: string) => {
    if (!token || isProcessing === summaryId) return;

    setIsProcessing(summaryId);

    try {
      if (savedIds.includes(summaryId)) {
        await axios.delete(`${API_URL}/users/saved-summaries/${summaryId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setSavedIds(prev => prev.filter(id => id !== summaryId));
        setSavedSummaries(prev => prev.filter(summary => summary._id !== summaryId));

        toast({
          title: "Removed from saved",
          description: "Summary has been removed from your saved items",
          variant: "default",
        });
      } else {
        await axios.post(`${API_URL}/users/saved-summaries/${summaryId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setSavedIds(prev => [...prev, summaryId]);

        const summaryToSave = recentSummaries.find(s => s._id === summaryId);
        if (summaryToSave) {
          setSavedSummaries(prev => [...prev, summaryToSave]);
        }

        toast({
          title: "Saved",
          description: "Summary has been saved to your collection",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Failed to save/unsave summary:", error);
      toast({
        title: "Error",
        description: "Failed to update saved items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const rateSummary = async (summaryId: string) => {
    if (!token) return;

    try {
      await axios.post(`${API_URL}/summaries/${summaryId}/rate`, {
        rating: 'helpful'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our summaries",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to rate summary:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareSummary = (summaryId: string, title: string) => {
    const shareLink = `${window.location.origin}/share/${summaryId}`;

    navigator.clipboard.writeText(shareLink).then(() => {
      toast({
        title: "Link copied!",
        description: `Link to "${title}" has been copied to clipboard`,
        variant: "success",
      });
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    });
  };

  const handleNewSummary = () => {
    navigate('/sources');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(dateString);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-12 relative">
      <div style={dotPatternStyle}></div>

      <div className="container mx-auto max-w-6xl py-8 px-4 relative ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm text-sm font-medium shadow-sm mb-2">
              <div className="flex h-2 w-2 rounded-full bg-purple-600 mr-2"></div>
              <span className="text-gray-700">Your Personal Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-gray-700 mt-1">Your personalized content digest awaits</p>
          </div>
          <Button
            className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            onClick={handleNewSummary}
          >
            <Sparkles className="h-4 w-4 mr-2" /> New Content
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="newsletter" className="w-full">
              <TabsList className="mb-6 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
                <TabsTrigger
                  value="newsletter"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Your Newsletter
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
                >
                  <Bookmark className="h-4 w-4 mr-2" /> Saved Items
                </TabsTrigger>
              </TabsList>

              <TabsContent value="newsletter" className="focus-visible:outline-none focus-visible:ring-0">
                {isLoadingNewsletter ? (
                  <NewsletterDisplay loading={true} newsletter={null} />
                ) : error ? (
                  <Card className="border-0 shadow-xl rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden group transition-all">
                    <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-red-500/10 rounded-full"></div>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                      <h3 className="text-xl font-medium mb-2">Error Loading Content</h3>
                      <p className="text-gray-600 mb-6">{error}</p>
                      <Button
                        variant="outline"
                        className="border-gray-200 hover:bg-white shadow-sm"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <NewsletterDisplay newsletter={latestNewsletter} />
                )}
              </TabsContent>

              <TabsContent value="saved" className="focus-visible:outline-none focus-visible:ring-0">
                {isLoadingSaved ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                  </div>
                ) : savedSummaries.length > 0 ? (
                  <div className="space-y-6">
                    {savedSummaries.map(summary => (
                      <Card key={summary._id} className="border border-gray-100 shadow-lg rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-500/10 rounded-full"></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl font-medium">{summary.title}</CardTitle>
                              <CardDescription className="flex items-center mt-1 text-gray-600">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                  {sourceTypeIcons[summary.sourceType] || <Globe className="h-4 w-4 text-blue-600" />}
                                </div>
                                <span>{summary.sourceUrl}</span>
                                <span className="mx-2">•</span>
                                <Clock className="h-3 w-3 text-gray-500" />
                                <span className="ml-1">{getRelativeTime(summary.createdAt)}</span>
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSave(summary._id)}
                              disabled={isProcessing === summary._id}
                              className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                            >
                              {isProcessing === summary._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Bookmark className="h-5 w-5 fill-current" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{summary.summary}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {summary.topics.map(topic => (
                              <Badge key={topic} variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t mt-2 pt-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rateSummary(summary._id)}
                              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" /> Helpful
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shareSummary(summary._id, summary.title)}
                              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <Share2 className="h-4 w-4 mr-1" /> Share
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(summary.sourceUrl, '_blank')}
                            className="border-gray-200 hover:bg-white hover:shadow-sm"
                          >
                            Read Full Content
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden group transition-all">
                    <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-500/10 rounded-full"></div>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                        <Bookmark className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-medium">No saved items yet</h3>
                      <p className="text-gray-600 text-center mt-2 max-w-md">
                        Bookmark interesting summaries to build your personal knowledge library
                      </p>
                      <Button
                        className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                        onClick={handleNewSummary}
                      >
                        Discover Content
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden group transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-green-500/10 rounded-full"></div>
              <CardHeader>
                <CardTitle className="text-xl font-medium">Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Avatar className="h-16 w-16 border-2 border-purple-100 shadow-sm">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=8b5cf6&color=fff`}
                      alt={user?.name || 'User'}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-medium text-lg">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2 text-gray-700">Your Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {user?.preferences?.topics && user.preferences.topics.length > 0 ? (
                      user.preferences.topics.map((topic: string) => (
                        <Badge key={topic} className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-purple-700 border border-purple-100 hover:from-purple-600/20 hover:to-blue-600/20">
                          {topic}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No topics selected yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 hover:bg-white hover:shadow-sm"
                  onClick={() => navigate('/profile')}
                >
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-0 shadow-lg rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden group transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-pink-500/10 rounded-full"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-medium">Upcoming Newsletters</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNewsletters ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : scheduledNewsletters.length > 0 ? (
                  <div className="space-y-3">
                    {scheduledNewsletters.map(newsletter => (
                      <div
                        key={newsletter._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-indigo-50/50 to-purple-50/50 hover:from-indigo-100/50 hover:to-purple-100/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <Calendar className="h-4 w-4 text-indigo-600" />
                            </div>
                            <p className="font-medium text-gray-800">{formatDate(newsletter.scheduledDate)}</p>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2 ml-11">
                            {newsletter.topics.slice(0, 2).map(topic => (
                              <Badge key={topic} variant="outline" className="text-xs bg-white/70 text-gray-700 border-gray-200">
                                {topic}
                              </Badge>
                            ))}
                            {newsletter.topics.length > 2 && (
                              <Badge variant="outline" className="text-xs bg-white/70 text-gray-700 border-gray-200">
                                +{newsletter.topics.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-medium px-3 py-1 rounded-full bg-white shadow-sm text-indigo-600">
                          {newsletter.summaries.length} items
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
                      <Calendar className="h-8 w-8 text-pink-600" />
                    </div>
                    <p className="text-gray-700">No upcoming newsletters</p>
                    <p className="text-sm text-gray-500 mt-1">Schedule your next content digest</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 hover:bg-white hover:shadow-sm"
                  onClick={() => navigate('/newsletters')}
                >
                  Manage Newsletters
                </Button>
              </CardFooter>
            </Card>

            <div className="hidden lg:block bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Knowledge at your fingertips</h3>
              <p className="text-sm text-gray-600 mt-2">
                Stay informed with personalized content summaries delivered to your inbox
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Dashboard;