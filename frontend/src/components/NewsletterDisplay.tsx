import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Printer, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { newsletterDisplayService } from '@/services/newsletterDisplayService';
import './NewsletterDisplay.css';

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

interface NewsletterDisplayProps {
    newsletter: Newsletter | null;
    loading?: boolean;
}

const NewsletterDisplay: React.FC<NewsletterDisplayProps> = ({ newsletter, loading = false }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showFullContent, setShowFullContent] = useState(false);

    if (loading) {
        return (
            <Card className="newsletter-container animate-pulse">
                <CardHeader className="pb-2 border-b card-header">
                    <div className="h-6 bg-blue-100 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="newsletter-content py-6">
                    <div className="h-4 bg-blue-50 rounded w-full mb-3"></div>
                    <div className="h-4 bg-blue-50 rounded w-full mb-3"></div>
                    <div className="h-4 bg-blue-50 rounded w-5/6 mb-5"></div>
                    <div className="h-4 bg-blue-50 rounded w-full mb-3"></div>
                    <div className="h-4 bg-blue-50 rounded w-full mb-3"></div>
                </CardContent>
            </Card>
        );
    }

    if (!newsletter) {
        return (
            <Card className="newsletter-container">
                <CardContent className="py-16 text-center">
                    <h3 className="text-lg font-medium mb-2 text-indigo-600">No Newsletter Available</h3>
                    <p className="text-gray-500 mb-4">Add more content sources to generate your personalized newsletter</p>
                    <Button
                        onClick={() => navigate('/sources')}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                        Add Sources
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Format the newsletter content (HTML)
    const formattedContent = newsletterDisplayService.formatNewsletterContent(newsletter);

    // Get a preview version (if not showing full content)
    const displayContent = showFullContent
        ? formattedContent
        : newsletterDisplayService.formatNewsletterContent({
            ...newsletter,
            content: newsletterDisplayService.generatePreview(newsletter)
        });

    // Handle sharing
    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/newsletter/${newsletter._id}`)
            .then(() => {
                toast({
                    title: "Link copied!",
                    description: "Newsletter link has been copied to clipboard",
                    variant: "success",
                });
            })
            .catch(error => {
                console.error('Error copying to clipboard:', error);
                toast({
                    title: "Error",
                    description: "Failed to copy link to clipboard",
                    variant: "destructive",
                });
            });
    };

    return (
        <Card className="newsletter-container">
            <CardHeader className="pb-2 border-b card-header">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-bold card-title">
                            {newsletter.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {newsletter.topics.map(topic => (
                                <Badge key={topic} variant="secondary" className="badge">{topic}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="py-4 newsletter-content">
                <div
                    className="newsletter-html-content"
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                />

                {!showFullContent && formattedContent.length > displayContent.length && (
                    <div className="text-center mt-6 mb-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFullContent(true)}
                            className="flex items-center hover:bg-blue-50 text-blue-600 border-blue-200"
                        >
                            <span>Show Full Content</span>
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}

                {showFullContent && (
                    <div className="text-center mt-6 mb-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFullContent(false)}
                            className="flex items-center hover:bg-blue-50 text-blue-600 border-blue-200"
                        >
                            <span>Show Less</span>
                            <ChevronUp className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t pt-4 flex flex-wrap gap-2 justify-between card-footer">
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleShare} className="text-blue-600 hover:bg-blue-50 border-blue-200">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="text-indigo-600 hover:bg-indigo-50 border-indigo-200">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/newsletter/${newsletter._id}`)}
                >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Full View
                </Button>
            </CardFooter>
        </Card>
    );
};

export default NewsletterDisplay;
