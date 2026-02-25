import React, { useState } from 'react';
import { ArrowRight, Calendar, Clock, User, BookOpen, TrendingUp, Target, Brain, Bell, AlertCircle, CalendarClock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

const BlogSection = () => {
  const [activeTab, setActiveTab] = useState('articles');

  const blogPosts = [
    {
      id: 1,
      title: 'Complete Guide to Crack IBPS PO 2024: Strategy, Syllabus & Tips',
      excerpt: 'Master the IBPS PO exam with our comprehensive preparation strategy covering all sections, time management tips, and expert recommendations.',
      category: 'Banking Exams',
      author: 'Priya Sharma',
      date: 'Dec 20, 2024',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
      icon: TrendingUp,
      featured: true,
      tags: ['IBPS PO', 'Banking', 'Strategy'],
    },
    {
      id: 2,
      title: 'SSC CGL Tier-1: How to Score 180+ in 60 Days',
      excerpt: 'A day-by-day study plan with topic-wise breakdown, practice resources, and proven techniques from previous year toppers.',
      category: 'SSC Exams',
      author: 'Rahul Verma',
      date: 'Dec 18, 2024',
      readTime: '10 min read',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop',
      icon: Target,
      featured: false,
      tags: ['SSC CGL', 'Study Plan', '60 Days'],
    },
    {
      id: 3,
      title: 'Quantitative Aptitude: 50 Must-Know Shortcuts for Competitive Exams',
      excerpt: 'Save precious minutes in your exam with these tested mathematical shortcuts for percentages, profit-loss, time-speed-distance, and more.',
      category: 'Tips & Tricks',
      author: 'Ankit Kumar',
      date: 'Dec 15, 2024',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
      icon: Brain,
      featured: false,
      tags: ['Quant', 'Shortcuts', 'Tips'],
    },
    {
      id: 4,
      title: 'Railway RRB NTPC Complete Syllabus & Preparation Guide 2024',
      excerpt: 'Everything you need to know about RRB NTPC - exam pattern, syllabus breakdown, important topics, and free resources.',
      category: 'Railway Exams',
      author: 'Sneha Patel',
      date: 'Dec 12, 2024',
      readTime: '15 min read',
      image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=250&fit=crop',
      icon: BookOpen,
      featured: false,
      tags: ['RRB NTPC', 'Railway', 'Syllabus'],
    },
  ];

  const recentNotifications = [
    {
      id: 1,
      title: 'IBPS PO 2024 Prelims Result Declared',
      type: 'result',
      date: 'Dec 21, 2024',
      description: 'Check your IBPS PO prelims result now. Mains exam scheduled for January 2025.',
      urgent: true,
    },
    {
      id: 2,
      title: 'SSC CGL 2024 Tier-2 Admit Card Released',
      type: 'admit',
      date: 'Dec 20, 2024',
      description: 'Download your admit card from the official SSC website.',
      urgent: true,
    },
    {
      id: 3,
      title: 'RRB NTPC CBT-2 Registration Extended',
      type: 'notification',
      date: 'Dec 19, 2024',
      description: 'Last date to apply extended to December 30, 2024.',
      urgent: false,
    },
    {
      id: 4,
      title: 'SBI Clerk 2024 Notification Expected',
      type: 'upcoming',
      date: 'Dec 18, 2024',
      description: 'SBI Clerk notification expected by end of December 2024.',
      urgent: false,
    },
    {
      id: 5,
      title: 'UPSC CSE 2025 Calendar Released',
      type: 'notification',
      date: 'Dec 17, 2024',
      description: 'Prelims scheduled for May 25, 2025. Start your preparation now.',
      urgent: false,
    },
  ];

  const upcomingExams = [
    {
      id: 1,
      name: 'IBPS PO Mains 2024',
      date: 'Jan 25, 2025',
      daysLeft: 34,
      registrationOpen: false,
      category: 'Banking',
    },
    {
      id: 2,
      name: 'SSC CGL Tier-2 2024',
      date: 'Jan 18-20, 2025',
      daysLeft: 27,
      registrationOpen: false,
      category: 'SSC',
    },
    {
      id: 3,
      name: 'RRB NTPC CBT-2',
      date: 'Feb 10, 2025',
      daysLeft: 50,
      registrationOpen: true,
      category: 'Railway',
    },
    {
      id: 4,
      name: 'SBI PO 2025',
      date: 'March 2025',
      daysLeft: 70,
      registrationOpen: true,
      category: 'Banking',
    },
    {
      id: 5,
      name: 'UPSC CSE Prelims 2025',
      date: 'May 25, 2025',
      daysLeft: 155,
      registrationOpen: true,
      category: 'UPSC',
    },
  ];

  const categories = [
    { name: 'Banking Exams', count: 45 },
    { name: 'SSC Exams', count: 38 },
    { name: 'Railway Exams', count: 25 },
    { name: 'Tips & Tricks', count: 52 },
    { name: 'Current Affairs', count: 120 },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'result': return 'bg-green-100 text-green-700 border-green-300';
      case 'admit': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'notification': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'upcoming': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Banking': return 'bg-blue-500';
      case 'SSC': return 'bg-green-500';
      case 'Railway': return 'bg-orange-500';
      case 'UPSC': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <section id="blog" className="py-20 bg-muted/30 scroll-mt-20" aria-labelledby="blog-heading">
      <div className="container mx-auto px-4">
        {/* SEO-optimized header */}
        <header className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <BookOpen className="h-3 w-3 mr-1" />
            Exam Preparation Resources
          </Badge>
          <h2 id="blog-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Expert Exam Preparation Tips & Strategies
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn from toppers, get exam-specific strategies, and stay updated with the latest 
            preparation techniques for Banking, SSC, Railway, and other competitive exams.
          </p>
        </header>

        {/* Tabs for different content types */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles">
            {/* Categories */}
            <nav className="flex flex-wrap justify-center gap-3 mb-12" aria-label="Blog categories">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2 bg-primary/10">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </nav>

            {/* Featured Post */}
            <article className="mb-12">
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-auto">
                    <img
                      src={blogPosts[0].image}
                      alt={blogPosts[0].title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary">Featured</Badge>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <Badge variant="outline" className="w-fit mb-4">
                      {blogPosts[0].category}
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 hover:text-primary transition-colors cursor-pointer">
                      {blogPosts[0].title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {blogPosts[0].author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {blogPosts[0].date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {blogPosts[0].readTime}
                      </span>
                    </div>
                    <Button className="w-fit">
                      Read Full Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </article>

            {/* Blog Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {blogPosts.slice(1).map((post) => (
                <article key={post.id}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <Badge 
                        variant="secondary" 
                        className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
                      >
                        {post.category}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg leading-tight hover:text-primary transition-colors cursor-pointer line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <CardDescription className="line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    </CardContent>
                    
                    <CardFooter className="flex items-center justify-between text-sm text-muted-foreground pt-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </div>
                    </CardFooter>
                  </Card>
                </article>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="max-w-4xl mx-auto space-y-4">
              {recentNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`hover:shadow-md transition-all ${notification.urgent ? 'border-l-4 border-l-red-500' : ''}`}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${notification.urgent ? 'bg-red-100' : 'bg-muted'}`}>
                          {notification.urgent ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Bell className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{notification.title}</h3>
                            {notification.urgent && (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">
                            {notification.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {notification.date}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <div className="text-center pt-4">
                <Button variant="outline">
                  View All Notifications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Upcoming Exams Tab */}
          <TabsContent value="upcoming">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingExams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={`${getCategoryColor(exam.category)} text-white`}>
                            {exam.category}
                          </Badge>
                          {exam.registrationOpen && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Registration Open
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl mt-2">{exam.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{exam.date}</span>
                          </div>
                          <div className={`text-lg font-bold ${exam.daysLeft <= 30 ? 'text-red-500' : exam.daysLeft <= 60 ? 'text-orange-500' : 'text-green-500'}`}>
                            {exam.daysLeft} days left
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mb-4">
                          <div 
                            className={`h-2 rounded-full transition-all ${exam.daysLeft <= 30 ? 'bg-red-500' : exam.daysLeft <= 60 ? 'bg-orange-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.max(10, 100 - (exam.daysLeft / 2))}%` }}
                          />
                        </div>
                        <Button className="w-full">
                          Start Preparation
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="text-center pt-8">
                <Button variant="outline" size="lg">
                  View Complete Exam Calendar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <footer className="text-center">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-4">
              Get Weekly Study Tips & Exam Updates
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join 50,000+ aspirants receiving our expert exam preparation tips, 
              current affairs updates, and exclusive study materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                aria-label="Email for newsletter"
              />
              <Button size="lg" className="w-full sm:w-auto">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              No spam, unsubscribe anytime. Read our Privacy Policy.
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default BlogSection;