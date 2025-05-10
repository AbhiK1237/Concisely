import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, X, Loader2, BookOpen, Hash } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';
import FetchContentButton from '../components/FetchContentButton';
import gsap from 'gsap';

const API_URL = 'http://localhost:5001/api';

const popularTopics = [
  { id: 1, name: "Technology", color: "bg-blue-100" },
  { id: 2, name: "Business", color: "bg-green-100" },
  { id: 3, name: "Science", color: "bg-purple-100" },
  { id: 4, name: "Health", color: "bg-red-100" },
  { id: 5, name: "Politics", color: "bg-yellow-100" },
  { id: 6, name: "Entertainment", color: "bg-pink-100" },
  { id: 7, name: "Sports", color: "bg-orange-100" },
  { id: 8, name: "Education", color: "bg-teal-100" }
];

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

const TopicSelection = () => {
  const { user, token, setUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<{ id: number | string; name: string; color: string; custom?: boolean }[]>([]);
  const [customTopic, setCustomTopic] = useState("");

  // Animation refs
  const cardRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate card entrance
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }

    // Animate topics
    if (topicsRef.current) {
      gsap.fromTo(
        topicsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', delay: 0.3 }
      );
    }
  }, [isFetching]);

  // Animate selected topics when they change
  useEffect(() => {
    if (selectedRef.current && !isFetching) {
      gsap.fromTo(
        selectedRef.current.children,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'back.out' }
      );
    }
  }, [selectedTopics, isFetching]);

  // Load user topics when component mounts
  useEffect(() => {
    const loadUserTopics = async () => {
      if (!user || !token) {
        setIsFetching(false);
        return;
      }

      try {
        // First check if user already has preferences in context
        if (user.preferences && Array.isArray(user.preferences.topics) && user.preferences.topics.length > 0) {
          // Convert string topics to our topic objects format
          const userTopics = user.preferences.topics.map(topicName => {
            // Check if it's one of our popular topics
            const popularTopic = popularTopics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
            if (popularTopic) {
              return popularTopic;
            }

            // If not, treat as custom topic
            return {
              id: `custom-${topicName}`,
              name: topicName,
              color: "bg-gray-100",
              custom: true
            };
          });

          setSelectedTopics(userTopics);
          setIsFetching(false);
          return;
        }

        // If not in context, fetch from API
        const response = await axios.get(`${API_URL}/users/preferences`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.preferences && Array.isArray(response.data.preferences.topics)) {
          // Convert string topics to our topic objects format
          const userTopics = response.data.preferences.topics.map((topicName: string) => {
            // Check if it's one of our popular topics
            const popularTopic = popularTopics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
            if (popularTopic) {
              return popularTopic;
            }

            // If not, treat as custom topic
            return {
              id: `custom-${topicName}`,
              name: topicName,
              color: "bg-gray-100",
              custom: true
            };
          });

          setSelectedTopics(userTopics);
        }
      } catch (error) {
        console.error("Failed to load user topics:", error);
        toast({
          title: "Error",
          description: "Failed to load your topics. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    loadUserTopics();
  }, [user, token, toast]);

  const toggleTopic = (topic: { id: number | string; name: string; color: string; custom?: boolean }) => {
    if (selectedTopics.find(t => t.id === topic.id)) {
      setSelectedTopics(selectedTopics.filter(t => t.id !== topic.id));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const removeSelectedTopic = (e: React.MouseEvent, topic: { id: number | string; name: string; color: string; custom?: boolean }) => {
    e.stopPropagation();
    setSelectedTopics(prevTopics => {
      return prevTopics.filter(t => t.id !== topic.id);
    });
  };

  const addCustomTopic = () => {
    if (customTopic.trim() !== "") {
      const newTopic = {
        id: `custom-${Date.now()}`,
        name: customTopic.trim(),
        color: "bg-gray-100",
        custom: true
      };
      setSelectedTopics([...selectedTopics, newTopic]);
      setCustomTopic("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addCustomTopic();
    }
  };

  const saveTopics = async () => {
    if (!user || !token) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save your preferences",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Extract just the topic names for the API
      const topicNames = selectedTopics.map(topic => topic.name);

      // Update user preferences in the backend
      await axios.put(`${API_URL}/users/preferences`, {
        preferences: {
          topics: topicNames,
        }
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update user in context with new preferences
      if (user) {
        const updatedUser = {
          ...user,
          preferences: {
            ...user.preferences,
            topics: topicNames,
          }
        };

        // Update localStorage and context
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      toast({
        title: "Topics saved",
        description: "Your topic preferences have been updated",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save topics:", error);
      toast({
        title: "Error",
        description: "Failed to save topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundImage: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)" }}>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="text-lg font-medium text-gray-800">Loading your topics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-12 relative" >
      <div style={dotPatternStyle}></div>
      <div className="container mx-auto max-w-6xl">
        <div ref={cardRef}>
          <Card className="bg-white/90 backdrop-blur-lg border-white/30 rounded-xl shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-purple-500/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 -mb-10 -ml-10 bg-blue-500/10 rounded-full"></div>

            <CardHeader className="relative z-10">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium shadow-sm mb-4">
                <Hash className="h-4 w-4 mr-2 text-purple-600" />
                Choose Your Interests
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800">Select Your Topics of Interest</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Choose topics you want to receive summarized content about
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10">
              <div ref={topicsRef} className="flex flex-wrap gap-3 mb-8">
                {popularTopics.map(topic => (
                  <Badge
                    key={topic.id}
                    variant={selectedTopics.find(t => t.id === topic.id) ? "default" : "outline"}
                    className={`cursor-pointer text-sm py-2 px-4 transition-all duration-200 ${selectedTopics.find(t => t.id === topic.id)
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-md shadow-blue-200/50'
                      : 'hover:bg-white/80 border border-gray-200'
                      }`}
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic.name}
                    {selectedTopics.find(t => t.id === topic.id) && (
                      <Check className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 mt-6 relative">
                <div className="relative flex-grow group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md blur-sm"></div>
                  <Input
                    placeholder="Add custom topic..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-grow bg-white/80 border-gray-200 focus:border-purple-300 focus:ring-purple-300 relative z-10"
                  />
                </div>
                <Button
                  onClick={addCustomTopic}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md shadow-blue-200/50"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {selectedTopics.length > 0 && (
                <div className="mt-8 bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-md mr-3">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    Your Selected Topics
                  </h3>
                  <div ref={selectedRef} className="flex flex-wrap gap-2">
                    {selectedTopics.map(topic => (
                      <Badge
                        key={topic.id}
                        className="bg-white/80 backdrop-blur-sm text-gray-800 flex items-center gap-1 py-2 px-3 shadow-sm border border-gray-100"
                      >
                        {topic.name}
                        <div
                          onClick={(e) => removeSelectedTopic(e, topic)}
                          className="ml-1 cursor-pointer hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </div>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="relative z-10 flex flex-col sm:flex-row gap-4">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md shadow-blue-200/50"
                onClick={saveTopics}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
              {selectedTopics.length > 0 && (
                <FetchContentButton
                  disabled={isLoading || selectedTopics.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-200/50"
                />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default TopicSelection;