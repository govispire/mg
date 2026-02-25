import * as React from 'react';
const { useState, useEffect, useRef } = React;
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, Clock, ChevronRight, Home, Moon, Sun, Minus, Plus, 
  Bookmark, BookmarkCheck, Share2, Volume2, VolumeX, Check, X, Zap,
  ArrowLeft, ChevronLeft, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { allArticles, getArticleById, getRelatedArticles } from '@/components/current-affairs/articlesData';
import { Article, ReadingSettings } from '@/components/current-affairs/types';
import { ShareDialog } from '@/components/current-affairs/ShareDialog';
import ArticleQuiz from '@/components/current-affairs/ArticleQuiz';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useAudioNarration } from '@/hooks/useAudioNarration';

const CurrentAffairsReader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const article = id ? getArticleById(id) : null;
  const relatedArticles = article ? getRelatedArticles(article) : [];
  
  const [shareArticle, setShareArticle] = useState<Article | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>({
    isDarkMode: false,
    fontSize: 18,
    lineHeight: 1.8,
    fontFamily: 'sans'
  });
  const [showControls, setShowControls] = useState(true);
  
  const { 
    getReadingProgress, 
    updateReadingProgress, 
    getResumePosition, 
    markAsRead 
  } = useReadingProgress();
  
  const { isNarrating, narrationArticleId, toggleNarration, stopNarration } = useAudioNarration();
  
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarkedArticles');
    return saved ? JSON.parse(saved) : [];
  });
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarkedArticles));
  }, [bookmarkedArticles]);
  
  // Resume reading position on mount
  useEffect(() => {
    if (article) {
      const savedPosition = getResumePosition(article.id);
      if (savedPosition > 0) {
        setTimeout(() => {
          window.scrollTo({ top: savedPosition, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [article?.id]);
  
  // Track scroll progress
  useEffect(() => {
    if (!article) return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      updateReadingProgress(article.id, progress, scrollTop);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article?.id]);
  
  // Cleanup narration on unmount
  useEffect(() => {
    return () => stopNarration();
  }, []);
  
  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const isBookmarked = prev.includes(articleId);
      if (isBookmarked) {
        toast.success('Article removed from bookmarks');
        return prev.filter(id => id !== articleId);
      } else {
        toast.success('Article saved to bookmarks');
        return [...prev, articleId];
      }
    });
  };
  
  const isBookmarked = (articleId: string) => bookmarkedArticles.includes(articleId);
  
  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Medium</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };
  
  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <LandingHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you are looking for does not exist.</p>
          <Button onClick={() => navigate('/current-affairs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Current Affairs
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  const fontFamilyClass = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  }[readingSettings.fontFamily];
  
  const currentProgress = getReadingProgress(article.id);
  const isCurrentlyNarrating = isNarrating && narrationArticleId === article.id;
  
  return (
    <div className={`min-h-screen ${readingSettings.isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-background'}`}>
      {/* Reading Progress Bar - Fixed at top */}
      <div className={`fixed top-0 left-0 right-0 z-50 h-1 ${readingSettings.isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${currentProgress}%` }}
        />
      </div>
      
      {/* Sticky Controls */}
      <div className={`sticky top-0 z-40 border-b ${readingSettings.isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-background border-border'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/current-affairs')}
                className={readingSettings.isDarkMode ? 'text-gray-100' : ''}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <span className={`text-sm ${readingSettings.isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                {Math.round(currentProgress)}% read
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReadingSettings(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }))}
                className={readingSettings.isDarkMode ? 'text-gray-100' : ''}
              >
                {readingSettings.isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center gap-1 mx-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReadingSettings(prev => ({ ...prev, fontSize: Math.max(14, prev.fontSize - 2) }))}
                  className={readingSettings.isDarkMode ? 'text-gray-100' : ''}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className={`text-xs min-w-[40px] text-center ${readingSettings.isDarkMode ? 'text-gray-100' : ''}`}>
                  {readingSettings.fontSize}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReadingSettings(prev => ({ ...prev, fontSize: Math.min(28, prev.fontSize + 2) }))}
                  className={readingSettings.isDarkMode ? 'text-gray-100' : ''}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="hidden sm:flex items-center gap-1 border rounded-lg p-0.5 mx-2">
                {(['sans', 'serif', 'mono'] as const).map(font => (
                  <Button
                    key={font}
                    variant={readingSettings.fontFamily === font ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setReadingSettings(prev => ({ ...prev, fontFamily: font }))}
                    className={`text-xs h-7 px-2 ${readingSettings.isDarkMode && readingSettings.fontFamily !== font ? 'text-gray-100' : ''}`}
                  >
                    {font.charAt(0).toUpperCase()}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleNarration(article)}
                className={`${readingSettings.isDarkMode ? 'text-gray-100' : ''} ${isCurrentlyNarrating ? 'text-primary' : ''}`}
              >
                {isCurrentlyNarrating ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { markAsRead(article.id); toast.success('Marked as read'); }}
                className={`${readingSettings.isDarkMode ? 'text-gray-100' : ''} ${currentProgress >= 100 ? 'text-green-500' : ''}`}
              >
                <Check className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareArticle(article)}
                className={readingSettings.isDarkMode ? 'text-gray-100' : ''}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleBookmark(article.id)}
                className={readingSettings.isDarkMode ? 'text-gray-100' : ''}
              >
                {isBookmarked(article.id) ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main ref={contentRef} className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-2 text-sm mb-8 ${readingSettings.isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/current-affairs" className="hover:text-primary transition-colors">
            Current Affairs
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className={readingSettings.isDarkMode ? 'text-gray-100' : 'text-foreground'}>{article.category}</span>
        </nav>
        
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="outline">{article.category}</Badge>
            {getImportanceBadge(article.importance)}
            {article.hasQuiz && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <Zap className="h-3 w-3 mr-1" />
                Quiz Available
              </Badge>
            )}
            {currentProgress >= 100 && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Check className="h-3 w-3 mr-1" />
                Read
              </Badge>
            )}
          </div>
          
          <h1 
            className={`text-3xl md:text-4xl font-bold mb-4 ${fontFamilyClass}`}
            style={{ fontSize: readingSettings.fontSize + 12 }}
          >
            {article.title}
          </h1>
          
          <div className={`flex items-center gap-4 text-sm ${readingSettings.isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </span>
          </div>
        </header>
        
        {/* Featured Image */}
        {article.image && (
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-64 md:h-80 object-cover rounded-xl mb-8"
          />
        )}
        
        {/* Excerpt */}
        <p 
          className={`text-lg mb-8 ${readingSettings.isDarkMode ? 'text-gray-300' : 'text-muted-foreground'} ${fontFamilyClass}`}
          style={{ fontSize: readingSettings.fontSize + 2, lineHeight: readingSettings.lineHeight }}
        >
          {article.excerpt}
        </p>
        
        {/* Article Content */}
        <div 
          className={`prose max-w-none ${readingSettings.isDarkMode ? 'prose-invert' : ''} ${fontFamilyClass}`}
          style={{ 
            fontSize: readingSettings.fontSize,
            lineHeight: readingSettings.lineHeight
          }}
        >
          {article.content?.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6 whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-12 pt-6 border-t">
          {article.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        
        {/* Quiz CTA */}
        {article.hasQuiz && (
          <Card className={`mt-8 ${readingSettings.isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Test Your Knowledge</p>
                  <p className={`text-sm ${readingSettings.isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    {article.quizQuestions || 5} questions available for this article
                  </p>
                </div>
              </div>
              <Button size="lg" onClick={() => setShowQuiz(true)}>Start Quiz</Button>
            </CardContent>
          </Card>
        )}
        
        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className={`text-xl font-semibold mb-6 ${readingSettings.isDarkMode ? 'text-gray-100' : ''}`}>
              Related Articles
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedArticles.map(related => (
                <Card 
                  key={related.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${readingSettings.isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                  onClick={() => navigate(`/current-affairs/${related.id}`)}
                >
                  <CardContent className="p-4 flex gap-4">
                    {related.image && (
                      <img 
                        src={related.image} 
                        alt={related.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div>
                      <Badge variant="outline" className="mb-2">{related.category}</Badge>
                      <h3 className="font-medium line-clamp-2">{related.title}</h3>
                      <span className={`text-xs ${readingSettings.isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                        {related.readTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
      
      {/* Share Dialog */}
      <ShareDialog article={shareArticle} onClose={() => setShareArticle(null)} />

      {/* Quiz Dialog */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Article Quiz
            </DialogTitle>
          </DialogHeader>
          <ArticleQuiz 
            article={article} 
            onClose={() => setShowQuiz(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CurrentAffairsReader;
