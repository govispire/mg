import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, User, Search, Home, Tag, ChevronRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [email, setEmail] = useState('');

  const categories = [
    { name: 'All', icon: '📚', count: 150 },
    { name: 'Banking Exams', icon: '🏦', count: 45 },
    { name: 'SSC Exams', icon: '📋', count: 38 },
    { name: 'Railway Exams', icon: '🚂', count: 25 },
    { name: 'UPSC', icon: '🎯', count: 30 },
    { name: 'TNPSC', icon: '📜', count: 18 },
    { name: 'Defence Exams', icon: '🛡️', count: 22 },
    { name: 'MBA Entrance', icon: '🎓', count: 15 },
    { name: 'Regulatory Exams', icon: '⚖️', count: 12 },
    { name: 'Study Tips', icon: '💡', count: 40 },
  ];

  const featuredPost = {
    id: 1,
    slug: 'complete-guide-ibps-po-2025',
    title: 'Complete Guide to Crack IBPS PO 2025: Strategy, Syllabus & Expert Tips',
    excerpt: 'Master the IBPS PO exam with our comprehensive preparation strategy covering all sections, time management tips, previous year analysis, and expert recommendations from toppers.',
    category: 'Banking Exams',
    author: 'Priya Sharma',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    date: '2 weeks ago',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
    featured: true,
  };

  const blogPosts = [
    {
      id: 2,
      slug: 'ssc-cgl-score-180-60-days',
      title: 'SSC CGL 2025 Tier-1: How to Score 180+ in 60 Days',
      excerpt: 'A day-by-day study plan with topic-wise breakdown, practice resources, and proven techniques from previous year toppers.',
      category: 'SSC Exams',
      author: 'Rahul Verma',
      authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      date: '3 weeks ago',
      readTime: '10 min read',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop',
      featured: false,
    },
    {
      id: 3,
      slug: 'railway-rrb-ntpc-guide-2025',
      title: 'Railway RRB NTPC Complete Syllabus & Preparation Guide 2025',
      excerpt: 'Everything you need to know about RRB NTPC - exam pattern, syllabus breakdown, important topics, and free resources.',
      category: 'Railway Exams',
      author: 'Sneha Patel',
      authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      date: '1 month ago',
      readTime: '15 min read',
      image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=250&fit=crop',
      featured: true,
    },
    {
      id: 4,
      slug: 'upsc-cse-preparation-beginners-2025',
      title: 'UPSC CSE 2025: Complete Preparation Strategy for Beginners',
      excerpt: 'Start your IAS journey with the right approach. Learn about optional subjects, booklist, and effective study techniques.',
      category: 'UPSC',
      author: 'Dr. Amit Singh',
      authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      date: '1 month ago',
      readTime: '20 min read',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop',
      featured: false,
    },
    {
      id: 5,
      slug: 'tnpsc-group-2-preparation-tips',
      title: 'TNPSC Group 2 Exam: Subject-wise Preparation Tips',
      excerpt: 'Detailed guide covering Tamil, English, General Knowledge, and Aptitude sections with recommended books and resources.',
      category: 'TNPSC',
      author: 'K. Ramesh',
      authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      date: '2 months ago',
      readTime: '14 min read',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=250&fit=crop',
      featured: false,
    },
    {
      id: 6,
      slug: 'nda-cds-defence-exam-guide-2025',
      title: 'NDA & CDS 2025: Complete Defence Exam Preparation Guide',
      excerpt: 'Physical fitness, written exam strategy, and SSB interview preparation tips for aspiring defence officers.',
      category: 'Defence Exams',
      author: 'Capt. Vikram',
      authorImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      date: '2 months ago',
      readTime: '18 min read',
      image: 'https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?w=400&h=250&fit=crop',
      featured: true,
    },
    {
      id: 7,
      slug: 'cat-2025-quant-shortcuts',
      title: 'CAT 2025 Preparation: Quantitative Aptitude Shortcuts',
      excerpt: 'Master mathematical shortcuts for percentages, profit-loss, time-speed-distance that will save precious time in CAT.',
      category: 'MBA Entrance',
      author: 'Prof. Meera Joshi',
      authorImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
      date: '3 months ago',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
      featured: false,
    },
    {
      id: 8,
      slug: 'rbi-sebi-regulatory-exam-guide',
      title: 'RBI Grade B & SEBI Grade A: Complete Regulatory Exam Guide',
      excerpt: 'Detailed syllabus analysis, preparation strategy, and important topics for regulatory body recruitment exams.',
      category: 'Regulatory Exams',
      author: 'Ankit Kumar',
      authorImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      date: '3 months ago',
      readTime: '16 min read',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
      featured: false,
    },
    {
      id: 9,
      slug: 'time-management-competitive-exams',
      title: 'Time Management Tips for Competitive Exam Aspirants',
      excerpt: 'Effective study schedule, break patterns, and productivity hacks that helped toppers crack multiple exams.',
      category: 'Study Tips',
      author: 'Neha Gupta',
      authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      date: '4 months ago',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=250&fit=crop',
      featured: false,
    },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <LandingHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            PrepSmart Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Blog</span>
        </nav>

        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              PrepSmart Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Insights, tutorials, and updates for government exam preparation
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-muted/50"
              />
            </div>
            <Link to="/">
              <Button variant="outline" className="hidden sm:flex">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="hidden sm:flex">
                <Tag className="h-4 w-4 mr-2" />
                Pricing
              </Button>
            </Link>
          </div>
        </header>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 p-4 bg-muted/30 rounded-xl">
          {categories.slice(0, 6).map((cat) => (
            <Button
              key={cat.name}
              variant={selectedCategory === cat.name ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(cat.name)}
              className="gap-2"
            >
              <span>{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Article */}
            <Link to={`/blog/${featuredPost.slug}`}>
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                    <Badge variant="secondary">{featuredPost.category}</Badge>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-white/80 mb-6 max-w-2xl line-clamp-2">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={featuredPost.authorImage}
                      alt={featuredPost.author}
                      className="w-10 h-10 rounded-full border-2 border-white/20"
                    />
                    <div className="text-white/80 text-sm">
                      <span className="font-medium text-white">{featuredPost.author}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {featuredPost.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {featuredPost.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button className="mt-6 group/btn">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.article>
            </Link>

            {/* Blog Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer h-full"
                  >
                  <Card className="overflow-hidden border-0 bg-card/50 backdrop-blur hover:shadow-xl transition-all duration-300">
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute bottom-3 left-3 bg-background/80 backdrop-blur text-foreground">
                        {post.category}
                      </Badge>
                      {post.featured && (
                        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.authorImage}
                            alt={post.author}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm font-medium">{post.author}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                        <span className="text-primary font-medium flex items-center gap-1">
                          Read Article
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.article>
              </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Newsletter */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="relative">
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse" />
                <h3 className="text-xl font-bold mb-2">Subscribe to our Newsletter</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest articles, tutorials and updates on exam preparation delivered to your inbox.
                </p>
                <Input
                  placeholder="Your email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-3 bg-background"
                />
                <Button className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </div>
            </Card>

            {/* Categories */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === cat.name 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </span>
                    <Badge variant="secondary" className={selectedCategory === cat.name ? 'bg-white/20' : ''}>
                      {cat.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
