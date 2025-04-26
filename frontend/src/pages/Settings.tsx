import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const NewsletterPreferences = () => {
  const { user, token, setUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [frequency, setFrequency] = useState("weekly");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [maxItems, setMaxItems] = useState(5);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
  });

  // Load user preferences from context when component mounts
  useEffect(() => {
    if (user?.preferences) {
      setFrequency(user.preferences.deliveryFrequency || "weekly");
      setSummaryLength(user.preferences.summaryLength || "medium");
      setMaxItems(user.preferences.maxItemsPerNewsletter || 5);
      // If we had notification settings stored in the user object, we would set them here
    }
  }, [user]);

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL}/users/preferences`, {
        preferences: {
          deliveryFrequency: frequency,
          summaryLength: summaryLength,
          maxItemsPerNewsletter: maxItems,
          notifications: notifications // Assuming backend handles this field
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
            deliveryFrequency: frequency,
            summaryLength: summaryLength,
            maxItemsPerNewsletter: maxItems,
          }
        };

        // Update localStorage and context
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      toast({
        title: "Preferences saved",
        description: "Your newsletter preferences have been updated",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (<>
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Newsletter Preferences</CardTitle>
        <CardDescription>
          Customize how and when you receive your summaries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Delivery Frequency
          </h3>
          <RadioGroup
            value={frequency}
            onValueChange={setFrequency}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Summary Length
          </h3>
          <Select value={summaryLength} onValueChange={setSummaryLength}>
            <SelectTrigger>
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short (1-2 paragraphs)</SelectItem>
              <SelectItem value="medium">Medium (3-4 paragraphs)</SelectItem>
              <SelectItem value="long">Long (5+ paragraphs)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Maximum Items Per Newsletter
          </h3>
          <div className="space-y-2">
            <Slider
              value={[maxItems]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => setMaxItems(value[0])}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>{maxItems} items</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Notification Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex-grow">
                Email notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="browser-notifications" className="flex-grow">
                Browser notifications
              </Label>
              <Switch
                id="browser-notifications"
                checked={notifications.browser}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, browser: checked })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSavePreferences}
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
      </CardFooter>
    </Card>
    <Toaster />
  </>
  );
};

export default NewsletterPreferences;