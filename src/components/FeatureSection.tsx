
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
    iconColor: "text-blue-700",
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
    color: "bg-indigo-50",
    iconColor: "text-indigo-700",
    borderColor: "border-indigo-200",
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
    color: "bg-cyan-50",
    iconColor: "text-cyan-700",
    borderColor: "border-cyan-200",
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
    color: "bg-slate-50",
    iconColor: "text-slate-700",
    borderColor: "border-slate-200",
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
    color: "bg-violet-50",
    iconColor: "text-violet-700",
    borderColor: "border-violet-200",
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
    color: "bg-emerald-50",
    iconColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    features: [
      "SMART goal framework",
      "Milestone-based tracking",
      "Adaptive target adjustment",
      "Achievement celebrations"
    ]
  }
];

const platformStats = [
  { icon: BookOpen, value: "15+", label: "Exam Categories", color: "text-blue-700" },
  { icon: Users, value: "500+", label: "Expert Mentors", color: "text-indigo-700" },
  { icon: Award, value: "98%", label: "Success Rate", color: "text-slate-800" },
  { icon: Zap, value: "50K+", label: "Active Students", color: "text-violet-700" }
];

const FeatureSection = () => {
  return (
    <section id="features" className="w-full scroll-mt-20 bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-14 text-center">
          <Badge className="mb-4 border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
            Comprehensive features
          </Badge>
          <h2 className="mb-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Everything you need for
            <span className="ml-2 text-blue-700">exam success</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-600">
            Our platform combines clear guidance, reliable data, and practical tools to support every stage of your prep journey.
          </p>
        </div>

        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {platformStats.map((stat, index) => (
            <Card key={index} className="border border-slate-200 bg-white text-center shadow-sm">
              <CardContent className="pt-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`mb-1 text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`${feature.borderColor} border-2 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <CardHeader className="pb-4">
                <div className={`${feature.color} mb-4 flex h-14 w-14 items-center justify-center rounded-2xl`}>
                  <feature.icon className={`${feature.iconColor} h-7 w-7`} />
                </div>
                <CardTitle className="mb-2 text-xl font-semibold text-slate-900">{feature.title}</CardTitle>
                <p className="text-sm leading-7 text-slate-600">{feature.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-3xl bg-slate-900 p-8 text-white md:p-12">
          <div className="mb-8 text-center">
            <h3 className="mb-4 text-3xl font-semibold">Why Examerit keeps students moving forward</h3>
            <p className="mx-auto max-w-3xl text-lg text-slate-300">
              A calmer, clearer experience helps you focus on the next best action instead of navigating clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <TrendingUp className="h-7 w-7 text-blue-300" />
              </div>
              <h4 className="mb-2 font-semibold">Personalized learning</h4>
              <p className="text-sm text-slate-300">AI adapts to your learning style and pace.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <Clock className="h-7 w-7 text-blue-300" />
              </div>
              <h4 className="mb-2 font-semibold">Time optimization</h4>
              <p className="text-sm text-slate-300">Spend less time organizing and more time practicing.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <Users className="h-7 w-7 text-blue-300" />
              </div>
              <h4 className="mb-2 font-semibold">Expert guidance</h4>
              <p className="text-sm text-slate-300">Learn from those who have already cleared the exams.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <Award className="h-7 w-7 text-blue-300" />
              </div>
              <h4 className="mb-2 font-semibold">Proven results</h4>
              <p className="text-sm text-slate-300">Consistency, analytics, and support make progress visible.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
