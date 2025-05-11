//settings.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar, MessageSquare, Loader2, Bell, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';

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

const Settings = () => {
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
          notifications: notifications
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-12 relative">
      <div style={dotPatternStyle}></div>

      <div className="container mx-auto max-w-6xl py-8 px-4 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm text-sm font-medium shadow-sm mb-2">
              <div className="flex h-2 w-2 rounded-full bg-purple-600 mr-2"></div>
              <span className="text-gray-700">Customize Your Experience</span>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Newsletter Settings
            </h1>
            <p className="text-gray-700 mt-1">Personalize how and when you receive your content</p>
          </div>
          <Button
            className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            onClick={handleSavePreferences}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> Save Preferences
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border border-gray-100 shadow-lg rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-purple-500/10 rounded-full"></div>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-medium">Delivery Schedule</CardTitle>
              </div>
              <CardDescription className="pl-12">Choose when to receive your content summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={frequency}
                onValueChange={setFrequency}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50">
                  <RadioGroupItem value="daily" id="daily" />
                  <div className="flex-1">
                    <Label htmlFor="daily" className="text-base font-medium">Daily</Label>
                    <p className="text-sm text-gray-500">Get updates every day</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <div className="flex-1">
                    <Label htmlFor="weekly" className="text-base font-medium">Weekly</Label>
                    <p className="text-sm text-gray-500">Receive a weekly digest</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <div className="flex-1">
                    <Label htmlFor="monthly" className="text-base font-medium">Monthly</Label>
                    <p className="text-sm text-gray-500">Monthly roundup of content</p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-lg rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-500/10 rounded-full"></div>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-medium">Summary Format</CardTitle>
              </div>
              <CardDescription className="pl-12">Customize your content summary length</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="summary-length" className="text-base font-medium">Summary Length</Label>
                  <Select value={summaryLength} onValueChange={setSummaryLength}>
                    <SelectTrigger id="summary-length" className="w-full">
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">
                        <div className="flex items-center">
                          <span>Short</span>
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">1-2 paragraphs</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <span>Medium</span>
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">3-4 paragraphs</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="long">
                        <div className="flex items-center">
                          <span>Long</span>
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">5+ paragraphs</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Summary Length Preview</p>
                  {summaryLength === "short" && (
                    <p className="text-xs text-gray-500">Brief overview with key points only. Best for quick scanning.</p>
                  )}
                  {summaryLength === "medium" && (
                    <p className="text-xs text-gray-500">Balanced summary with main arguments and some supporting details. Great for most content.</p>
                  )}
                  {summaryLength === "long" && (
                    <p className="text-xs text-gray-500">Comprehensive summary with main points and detailed supporting information. Ideal for complex topics.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-lg rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-green-500/10 rounded-full"></div>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-xl font-medium">Content Volume</CardTitle>
              </div>
              <CardDescription className="pl-12">Set how many items to include per newsletter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="max-items" className="text-base font-medium">Maximum Items</Label>
                    <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {maxItems} items
                    </span>
                  </div>

                  <Slider
                    id="max-items"
                    value={[maxItems]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setMaxItems(value[0])}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Fewer (1)</span>
                    <span>More (10)</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="min-w-5 pt-1">
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Setting a higher number gives you more content but might take longer to read through. A lower number helps you focus on the most important items.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border border-gray-100 shadow-lg rounded-xl bg-white/90 backdrop-blur-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-pink-500/10 rounded-full"></div>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Bell className="h-5 w-5 text-pink-600" />
                </div>
                <CardTitle className="text-xl font-medium">Notification Preferences</CardTitle>
              </div>
              <CardDescription className="pl-12">Control how you want to be notified about new content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates and summaries via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-1">
                    <Label htmlFor="browser-notifications" className="text-base font-medium">Browser Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified directly in your browser</p>
                  </div>
                  <Switch
                    id="browser-notifications"
                    checked={notifications.browser}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, browser: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 border-t">
              <div className="flex items-center space-x-3 py-2 px-4 rounded-lg bg-white/80 w-full">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Your settings will apply to all future newsletters and notifications.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Settings;