import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, ThumbsUp, Share2, Clock, Calendar, Youtube, FileText, Rss, Globe } from "lucide-react";
import { JSX } from 'react';

// Mock data for demonstration
const recentSummaries = [
  {
    id: 1,
    title: "The Future of AI in Healthcare",
    source: "techcrunch.com",
    sourceType: "article",
    date: "2 hours ago",
    summary: "AI is revolutionizing healthcare by enabling faster diagnoses, personalized treatment plans, and predictive analytics. Researchers are developing new algorithms that can detect diseases from medical images with higher accuracy than human doctors.",
    topics: ["Technology", "Health"]
  },
  {
    id: 2,
    title: "How to Build a Successful Startup",
    source: "youtube.com/watch?v=abc123",
    sourceType: "youtube",
    date: "Yesterday",
    summary: "This video outlines the key steps to building a successful startup: finding a market need, building an MVP, gathering early user feedback, iterating quickly, and securing the right funding at the right time.",
    topics: ["Business", "Entrepreneurship"]
  },
  {
    id: 3,
    title: "Latest Discoveries in Quantum Physics",
    source: "scientificamerican.com",
    sourceType: "article",
    date: "3 days ago",
    summary: "Scientists have made breakthrough discoveries in quantum entanglement that could revolutionize quantum computing. The research demonstrates how particles can maintain correlation regardless of distance.",
    topics: ["Science", "Physics"]
  }
];

const scheduledNewsletters = [
  {
    id: 1,
    date: "Tomorrow, 9:00 AM",
    topics: ["Technology", "Business"],
    itemCount: 5
  },
  {
    id: 2,
    date: "Feb 28, 9:00 AM",
    topics: ["Science", "Health"],
    itemCount: 4
  }
];

const sourceTypeIcons: { [key: string]: JSX.Element } = {
  article: <Globe className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  podcast: <Rss className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />
};

const Dashboard = () => {
  const [savedItems, setSavedItems] = useState<number[]>([]);

  const toggleSave = (summaryId: number) => {
    if (savedItems.includes(summaryId)) {
      setSavedItems(savedItems.filter(id => id !== summaryId));
    } else {
      setSavedItems([...savedItems, summaryId]);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Alex</h1>
          <p className="text-gray-500 mt-1">Your personalized content summaries</p>
        </div>
        <Button className="mt-4 md:mt-0">+ New Summary</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="recent">
            <TabsList className="mb-4">
              <TabsTrigger value="recent">Recent Summaries</TabsTrigger>
              <TabsTrigger value="saved">Saved Items</TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              {recentSummaries.map(summary => (
                <Card key={summary.id} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{summary.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          {sourceTypeIcons[summary.sourceType]}
                          <span className="ml-1">{summary.source}</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-3 w-3" />
                          <span className="ml-1">{summary.date}</span>
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSave(summary.id)}
                      >
                        <Bookmark className={`h-5 w-5 ${savedItems.includes(summary.id) ? "fill-current" : ""}`} />
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
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" /> Helpful
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" /> Share
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">Read Full Content</Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="saved">
              {savedItems.length > 0 ? (
                recentSummaries
                  .filter(summary => savedItems.includes(summary.id))
                  .map(summary => (
                    <Card key={summary.id} className="mb-4">
                      {/* Same card structure as above */}
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
                  <AvatarImage src="/api/placeholder/64/64" alt="User" />
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-medium">Alex Peterson</p>
                  <p className="text-sm text-gray-500">alex@example.com</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">Your Topics</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Technology</Badge>
                  <Badge variant="secondary">Business</Badge>
                  <Badge variant="secondary">Science</Badge>
                  <Badge variant="secondary">Health</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Edit Preferences</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Newsletters</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledNewsletters.map(newsletter => (
                <div
                  key={newsletter.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="font-medium">{newsletter.date}</p>
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
                    {newsletter.itemCount} items
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Manage Schedule</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;