
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Star,
  MapPin,
  Calendar,
  Users,
  Trophy,
  Clock,
  Target,
  Play,
  Heart,
  MessageSquare,
  Video,
  BookOpen,
  Award,
  CheckCircle,
  GraduationCap,
  ChevronRight,
  X
} from 'lucide-react';
import { Mentor } from '@/data/mentorshipData';
import { useIsMobile } from '@/hooks/use-mobile';

interface MentorDetailsModalProps {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
}

const MentorDetailsModal: React.FC<MentorDetailsModalProps> = ({ mentor, isOpen, onClose }) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  if (!mentor) return null;

  const packages = [
    {
      id: 'basic',
      name: 'Basic',
      price: 4999,
      sessions: 4,
      duration: '1 month',
      features: ['4 One-on-One Sessions', 'Study Plan', 'Doubt Resolution', 'Progress Tracking']
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 12999,
      sessions: 12,
      duration: '3 months',
      features: ['12 One-on-One Sessions', 'Personalized Study Plan', 'Mock Test Analysis', 'Progress Tracking', '24/7 Chat Support']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 22999,
      sessions: 24,
      duration: '6 months',
      features: ['24 One-on-One Sessions', 'Complete Exam Strategy', 'Mock Test Analysis', 'Interview Preparation', '24/7 Chat Support', 'Career Guidance']
    }
  ];

  const books = [
    {
      title: 'Banking Success Formula',
      price: 599,
      image: '/placeholder.svg',
      description: 'Complete guide for banking exams'
    },
    {
      title: 'Quantitative Aptitude Mastery',
      price: 799,
      image: '/placeholder.svg',
      description: 'Advanced techniques for quant section'
    }
  ];

  const reviews = [
    {
      name: 'Amit Sharma',
      rating: 5,
      comment: 'Excellent guidance throughout my preparation journey.',
      date: '2 weeks ago',
      avatar: '/placeholder.svg'
    },
    {
      name: 'Priya Singh',
      rating: 5,
      comment: 'Very patient and explains concepts clearly.',
      date: '1 month ago',
      avatar: '/placeholder.svg'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[95vh] m-2' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto p-0`}>
        <div className={isMobile ? 'p-4' : 'p-6'}>
          {/* Mobile Close Button */}
          {isMobile && (
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Header Section */}
          <div className={`flex gap-6 mb-6 ${isMobile ? 'flex-col' : 'flex-col md:flex-row'}`}>
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className={`${isMobile ? 'w-20 h-20' : 'w-24 h-24'} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold ${isMobile ? 'text-xl' : 'text-2xl'} border-4 border-blue-200`}>
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className={`font-bold text-gray-900 mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{mentor.name}</h2>
              <p className="text-gray-600 mb-3">{mentor.qualification}</p>

              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(mentor.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{mentor.rating}</span>
                  <span className="ml-1 text-sm text-gray-500">({mentor.reviews} reviews)</span>
                </div>
              </div>

              <div className={`flex flex-wrap gap-4 text-sm text-gray-600 ${isMobile ? 'justify-center' : 'justify-start'}`}>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Delhi, India</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Available Mon-Fri</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4 mb-6`}>
            <Card className="bg-green-50 border-green-200">
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
                <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className={`font-bold text-green-700 ${isMobile ? 'text-lg' : 'text-xl'}`}>500+</div>
                <p className={`text-green-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Students Succeeded</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
                <GraduationCap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className={`font-bold text-blue-700 ${isMobile ? 'text-lg' : 'text-xl'}`}>{mentor.experience}</div>
                <p className={`text-blue-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Experience</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
                <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className={`font-bold text-purple-700 ${isMobile ? 'text-lg' : 'text-xl'}`}>95%</div>
                <p className={`text-purple-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Success Rate</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
                <Trophy className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className={`font-bold text-orange-700 ${isMobile ? 'text-lg' : 'text-xl'}`}>1200+</div>
                <p className={`text-orange-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Students</p>
              </CardContent>
            </Card>
          </div>

          {/* Free Intro Session Card */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 mb-6">
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
              <h3 className={`font-semibold text-green-800 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>Free Introductory Session</h3>
              <p className={`text-green-700 mb-4 ${isMobile ? 'text-sm' : ''}`}>Get to know your mentor before committing to a package</p>
              <Button className={`bg-green-600 hover:bg-green-700 ${isMobile ? 'w-full touch-button' : ''}`}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Free Session
              </Button>
            </CardContent>
          </Card>

          {/* Introduction Video Section */}
          <Card className="mb-6">
            <CardContent className={isMobile ? 'p-4' : 'p-6'}>
              <div className={`${isMobile ? 'space-y-4' : 'grid md:grid-cols-2 gap-6'}`}>
                <div className="relative">
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <Button size="lg" className="rounded-full h-16 w-16 p-0">
                      <Play className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      3:45
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className={`font-semibold text-blue-800 mb-2 ${isMobile ? 'text-sm' : ''}`}>About My Teaching Approach</h4>
                  <p className={`text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    I believe in personalized learning where each student's unique strengths and weaknesses are addressed.
                    My methodology focuses on concept clarity, strategic problem-solving, and consistent practice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`${isMobile ? 'grid w-full grid-cols-2' : 'grid w-full grid-cols-4'} mb-6`}>
              <TabsTrigger value="overview" className={isMobile ? 'text-xs' : 'text-sm'}>Overview</TabsTrigger>
              {!isMobile && <TabsTrigger value="success-stories" className="text-sm">Success Stories</TabsTrigger>}
              {!isMobile && <TabsTrigger value="books" className="text-sm">Books</TabsTrigger>}
              {!isMobile && <TabsTrigger value="reviews" className="text-sm">Reviews</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className={`${isMobile ? 'space-y-4' : 'grid md:grid-cols-2 gap-6'}`}>
                <Card>
                  <CardHeader>
                    <CardTitle className={isMobile ? 'text-base' : ''}>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>{mentor.bio}</p>
                    <div className="mt-4 space-y-2">
                      <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Delhi, India</span>
                      </div>
                      <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Available Mon-Fri, 6 PM - 9 PM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className={isMobile ? 'text-base' : ''}>Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>IIT Delhi</div>
                          <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>B.Tech Computer Science</div>
                          <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>2015-2019</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Delhi University</div>
                          <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>M.A. Economics</div>
                          <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>2019-2021</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className={isMobile ? 'text-base' : ''}>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}`}>
                    {[
                      { icon: Trophy, title: 'SBI PO Topper', desc: 'All India Rank 1, 2018' },
                      { icon: Award, title: 'IBPS PO', desc: 'All India Rank 5, 2019' },
                      { icon: Star, title: 'Best Mentor', desc: 'Mentor of the Year 2023' }
                    ].map((achievement, index) => (
                      <div key={index} className={`text-center p-4 bg-gray-50 rounded-lg ${isMobile ? 'flex items-center text-left' : ''}`}>
                        <achievement.icon className={`text-blue-600 mx-auto mb-2 ${isMobile ? 'h-6 w-6 mr-3 mb-0' : 'h-8 w-8'}`} />
                        <div>
                          <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{achievement.title}</div>
                          <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{achievement.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {!isMobile && (
              <>
                <TabsContent value="success-stories" className="space-y-4">
                  {[
                    { name: 'Rahul Kumar', exam: 'SBI PO 2023', rank: 8, testimonial: 'Amazing guidance throughout my preparation journey.' },
                    { name: 'Sneha Patel', exam: 'IBPS PO 2023', rank: 15, testimonial: 'Very patient and explains concepts clearly.' }
                  ].map((story, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{story.name}</span>
                              <Badge className="bg-green-100 text-green-800">Rank {story.rank}</Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{story.exam}</div>
                            <p className="text-gray-700">"{story.testimonial}"</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="books" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {books.map((book, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-24 bg-blue-100 rounded flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{book.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{book.description}</p>
                              <div className="flex items-center justify-between">
                                <Button size="sm">Download PDF</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </>
            )}

            {/* Packages Tab Removed */}

            {!isMobile && (
              <TabsContent value="reviews" className="space-y-4">
                {reviews.map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{review.name[0]}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.name}</span>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            )}
          </Tabs>

          {/* Action Button Row */}
          <div className={`flex flex-wrap gap-3 mt-6 pt-6 border-t ${isMobile ? 'flex-col' : ''}`}>
            <Button
              variant="outline"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`${isWishlisted ? 'bg-red-50 border-red-200 text-red-600' : ''} ${isMobile ? 'w-full touch-button' : ''}`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
              {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </Button>

            <Button variant="outline" className={isMobile ? 'w-full touch-button' : ''}>
              <Calendar className="h-4 w-4 mr-2" />
              Free Intro
            </Button>

            <Button variant="outline" className={isMobile ? 'w-full touch-button' : ''}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Button>

            <Button className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? 'w-full touch-button' : ''}`}>
              Book Free Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
};

export default MentorDetailsModal;
