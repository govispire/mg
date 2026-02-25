
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Star, 
  Trophy, 
  Target, 
  Users, 
  Clock,
  ChevronRight,
  Quote
} from 'lucide-react';

interface SuccessStory {
  id: number;
  name: string;
  exam: string;
  rank: number;
  year: number;
  category: string;
  image: string;
  videoUrl: string;
  title: string;
  description: string;
  readTime: string;
  featured?: boolean;
}

const SuccessStoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleStories, setVisibleStories] = useState(6);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'banking', name: 'Banking' },
    { id: 'upsc', name: 'UPSC' },
    { id: 'ssc', name: 'SSC' },
    { id: 'railway', name: 'Railway' }
  ];

  const successStories: SuccessStory[] = [
    {
      id: 1,
      name: 'Ankit Verma',
      exam: 'UPSC CSE',
      rank: 47,
      year: 2023,
      category: 'upsc',
      image: '/placeholder.svg',
      videoUrl: '/video1.mp4',
      title: 'From Dreams to Reality: My UPSC Journey',
      description: 'How I overcame failures and achieved my dream rank with proper guidance and mentorship.',
      readTime: '5 min read',
      featured: true
    },
    {
      id: 2,
      name: 'Sneha Gupta',
      exam: 'SBI PO',
      rank: 12,
      year: 2023,
      category: 'banking',
      image: '/placeholder.svg',
      videoUrl: '/video2.mp4',
      title: 'Banking Success in First Attempt',
      description: 'Strategic preparation and mentorship helped me crack SBI PO in my very first attempt.',
      readTime: '4 min read'
    },
    {
      id: 3,
      name: 'Rahul Singh',
      exam: 'SSC CGL',
      rank: 28,
      year: 2023,
      category: 'ssc',
      image: '/placeholder.svg',
      videoUrl: '/video3.mp4',
      title: 'SSC Success Story: Consistency Pays Off',
      description: 'My journey from confusion to clarity with the help of an amazing mentor.',
      readTime: '6 min read'
    },
    {
      id: 4,
      name: 'Priya Sharma',
      exam: 'RRB NTPC',
      rank: 15,
      year: 2023,
      category: 'railway',
      image: '/placeholder.svg',
      videoUrl: '/video4.mp4',
      title: 'Railway Dreams Fulfilled',
      description: 'How personalized study plans and regular guidance led to my success.',
      readTime: '4 min read'
    },
    {
      id: 5,
      name: 'Amit Kumar',
      exam: 'IBPS PO',
      rank: 45,
      year: 2023,
      category: 'banking',
      image: '/placeholder.svg',
      videoUrl: '/video5.mp4',
      title: 'Banking Career Breakthrough',
      description: 'The mentor\'s teaching approach made all the difference in my preparation.',
      readTime: '5 min read'
    },
    {
      id: 6,
      name: 'Kavita Patel',
      exam: 'UPSC CSE',
      rank: 89,
      year: 2023,
      category: 'upsc',
      image: '/placeholder.svg',
      videoUrl: '/video6.mp4',
      title: 'Civil Services Success Against All Odds',
      description: 'From small town to civil services - a journey of determination and guidance.',
      readTime: '7 min read'
    }
  ];

  const filteredStories = selectedCategory === 'all' 
    ? successStories 
    : successStories.filter(story => story.category === selectedCategory);

  const featuredStory = successStories.find(story => story.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Success Stories That Inspire
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">
            Real journeys, real achievements, real inspiration from our mentorship community
          </p>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-3" />
              <div className="text-3xl font-bold">2,500+</div>
              <p className="opacity-90">Success Stories</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-3" />
              <div className="text-3xl font-bold">95%</div>
              <p className="opacity-90">Success Rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3" />
              <div className="text-3xl font-bold">50+</div>
              <p className="opacity-90">Exam Categories</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filter System */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-6 py-2 ${
                selectedCategory === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-blue-50'
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Featured Story Section */}
        {featuredStory && selectedCategory === 'all' && (
          <Card className="mb-12 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="grid md:grid-cols-3 gap-0">
              <div className="relative">
                <div className="aspect-video md:aspect-square bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center relative overflow-hidden">
                  <Button size="lg" className="rounded-full h-16 w-16 p-0 z-10">
                    <Play className="h-6 w-6" />
                  </Button>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-600 text-white">Featured Story</Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {featuredStory.readTime}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600">{featuredStory.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{featuredStory.name}</div>
                    <div className="text-sm text-gray-600">{featuredStory.readTime}</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Rank {featuredStory.rank}
                  </Badge>
                </div>
                
                <Quote className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold mb-4">{featuredStory.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {featuredStory.description}
                </p>
                
                <Button className="group">
                  Read Full Story
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Success Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredStories.slice(0, visibleStories).map((story) => (
            <Card key={story.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <Button size="lg" className="rounded-full h-12 w-12 p-0 z-10 group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5" />
                  </Button>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white capitalize">
                      {story.category}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600 text-sm">{story.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{story.name}</div>
                    <div className="text-xs text-gray-500">{story.readTime}</div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Rank {story.rank}
                  </Badge>
                </div>
                
                <h4 className="font-semibold mb-2 line-clamp-2">{story.title}</h4>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.description}</p>
                
                <Button variant="outline" className="w-full group">
                  Read Full Story
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Section */}
        {visibleStories < filteredStories.length && (
          <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">Discover More Inspiring Journeys</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Every success story is unique. Read more about how our mentors helped students achieve their dreams.
            </p>
            <Button 
              size="lg" 
              onClick={() => setVisibleStories(prev => prev + 6)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Load More Success Stories
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessStoriesPage;
