import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Twitter, Linkedin, Copy, BookOpen, ChevronRight, Home, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const blogArticles: Record<string, {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  author: { name: string; image: string; bio: string; role: string; articles: number };
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}> = {
  'complete-guide-ibps-po-2025': {
    id: '1',
    title: 'Complete Guide to Crack IBPS PO 2025: Strategy, Syllabus & Expert Tips',
    excerpt: 'Master the IBPS PO exam with our comprehensive preparation strategy.',
    content: [
      'The Institute of Banking Personnel Selection (IBPS) conducts the Probationary Officer (PO) examination annually to recruit officers for various public sector banks in India. With lakhs of aspirants competing for a few thousand posts, having a well-structured preparation strategy is crucial for success.',
      '## Understanding the IBPS PO Exam Pattern',
      'The IBPS PO exam is conducted in three phases: Preliminary Examination, Main Examination, and Interview. The preliminary exam tests your speed and accuracy in English Language, Quantitative Aptitude, and Reasoning Ability. The main examination is more comprehensive, including Professional Knowledge and Descriptive English.',
      '## Section-wise Preparation Strategy',
      '### Quantitative Aptitude',
      'Start with building a strong foundation in basic mathematics. Focus on topics like Number System, Percentages, Profit & Loss, Simple and Compound Interest, Time & Work, and Data Interpretation. Practice shortcuts and Vedic mathematics techniques to improve your calculation speed.',
      '### Reasoning Ability',
      'This section tests your logical thinking. Focus on Puzzles, Seating Arrangements, Blood Relations, Syllogism, and Coding-Decoding. Regular practice is the key to mastering this section. Start with easy puzzles and gradually move to complex ones.',
      '### English Language',
      'Build your vocabulary by reading newspapers like The Hindu and Economic Times daily. Focus on Reading Comprehension, Cloze Test, Error Spotting, and Sentence Improvement. Practice para jumbles and sentence rearrangement regularly.',
      '## Time Management Tips',
      'Allocate your time wisely during the exam. In prelims, aim to complete the English section in 15 minutes, Quant in 25 minutes, and Reasoning in 20 minutes. Always attempt your strongest section first to build confidence.',
      '## Mock Tests and Analysis',
      'Take at least 2-3 mock tests weekly. More importantly, analyze each mock test thoroughly. Identify your weak areas and work on them. Maintain an error log to avoid repeating mistakes.',
      '## Last Month Strategy',
      'In the final month, focus on revision rather than learning new topics. Revise formulas, shortcuts, and important concepts. Take full-length mock tests in exam-like conditions to build stamina and time management skills.',
    ],
    category: 'Banking Exams',
    author: {
      name: 'Priya Sharma',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      bio: 'Priya Sharma is a banking exam expert with 8+ years of experience in coaching. She has helped over 10,000 students crack various banking exams including IBPS PO, SBI PO, and RBI Grade B.',
      role: 'Senior Banking Exam Coach',
      articles: 45,
    },
    date: 'December 20, 2024',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
    tags: ['IBPS PO', 'Banking Exams', 'Preparation Strategy', 'Study Plan', 'Mock Tests'],
  },
  'ssc-cgl-score-180-60-days': {
    id: '2',
    title: 'SSC CGL 2025 Tier-1: How to Score 180+ in 60 Days',
    excerpt: 'A comprehensive 60-day study plan to crack SSC CGL Tier-1.',
    content: [
      'The Staff Selection Commission Combined Graduate Level (SSC CGL) examination is one of the most sought-after government exams in India. Scoring 180+ in Tier-1 requires a focused approach and disciplined preparation.',
      '## The 60-Day Battle Plan',
      'Divide your 60 days into three phases: Foundation (Days 1-20), Practice (Days 21-45), and Revision & Mock Tests (Days 46-60). Each phase has specific goals and activities.',
      '## Week-by-Week Breakdown',
      '### Week 1-2: Quantitative Aptitude Basics',
      'Cover Number System, LCM-HCF, Percentages, Ratio & Proportion. Solve 50 questions daily from each topic. Use shortcuts wherever possible.',
      '### Week 3-4: Reasoning and General Intelligence',
      'Focus on Analogy, Classification, Series, Coding-Decoding, and Blood Relations. Practice visual reasoning questions including mirror images and paper folding.',
      '### Week 5-6: English and General Awareness',
      'For English, focus on vocabulary, idioms, one-word substitutions, and grammar rules. For GA, read current affairs of the last 6 months and static GK.',
      '## Daily Schedule',
      'Wake up at 5 AM and study for 8-10 hours daily. Take short breaks every 90 minutes. Solve at least 100 questions daily across all subjects.',
      '## Success Mantras',
      'Consistency is more important than intensity. Never skip a day of preparation. Join a study group for motivation and doubt solving.',
    ],
    category: 'SSC Exams',
    author: {
      name: 'Rahul Verma',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      bio: 'Rahul Verma is an SSC exam specialist who cleared SSC CGL in his first attempt with AIR 56. He now mentors aspirants and has authored multiple study guides.',
      role: 'SSC Exam Expert & Mentor',
      articles: 38,
    },
    date: 'December 18, 2024',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=600&fit=crop',
    tags: ['SSC CGL', 'Tier-1', '60 Days Plan', 'Study Strategy', 'Government Jobs'],
  },
  'railway-rrb-ntpc-guide-2025': {
    id: '3',
    title: 'Railway RRB NTPC Complete Syllabus & Preparation Guide 2025',
    excerpt: 'Everything you need to know about RRB NTPC examination.',
    content: [
      'The Railway Recruitment Board Non-Technical Popular Categories (RRB NTPC) exam is conducted by the Indian Railways to recruit candidates for various non-technical posts. This guide covers everything from syllabus to preparation strategy.',
      '## RRB NTPC Exam Structure',
      'The exam is conducted in multiple stages: CBT-1 (Computer Based Test), CBT-2, Typing Skill Test (for certain posts), and Document Verification. CBT-1 has 100 questions to be solved in 90 minutes.',
      '## Complete Syllabus Breakdown',
      '### Mathematics (30 Questions)',
      'Number System, Decimals, Fractions, LCM, HCF, Ratio & Proportions, Percentage, Mensuration, Time & Work, Time & Distance, Simple & Compound Interest, Profit & Loss, Elementary Algebra, Geometry, Trigonometry.',
      '### General Intelligence & Reasoning (30 Questions)',
      'Analogies, Completion of Number/Alphabetical Series, Coding-Decoding, Mathematical Operations, Similarities & Differences, Relationships, Analytical Reasoning, Syllogism, Jumbling, Venn Diagrams, Puzzle, Data Sufficiency.',
      '### General Awareness (40 Questions)',
      'Current Events, Indian History, Geography, Culture, Indian Polity, Economy, General Science, Famous Personalities, Important Dates.',
      '## Preparation Tips',
      'Focus more on General Awareness as it carries the highest weightage. Read newspapers daily and make notes of current affairs. For Mathematics, practice speed calculation techniques.',
      '## Important Books',
      'Use R.S. Aggarwal for Maths and Reasoning. For GK, refer to Lucent GK and monthly current affairs magazines.',
    ],
    category: 'Railway Exams',
    author: {
      name: 'Sneha Patel',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      bio: 'Sneha Patel is a railway exam expert who has been training aspirants for RRB exams for over 6 years. She previously worked as a Railway clerk before becoming a full-time educator.',
      role: 'Railway Exam Specialist',
      articles: 28,
    },
    date: 'December 15, 2024',
    readTime: '15 min read',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&h=600&fit=crop',
    tags: ['RRB NTPC', 'Railway Jobs', 'CBT Exam', 'Syllabus', 'Preparation Guide'],
  },
};

const relatedArticles = [
  {
    id: 'ssc-cgl-score-180-60-days',
    title: 'SSC CGL 2025 Tier-1: How to Score 180+ in 60 Days',
    category: 'SSC Exams',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop',
    readTime: '10 min',
  },
  {
    id: 'railway-rrb-ntpc-guide-2025',
    title: 'Railway RRB NTPC Complete Syllabus & Preparation Guide 2025',
    category: 'Railway Exams',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=250&fit=crop',
    readTime: '15 min',
  },
  {
    id: 'complete-guide-ibps-po-2025',
    title: 'Complete Guide to Crack IBPS PO 2025',
    category: 'Banking Exams',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
    readTime: '12 min',
  },
];

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  const article = slug ? blogArticles[slug] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <LandingHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article.title;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({ title: 'Link Copied!', description: 'Article link copied to clipboard.' });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const filteredRelated = relatedArticles.filter(a => a.id !== slug).slice(0, 3);

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
          <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground line-clamp-1 max-w-[200px]">{article.title}</span>
        </nav>

        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden mb-8"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-[300px] md:h-[400px] object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-background/80 backdrop-blur text-foreground">{article.category}</Badge>
              </div>
            </motion.div>

            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{article.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={article.author.image} alt={article.author.name} />
                    <AvatarFallback>{article.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{article.author.name}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {article.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              {article.content.map((paragraph, idx) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={idx} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={idx} className="text-xl font-semibold mt-6 mb-3">{paragraph.replace('### ', '')}</h3>;
                }
                return <p key={idx} className="mb-4 text-muted-foreground leading-relaxed">{paragraph}</p>;
              })}
            </div>

            <Separator className="my-8" />

            {/* Author Bio */}
            <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted/30">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={article.author.image} alt={article.author.name} />
                  <AvatarFallback className="text-2xl">{article.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">About the Author</h3>
                  <p className="text-primary font-medium mb-2">{article.author.name}</p>
                  <p className="text-sm text-muted-foreground mb-3">{article.author.role}</p>
                  <p className="text-muted-foreground mb-4">{article.author.bio}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {article.author.articles} Articles
                    </Badge>
                    <Button variant="outline" size="sm">Follow</Button>
                  </div>
                </div>
              </div>
            </Card>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Share Buttons */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Share this Article
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" onClick={() => handleShare('facebook')} className="gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('twitter')} className="gap-2">
                  <Twitter className="h-4 w-4 text-sky-500" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('linkedin')} className="gap-2">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('copy')} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>
            </Card>

            {/* Related Articles */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Related Articles</h3>
              <div className="space-y-4">
                {filteredRelated.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blog/${related.id}`}
                    className="flex gap-3 group"
                  >
                    <img
                      src={related.image}
                      alt={related.title}
                      className="w-20 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">{related.readTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* CTA */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <h3 className="font-bold mb-2">Start Your Preparation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get access to mock tests, study materials, and personalized study plans.
              </p>
              <Link to="/pricing">
                <Button className="w-full">View Plans</Button>
              </Link>
            </Card>
          </aside>
        </div>

        {/* More Related Articles */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">More Articles You May Like</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedArticles.map((related) => (
              <Link key={related.id} to={`/blog/${related.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                  <div className="relative">
                    <img
                      src={related.image}
                      alt={related.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute bottom-3 left-3 bg-background/80 backdrop-blur">
                      {related.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">{related.readTime}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogArticle;
