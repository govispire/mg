
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AuthModal from './auth/AuthModal';
import {
  Calendar,
  Users,
  TrendingUp,
  Brain,
  Target,
  Award,
  BookOpen,
  Clock,
  BarChart3,
  Shield,
  Star,
  CheckCircle
} from 'lucide-react';

const Hero = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Calendar",
      description: "AI-powered study scheduling with progress tracking and deadline management",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Expert Mentorship",
      description: "1-on-1 guidance from successful candidates and industry experts",
      color: "bg-green-500"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Detailed insights into your strengths, weaknesses, and improvement areas",
      color: "bg-purple-500"
    },
    {
      icon: Brain,
      title: "Exam Tracker",
      description: "Monitor your mental health, study patterns, and maintain work-life balance",
      color: "bg-orange-500"
    },
    {
      icon: Target,
      title: "Goal Management",
      description: "Set, track, and achieve your exam goals with milestone-based progress",
      color: "bg-red-500"
    },
    {
      icon: Shield,
      title: "Strict Mode Practice",
      description: "Real exam conditions with time pressure and authentic interfaces",
      color: "bg-indigo-500"
    }
  ];

  const stats = [
    { value: "50,000+", label: "Students Enrolled" },
    { value: "98%", label: "Success Rate" },
    { value: "500+", label: "Expert Mentors" },
    { value: "15+", label: "Exam Categories" }
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      exam: "UPSC CSE 2023",
      rank: "Rank 47",
      quote: "The mentorship program and analytics helped me identify my weak areas and improve systematically."
    },
    {
      name: "Priya Patel",
      exam: "SBI PO 2023",
      rank: "Selected",
      quote: "The calendar feature and exam tracker kept me motivated throughout my preparation journey."
    }
  ];

  return (
    <section className="hero-gradient w-full py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Main Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                🚀 India's #1 Competitive Exam Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-darkblue">
                Master Your Exams with
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI-Powered</span> Preparation
              </h1>
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Comprehensive platform combining expert mentorship, smart analytics, personalized study plans, and real exam simulations for guaranteed success.
              </p>
            </div>

            {/* Key Features Highlight */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium">Expert 1-on-1 Mentorship</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">AI-Powered Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Smart Study Scheduling</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium">Exam Tracker</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                    Start Your Journey
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                  <AuthModal activeTab="register" setActiveTab={() => { }} />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-colors px-8 py-4 text-lg">
                    Explore Features
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[80vh] overflow-y-auto">
                  <div className="p-4 space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Complete Exam Preparation Ecosystem</h2>
                      <p className="text-gray-600">Everything you need to ace your competitive exams</p>
                    </div>

                    <div className="grid gap-4">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
                          <div className={`${feature.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
                            <feature.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="w-full h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

              {/* Floating Cards */}
              <div className="absolute top-8 left-8 bg-white rounded-lg shadow-lg p-4 max-w-[200px] animate-float">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Today's Schedule</span>
                </div>
                <div className="text-xs text-gray-600">
                  <div>9:00 AM - Math Practice</div>
                  <div>2:00 PM - Mentor Session</div>
                  <div>6:00 PM - Mock Test</div>
                </div>
              </div>

              <div className="absolute top-16 right-8 bg-white rounded-lg shadow-lg p-4 max-w-[180px] animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Progress</span>
                </div>
                <div className="text-xs text-gray-600">
                  <div>Weekly Goal: 85% ✅</div>
                  <div>Accuracy: 92%</div>
                </div>
              </div>

              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Mentor Feedback</span>
                </div>
                <div className="text-xs text-gray-600">
                  "Great improvement in reasoning!" ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-darkblue mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PrepSmart?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides everything you need for exam success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.exam} • {testimonial.rank}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                  <div className="flex justify-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
