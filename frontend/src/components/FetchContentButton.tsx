// src/components/FetchContentButton.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Mail } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

interface FetchContentButtonProps {
    disabled?: boolean;
    className?: string;
}

const FetchContentButton: React.FC<FetchContentButtonProps> = ({ disabled = false, className = '' }) => {
    const [isFetching, setIsFetching] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const fetchContent = async () => {
        setIsFetching(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                toast({
                    title: "Not authenticated",
                    description: "Please log in to fetch content",
                    variant: "destructive",
                });
                return;
            }

            const response = await axios.post(`${API_URL}/content/fetch`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast({
                    title: "Content refreshed",
                    description: `Found ${response.data.data.summaries?.length || 0} new items based on your topics`,
                    variant: "success",
                });
            } else {
                toast({
                    title: "Warning",
                    description: response.data.message || "No new content found",
                    variant: "default",
                });
            }
        } catch (error: any) {
            console.error("Error fetching content:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to fetch content. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsFetching(false);
        }
    };

    const generateNewsletter = async () => {
        setIsGenerating(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                toast({
                    title: "Not authenticated",
                    description: "Please log in to generate newsletter",
                    variant: "destructive",
                });
                return;
            }

            const response = await axios.post(`${API_URL}/content/newsletter`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast({
                    title: "Newsletter generated",
                    description: "Your newsletter has been created and sent to your email",
                    variant: "success",
                });
            } else {
                toast({
                    title: "Warning",
                    description: response.data.message || "Could not generate newsletter",
                    variant: "default",
                });
            }
        } catch (error: any) {
            console.error("Error generating newsletter:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to generate newsletter. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            <Button
                onClick={fetchContent}
                disabled={disabled || isFetching || isGenerating}
                variant="outline"
                className={`${className} flex-1`}
            >
                {isFetching ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching...
                    </>
                ) : (
                    <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Fetch New Content
                    </>
                )}
            </Button>

            <Button
                onClick={generateNewsletter}
                disabled={disabled || isFetching || isGenerating}
                variant="default"
                className={`${className} flex-1`}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Mail className="mr-2 h-4 w-4" />
                        Generate Newsletter
                    </>
                )}
            </Button>
        </div>
    );
};

export default FetchContentButton;