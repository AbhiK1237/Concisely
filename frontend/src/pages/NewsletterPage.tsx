import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Share2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { newsletterDisplayService } from '@/services/newsletterDisplayService';

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

const NewsletterPage: React.FC = () => {
    const { newsletterId } = useParams<{ newsletterId: string }>();
    const { toast } = useToast();
    const { token } = useAuth();
    const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNewsletter = async () => {
            if (!token || !newsletterId) return;

            try {
                setLoading(true);
                const data = await newsletterDisplayService.getNewsletterById(newsletterId, token);

                if (data) {
                    setNewsletter(data);
                } else {
                    setError('Newsletter not found');
                }
            } catch (err) {
                console.error('Failed to load newsletter:', err);
                setError('Failed to load newsletter. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNewsletter();
    }, [newsletterId, token]);

    // Handle sharing the newsletter
    const handleShare = () => {
        const shareLink = window.location.href;

        navigator.clipboard.writeText(shareLink).then(() => {
            toast({
                title: "Link copied!",
                description: "Newsletter link has been copied to clipboard",
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

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4 flex justify-center">
                <div className="animate-pulse space-y-4 w-full max-w-3xl">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !newsletter) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="mb-6">{error || 'Newsletter not found'}</p>
                <Link to="/dashboard">
                    <Button variant="outline">Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const formattedContent = newsletterDisplayService.formatNewsletterContent(newsletter);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-3">{newsletter.title}</h1>

                    {newsletter.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {newsletter.topics.map(topic => (
                                <span key={topic} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="newsletter-html-content" dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
            <Toaster />
        </div>
    );
};

export default NewsletterPage;
