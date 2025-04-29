import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, X, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';
import FetchContentButton from '../components/FetchContentButton'

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

const TopicSelection = () => {
  const { user, token, setUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<{ id: number | string; name: string; color: string; custom?: boolean }[]>([]);
  const [customTopic, setCustomTopic] = useState("");

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
    e.stopPropagation(); // Prevent event from bubbling up to parent Badge
    // console.log("Removing topic:", topic);
    // console.log("Current selected topics before removal:", selectedTopics);
    setSelectedTopics(prevTopics => {
      const newTopics = prevTopics.filter(t => t.id !== topic.id);
      // console.log("New topics after removal:", newTopics);
      return newTopics;
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your topics...</span>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Select Your Topics of Interest</CardTitle>
          <CardDescription>
            Choose topics you want to receive summarized content about
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {popularTopics.map(topic => (
              <Badge
                key={topic.id}
                variant={selectedTopics.find(t => t.id === topic.id) ? "default" : "outline"}
                className="cursor-pointer text-sm py-1 px-3"
                onClick={() => toggleTopic(topic)}
              >
                {topic.name}
                {selectedTopics.find(t => t.id === topic.id) && (
                  <Check className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Add custom topic..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow"
            />
            <Button onClick={addCustomTopic} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {selectedTopics.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Your Selected Topics:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTopics.map(topic => (
                  <Badge
                    key={topic.id}
                    className={`${topic.color} text-gray-800 flex items-center gap-1`}
                  >
                    {topic.name}

                    <div onClick={(e) => removeSelectedTopic(e, topic)} className="cursor-pointer">
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
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
              className="w-full mt-2 sm:mt-0"
            />
          )}
        </CardFooter>
      </Card>
      <Toaster />
    </>
  );
};

export default TopicSelection;