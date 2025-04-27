import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, ThumbsUp, Share2, Clock, Calendar, Youtube, FileText, Rss, Globe, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

interface Summary {
  _id: string;
  title: string;
  sourceUrl: string; // Updated from 'source' to match backend
  sourceType: string;
  createdAt: string;
  summary: string;
  topics: string[];
  userId: string;
  saved?: boolean; // Added to track saved status
}

interface Newsletter {
  _id: string;
  scheduledDate: string;
  topics: string[];
  summaries: string[]; // Array of summary IDs
  status: string;
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

  const [isLoadingSummaries, setIsLoadingSummaries] = useState(true);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [isLoadingNewsletters, setIsLoadingNewsletters] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // For tracking save/unsave operations
  const [error, setError] = useState<string | null>(null);

  // Fetch all summaries (for the Recent tab)
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

  // Fetch saved summaries
  // Note: This is an implementation since the backend doesn't explicitly have a "saved" endpoint
  // We'll need to add a new route for this or track saved summaries in the user's profile
  useEffect(() => {
    const fetchSavedSummaries = async () => {
      if (!token) return;

      try {
        setIsLoadingSaved(true);
        // This is a placeholder - the actual endpoint would need to be created in the backend
        const response = await axios.get(`${API_URL}/users/saved-summaries`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Extract saved summaries and their IDs
        const savedItems = response.data.data || [];
        setSavedSummaries(savedItems);
        setSavedIds(savedItems.map((item: Summary) => item._id));
      } catch (error) {
        console.error("Failed to fetch saved summaries:", error);
        // For now, just set empty arrays if the endpoint doesn't exist
        setSavedSummaries([]);
        setSavedIds([]);
      } finally {
        setIsLoadingSaved(false);
      }
    };

    fetchSavedSummaries();
  }, [token]);

  // Fetch scheduled newsletters
  useEffect(() => {
    const fetchScheduledNewsletters = async () => {
      if (!token) return;

      try {
        setIsLoadingNewsletters(true);
        // Get all newsletters and filter the scheduled ones
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

  // Toggle save/unsave summary
  const toggleSave = async (summaryId: string) => {
    if (!token || isProcessing === summaryId) return;

    setIsProcessing(summaryId);

    try {
      // This is a placeholder - need to create these endpoints in the backend
      if (savedIds.includes(summaryId)) {
        // Unsave the summary
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
        // Save the summary
        await axios.post(`${API_URL}/users/saved-summaries/${summaryId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setSavedIds(prev => [...prev, summaryId]);

        // Find this summary in recentSummaries and add to savedSummaries
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

  // Rate a summary as helpful
  const rateSummary = async (summaryId: string) => {
    if (!token) return;

    try {
      // This is a placeholder - need to create this endpoint in the backend
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

  // Handle share functionality
  const shareSummary = (summaryId: string, title: string) => {
    // Create a shareable link
    const shareLink = `${window.location.origin}/share/${summaryId}`;

    // Copy to clipboard
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

  // Handle new summary creation
  const handleNewSummary = () => {
    navigate('/sources');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Format relative time
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-gray-500 mt-1">Your personalized content summaries</p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={handleNewSummary}>+ New Summary</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="recent">
            <TabsList className="mb-4">
              <TabsTrigger value="recent">Recent Summaries</TabsTrigger>
              <TabsTrigger value="saved">Saved Items</TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              {isLoadingSummaries ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-medium mb-2">Error Loading Summaries</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : recentSummaries.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">No summaries yet</h3>
                    <p className="text-gray-500 text-center mt-1 mb-4 max-w-md">
                      Create your first summary by adding an article, video, or document
                    </p>
                    <Button onClick={handleNewSummary}>Create Summary</Button>
                  </CardContent>
                </Card>
              ) : (
                recentSummaries.map(summary => (
                  <Card key={summary._id} className="mb-4">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{summary.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            {sourceTypeIcons[summary.sourceType] || <Globe className="h-4 w-4" />}
                            <span className="ml-1">{summary.sourceUrl}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-3 w-3" />
                            <span className="ml-1">{getRelativeTime(summary.createdAt)}</span>
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSave(summary._id)}
                          disabled={isProcessing === summary._id}
                        >
                          {isProcessing === summary._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Bookmark className={`h-5 w-5 ${savedIds.includes(summary._id) ? "fill-current" : ""}`} />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{summary.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {summary.topics.map(topic => (
                          <Badge key={topic} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between border-t mt-2 pt-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rateSummary(summary._id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" /> Helpful
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareSummary(summary._id, summary.title)}
                        >
                          <Share2 className="h-4 w-4 mr-1" /> Share
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(summary.sourceUrl, '_blank')}
                      >
                        Read Full Content
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="saved">
              {isLoadingSaved ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : savedSummaries.length > 0 ? (
                savedSummaries.map(summary => (
                  <Card key={summary._id} className="mb-4">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{summary.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            {sourceTypeIcons[summary.sourceType] || <Globe className="h-4 w-4" />}
                            <span className="ml-1">{summary.sourceUrl}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-3 w-3" />
                            <span className="ml-1">{getRelativeTime(summary.createdAt)}</span>
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSave(summary._id)}
                          disabled={isProcessing === summary._id}
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
                      <div className="flex flex-wrap gap-2 mt-3">
                        {summary.topics.map(topic => (
                          <Badge key={topic} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between border-t mt-2 pt-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rateSummary(summary._id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" /> Helpful
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareSummary(summary._id, summary.title)}
                        >
                          <Share2 className="h-4 w-4 mr-1" /> Share
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(summary.sourceUrl, '_blank')}
                      >
                        Read Full Content
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Bookmark className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">No saved items</h3>
                    <p className="text-gray-500 text-center mt-1">
                      Bookmark summaries to access them later
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
                    alt={user?.name || 'User'}
                  />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-medium">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">Your Topics</p>
                <div className="flex flex-wrap gap-2">
                  {user?.preferences?.topics && user.preferences.topics.length > 0 ? (
                    user.preferences.topics.map((topic: string) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No topics selected yet</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                Edit Profile
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Newsletters</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingNewsletters ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : scheduledNewsletters.length > 0 ? (
                scheduledNewsletters.map(newsletter => (
                  <div
                    key={newsletter._id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <p className="font-medium">{formatDate(newsletter.scheduledDate)}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {newsletter.topics.map(topic => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {newsletter.summaries.length} items
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No upcoming newsletters</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/newsletters')}>
                Manage Newsletters
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Dashboard;