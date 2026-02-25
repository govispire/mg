
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  TrendingUp,
  Brain,
  Clock,
  Target,
  BookOpen,
  BarChart3,
  Shield,
  CheckCircle,
  Award,
  Zap
} from 'lucide-react';

const features = [
  {
    title: "Smart Calendar & Scheduling",
    description: "AI-powered study planning with automated scheduling, deadline tracking, and progress monitoring",
    icon: Calendar,
    color: "bg-blue-50",
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
    features: [
      "Automated study schedule generation",
      "Exam deadline countdown",
      "Progress milestone tracking",
      "Integration with all study activities"
    ]
  },
  {
    title: "Expert Mentorship Program",
    description: "1-on-1 guidance from successful candidates, IAS officers, and industry experts across 15+ exam categories",
    icon: Users,
    color: "bg-green-50",
    iconColor: "text-green-500",
    borderColor: "border-green-200",
    features: [
      "Personal mentor matching",
      "Weekly guidance sessions",
      "Doubt resolution support",
      "Success strategy planning"
    ]
  },
  {
    title: "Advanced Analytics Dashboard",
    description: "Comprehensive performance tracking with AI-powered insights, weakness identification, and improvement recommendations",
    icon: BarChart3,
    color: "bg-purple-50",
    iconColor: "text-purple-500",
    borderColor: "border-purple-200",
    features: [
      "Performance trend analysis",
      "Subject-wise strength mapping",
      "Time management insights",
      "Comparative progress tracking"
    ]
  },
  {
    title: "Exam Tracker & Wellness",
    description: "Monitor your mental health, study patterns, stress levels, and maintain optimal work-life balance",
    icon: Brain,
    color: "bg-orange-50",
    iconColor: "text-orange-500",
    borderColor: "border-orange-200",
    features: [
      "Stress level monitoring",
      "Study pattern analysis",
      "Break time optimization",
      "Wellness goal setting"
    ]
  },
  {
    title: "Realistic Exam Simulation",
    description: "Practice on interfaces identical to actual exams with strict time constraints and authentic question patterns",
    icon: Shield,
    color: "bg-red-50",
    iconColor: "text-red-500",
    borderColor: "border-red-200",
    features: [
      "Real exam interface replication",
      "Strict mode time pressure",
      "Authentic question patterns",
      "Instant result analysis"
    ]
  },
  {
    title: "Goal Management System",
    description: "Set, track, and achieve your exam goals with milestone-based progress and adaptive target setting",
    icon: Target,
    color: "bg-indigo-50",
    iconColor: "text-indigo-500",
    borderColor: "border-indigo-200",
    features: [
      "SMART goal framework",
      "Milestone-based tracking",
      "Adaptive target adjustment",
      "Achievement celebrations"
    ]
  }
];

const platformStats = [
  { icon: BookOpen, value: "15+", label: "Exam Categories", color: "text-blue-600" },
  { icon: Users, value: "500+", label: "Expert Mentors", color: "text-green-600" },
  { icon: Award, value: "98%", label: "Success Rate", color: "text-purple-600" },
  { icon: Zap, value: "50K+", label: "Active Students", color: "text-orange-600" }
];

const FeatureSection = () => {
  return (
    <section id="features" className="w-full py-20 bg-gradient-to-br from-gray-50 to-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 mb-4">
            🚀 Comprehensive Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Exam Success</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our platform combines cutting-edge technology with proven methodologies to provide a complete exam preparation ecosystem
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {platformStats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`${feature.borderColor} border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white`}
            >
              <CardHeader className="pb-4">
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`${feature.iconColor} h-8 w-8`} />
                </div>
                <CardTitle className="text-xl font-bold mb-2">{feature.title}</CardTitle>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Platform Benefits */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Why PrepSmart Guarantees Success?</h3>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Our data-driven approach and comprehensive support system ensure you're always one step ahead
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Personalized Learning</h4>
              <p className="text-sm opacity-90">AI adapts to your learning style and pace</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Time Optimization</h4>
              <p className="text-sm opacity-90">Maximize efficiency with smart scheduling</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Expert Guidance</h4>
              <p className="text-sm opacity-90">Learn from those who've succeeded</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Proven Results</h4>
              <p className="text-sm opacity-90">98% success rate speaks for itself</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
