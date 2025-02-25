import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, X } from "lucide-react";

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
  const [selectedTopics, setSelectedTopics] = useState<{ id: number | string; name: string; color: string; custom?: boolean }[]>([]);
  const [customTopic, setCustomTopic] = useState("");

  const toggleTopic = (topic: { id: number | string; name: string; color: string; custom?: boolean }) => {
    if (selectedTopics.find(t => t.id === topic.id)) {
      setSelectedTopics(selectedTopics.filter(t => t.id !== topic.id));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
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

  return (
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
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleTopic(topic)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full">Save Preferences</Button>
      </CardFooter>
    </Card>
  );
};

export default TopicSelection;