import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Clock, FileText, BarChart3, ArrowRightCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const { login, signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setIsLoginOpen(false);
      navigate('/dashboard');
      toast({
        title: "Login successful",
        description: "Welcome back to Concisely!",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(signupName, signupEmail, signupPassword);
      setIsLoginOpen(false);
      navigate('/dashboard');
      toast({
        title: "Account created",
        description: "Welcome to Concisely!",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navbar */}
      <header className="border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl">Concisely</span>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost">Log in</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Welcome {activeTab === 'signup' ? 'to Concisely' : 'back'}</DialogTitle>
                  <DialogDescription>
                    {activeTab === 'signup' ? 'Create an account to get started' : 'Sign in to your account to continue'}
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <form className="space-y-4 py-4" onSubmit={handleLogin}>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          placeholder="your@email.com"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Log in'}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="signup">
                    <form className="space-y-4 py-4" onSubmit={handleSignup}>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          placeholder="your@email.com"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            <Button onClick={() => {
              setActiveTab('signup');
              setIsLoginOpen(true);
            }}>Sign up</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-muted" style={{ backgroundImage: " linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)" }}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Summarize content & <span className='text-red-500'>stay informed</span> in less time
              </h1>
              <p className="text-lg text-black max-w-md ">
                Concisely uses AI to distill articles, videos, and podcasts into summaries you can quickly digest and share.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => {
                  setActiveTab('signup');
                  setIsLoginOpen(true);
                }}>
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  See how it works
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-black">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>Save time</span>
                </div>
                <div className="flex items-center">
                  <FileText className="mr-1 h-4 w-4" />
                  <span>Easy sharing</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>Weekly digest</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 right-12 bottom-4 bg-primary/5 rounded-xl"></div>
              <Card className="overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">The Future of Remote Work</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <span className="ml-1">forbes.com</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-3 w-3" />
                        <span className="ml-1">2 days ago</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 line-clamp-4">
                    Remote work is evolving with new collaboration tools and changing workplace norms. Companies are adopting hybrid models that balance flexibility with in-person collaboration. The latest research suggests productivity can increase with proper remote work policies.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary">Technology</Badge>
                    <Badge variant="secondary">Business</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6" style={{ backgroundImage: " linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)" }}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Concisely Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform turns your content sources into concise, easy-to-digest summaries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Add Your Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect articles, videos, podcasts, or documents from anywhere on the web.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Summarization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI extracts the key points and insights, creating concise summaries.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Organize & Share</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Save summaries by topic and share them with your team or create a newsletter.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials/Social Proof */}
      <section className="py-20 px-6 bg-muted" style={{ backgroundImage: " linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)" }}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professionals across industries use Concisely to stay informed while saving time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Concisely has transformed how I keep up with industry news. The summaries are spot-on and save me hours each week.",
                author: "Sarah J.",
                role: "Marketing Manager"
              },
              {
                quote: "As a researcher, I need to process tons of content. This tool helps me quickly determine which papers are worth a deeper read.",
                author: "David L.",
                role: "Data Scientist"
              },
              {
                quote: "The newsletter feature is fantastic. My team loves getting curated summaries of industry trends every Monday morning.",
                author: "Michael R.",
                role: "Product Lead"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="bg-background">
                <CardContent className="pt-6">
                  <p className="italic mb-4">"{testimonial.quote}"</p>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to become more informed in less time?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who use Concisely to extract insights from content across the web.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              setActiveTab('signup');
              setIsLoginOpen(true);
            }}
          >
            Get started for free
            <ArrowRightCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Concisely</span>
            </div>
            <div className="flex gap-8">
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Concisely. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
