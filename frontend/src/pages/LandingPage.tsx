import React, { useState, useRef, useEffect } from 'react';
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
import gsap from 'gsap';

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

  // Animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate hero section
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }
    // Animate features section
    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' }
      );
    }
    // Animate testimonials section
    if (testimonialsRef.current) {
      gsap.fromTo(
        testimonialsRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 0.6, ease: 'power3.out' }
      );
    }
    // Animate CTA section
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 1, delay: 0.9, ease: 'power3.out' }
      );
    }
  }, []);

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
    <div className="min-h-screen flex flex-col" >
      {/* Header/Navbar - Redesigned */}
      <header className="py-4 px-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">Concisely</span>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">Log in</Button>
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
            <Button
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-md shadow-blue-200/50"
              onClick={() => {
                setActiveTab('signup');
                setIsLoginOpen(true);
              }}
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      <div style={{ backgroundImage: " linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)" }}>
        {/* Hero Section - Redesigned */}
        <section ref={heroRef} className="py-24 px-6 overflow-hidden relative">
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <svg className="absolute left-0 top-0 h-full" width="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="hero-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop stopColor="#5000ca" stopOpacity="1" offset="0%"></stop>
                  <stop stopColor="#ff1361" stopOpacity="1" offset="100%"></stop>
                </linearGradient>
              </defs>
              <path fill="url(#hero-gradient)" d="M 0 50 Q 200 150 400 50 Q 600 -50 800 50 L 800 800 L 0 800 L 0 50" fillOpacity="1"></path>
            </svg>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                  AI-Powered Content Summarization
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  Summarize content & <span className="relative inline-block">
                    <span className="text-purple-600">stay informed</span>
                  </span> in less time
                </h1>

                <p className="text-lg text-gray-800 max-w-md">
                  Concisely uses AI to distill articles, videos, and podcasts into summaries you can quickly digest and share.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="relative overflow-hidden group" onClick={() => {
                    setActiveTab('signup');
                    setIsLoginOpen(true);
                  }}>
                    <span className="relative z-10">Get started for free</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 group-hover:opacity-90 transition-opacity"></span>
                    <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                  </Button>

                  <Button variant="outline" size="lg" className="bg-white/80 hover:bg-white">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    See how it works
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="bg-white/80 p-2 rounded-full mr-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Save time</span>
                  </div>
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="bg-white/80 p-2 rounded-full mr-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Easy sharing</span>
                  </div>
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="bg-white/80 p-2 rounded-full mr-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Weekly digest</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-10 -left-10 right-10 bottom-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-xl"></div>
                <div className="relative bg-white backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/30">
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex space-x-1">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 text-center text-sm font-medium text-gray-600">Content Summary</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">The Future of Remote Work</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="font-medium text-indigo-600">forbes.com</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-3 w-3" />
                      <span className="ml-1">2 days ago</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Remote work is evolving with new collaboration tools and changing workplace norms. Companies are adopting hybrid models that balance flexibility with in-person collaboration. The latest research suggests productivity can increase with proper remote work policies.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none hover:from-blue-600 hover:to-blue-700">Technology</Badge>
                      <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none hover:from-purple-600 hover:to-purple-700">Business</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Redesigned */}
        <section ref={featuresRef} className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium shadow-sm mb-4">
                <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
                Simple Three-Step Process
              </div>
              <h2 className="text-3xl font-bold mb-4">How Concisely Works</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Our AI-powered platform turns your content sources into concise, easy-to-digest summaries in just a few steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 border border-gray-100">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-500/10 rounded-full"></div>
                  <div className="p-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 relative">
                      <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Add Your Sources</h3>
                    <p className="text-gray-600">
                      Connect articles, videos, podcasts, or documents from anywhere on the web with our simple interface.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 border border-gray-100">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-purple-500/10 rounded-full"></div>
                  <div className="p-8">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 relative">
                      <svg className="w-10 h-10 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.121m0 0a2.25 2.25 0 002.25 0m0 0a2.25 2.25 0 001.5-2.121M9.75 3.104A24.1 24.1 0 0119.5 3.5M5 14.5l6.83 3.94a2.245 2.245 0 002.34 0L21 14.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white text-sm font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">AI Summarization</h3>
                    <p className="text-gray-600">
                      Our advanced AI models extract key points and insights, creating concise, accurate summaries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 border border-gray-100">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-pink-500/10 rounded-full"></div>
                  <div className="p-8">
                    <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 relative">
                      <svg className="w-10 h-10 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-pink-600 text-white text-sm font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Organize & Share</h3>
                    <p className="text-gray-600">
                      Save summaries by topic, share with your team, or create custom newsletters for distribution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section - Redesigned */}
        <section ref={testimonialsRef} className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="tech-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="2" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#tech-grid)" />
            </svg>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium shadow-sm mb-4">
                <span className="flex h-2 w-2 rounded-full bg-purple-400 mr-2"></span>
                Cutting-Edge Technology
              </div>
              <h2 className="text-3xl font-bold mb-4">Modern Tech Stack</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Concisely demonstrates modern web development by integrating AI capabilities with a
                responsive, type-safe architecture to deliver personalized content summaries
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 border border-gray-100">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-blue-500/10 rounded-full"></div>
                  <div className="p-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Frontend Architecture</h3>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">01</span>
                        <span>React 19 with TypeScript</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">02</span>
                        <span>Tailwind CSS & shadcn components</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">03</span>
                        <span>GSAP animations</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">04</span>
                        <span>Context-based state management</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 border border-gray-100">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-purple-500/10 rounded-full"></div>
                  <div className="p-8">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Backend Systems</h3>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">01</span>
                        <span>Node.js & Express with TypeScript</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">02</span>
                        <span>MongoDB with Mongoose ODM</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">03</span>
                        <span>RESTful API architecture</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">04</span>
                        <span>JWT-based authentication</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
                <div className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 border border-gray-100">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-green-500/10 rounded-full"></div>
                  <div className="p-8">
                    <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">AI Integration</h3>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">01</span>
                        <span>OpenAI & Gemini APIs</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">02</span>
                        <span>Brave Search for content discovery</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">03</span>
                        <span>Topic extraction & categorization</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 mr-3 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">04</span>
                        <span>Automated newsletter generation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg inline-flex items-center">
                <span className="text-gray-700 font-medium">Experience AI-powered summarization</span>
                <div className="ml-3 w-px h-6 bg-gray-300"></div>
                <Button
                  className="ml-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-inner"
                  size="sm"
                  onClick={() => {
                    setActiveTab('signup');
                    setIsLoginOpen(true);
                  }}
                >
                  Try it now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Redesigned */}
        <section ref={ctaRef} className="py-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 left-0 opacity-10">
              <path fill="#5000ff" fillOpacity="1" d="M0,224L48,224C96,224,192,224,288,197.3C384,171,480,117,576,96C672,75,768,85,864,122.7C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>

          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-12 overflow-hidden relative">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full opacity-20 blur-3xl"></div>

              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="w-full md:w-3/5 relative z-10">
                  <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">Ready to become more informed in less time?</h2>
                  <p className="text-gray-700 mb-8">
                    Join the community of professionals who use Concisely to extract insights from content across the web and stay ahead of information overload.
                  </p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-indigo-500/30"
                    onClick={() => {
                      setActiveTab('signup');
                      setIsLoginOpen(true);
                    }}
                  >
                    Get started for free
                    <div className="ml-2 p-1 bg-white/20 rounded-full">
                      <ArrowRightCircle className="h-4 w-4" />
                    </div>
                  </Button>
                </div>

                <div className="w-full md:w-2/5 relative">
                  <svg className="w-full h-auto" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#8B5CF6" d="M48.8,-57.2C63.5,-45.7,76.1,-31.6,79.8,-15.2C83.5,1.1,78.4,19.7,68.2,33.6C58,47.6,42.7,56.9,26.4,64C10.2,71.1,-7,75.9,-23.2,71.8C-39.5,67.7,-54.8,54.7,-64.8,38.5C-74.8,22.3,-79.5,2.9,-75.4,-14.5C-71.4,-31.9,-58.6,-47.3,-44,-58.1C-29.4,-68.9,-14.7,-75,1.9,-77.2C18.5,-79.5,37,-68.7,48.8,-57.2Z" transform="translate(100 100)" />
                    <g fill="none" stroke="white" strokeWidth="2">
                      <circle cx="100" cy="100" r="30" strokeDasharray="10,5" />
                      <circle cx="100" cy="100" r="60" strokeDasharray="10,5" />
                      <path d="M100,40 L100,160 M40,100 L160,100" strokeLinecap="round" />
                      <path d="M65,65 L135,135 M65,135 L135,65" strokeLinecap="round" />
                    </g>
                    <circle cx="100" cy="100" r="20" fill="white" />
                    <path d="M110,100 L90,90 L90,110 Z" fill="#4F46E5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer - Redesigned */}
      <footer className="bg-gradient-to-b from-gray-50 to-gray-100 pt-16 pb-8 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-md">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">Concisely</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                AI-powered content summarization for busy professionals. Stay informed in less time.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-lg mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">Features</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">How it works</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">Pricing</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-lg mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">Documentation</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">Blog</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">Support</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-lg mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">About</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">Privacy</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">Terms</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Concisely. All rights reserved.</p>
            <p className="mt-2">Built with ❤️ by developers, for developers.</p>
          </div>
        </div>
      </footer>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
