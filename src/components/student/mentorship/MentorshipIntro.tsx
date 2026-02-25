import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Target, Users, Trophy, Sparkles, CheckCircle, ArrowRight, TrendingUp,
    BrainCircuit, Clock, Award, Star, Zap, Shield, BarChart3, MessageCircle,
    Video, BookOpen, Calendar, Rocket, Heart, ChevronRight
} from 'lucide-react';

interface MentorshipIntroProps {
    onNavigate: (tab: string) => void;
    onStartWizard?: () => void;
}

const MentorshipIntro: React.FC<MentorshipIntroProps> = ({ onNavigate, onStartWizard }) => {
    const [statsAnimated, setStatsAnimated] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    useEffect(() => {
        // Trigger stats animation on mount
        setTimeout(() => setStatsAnimated(true), 300);

        // Auto-rotate testimonials
        const interval = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const problems = [
        '😰 Confused about where to start?',
        '📚 Overwhelmed with too much syllabus?',
        '⏰ Struggling with time management?',
        '😔 Lost motivation after failures?',
        '❌ Making the same mistakes repeatedly?'
    ];

    const solutions = [
        { icon: <Target />, title: 'Clear Roadmap', desc: 'Get a personalized study plan from day 1' },
        { icon: <Users />, title: 'Expert Support', desc: '24/7 access to mentors who cleared your exam' },
        { icon: <TrendingUp />, title: 'Track Progress', desc: 'See improvement every single day' },
        { icon: <Heart />, title: 'Stay Motivated', desc: 'Regular check-ins keep you accountable' }
    ];

    const stats = [
        { value: 5247, label: 'Students Mentored', suffix: '+', color: 'text-blue-600' },
        { value: 94, label: 'Success Rate', suffix: '%', color: 'text-green-600' },
        { value: 156, label: 'Expert Mentors', suffix: '+', color: 'text-purple-600' },
        { value: 4.9, label: 'Average Rating', suffix: '/5', color: 'text-yellow-600' }
    ];

    const features = [
        {
            icon: <Video className="h-6 w-6" />,
            title: '1-on-1 Live Sessions',
            description: 'Personal video calls with your mentor',
            badge: 'Popular'
        },
        {
            icon: <MessageCircle className="h-6 w-6" />,
            title: '24/7 Doubt Clearing',
            description: 'Get answers within 2 hours, anytime',
            badge: 'Fast'
        },
        {
            icon: <BarChart3 className="h-6 w-6" />,
            title: 'Weekly Mock Analysis',
            description: 'Detailed review of your test performance',
            badge: null
        },
        {
            icon: <BookOpen className="h-6 w-6" />,
            title: 'Custom Study Material',
            description: 'Resources tailored to your weak areas',
            badge: null
        },
        {
            icon: <Calendar className="h-6 w-6" />,
            title: 'Structured Schedule',
            description: 'Daily tasks to keep you on track',
            badge: null
        },
        {
            icon: <Award className="h-6 w-6" />,
            title: 'Success Guarantee',
            description: 'Refund if you follow plan and don\'t see results',
            badge: 'Guarantee'
        }
    ];

    const testimonials = [
        {
            name: 'Priya Sharma',
            exam: 'IBPS PO 2024',
            score: 'Score: 92/100',
            quote: 'My mentor helped me improve from 45% to 92% in just 3 months! The personalized attention made all the difference.',
            image: 'PS',
            rank: 'AIR 127'
        },
        {
            name: 'Rahul Kumar',
            exam: 'SSC CGL 2024',
            score: 'Score: 156/200',
            quote: 'I was about to give up after 2 failures. My mentor\'s guidance helped me clear in my 3rd attempt with a great score!',
            image: 'RK',
            rank: 'AIR 342'
        },
        {
            name: 'Anjali Verma',
            exam: 'RRB NTPC 2024',
            score: 'Score: 98/120',
            quote: 'The daily study plan and regular check-ins kept me disciplined. Best investment in my preparation!',
            image: 'AV',
            rank: 'AIR 89'
        }
    ];

    const comparison = [
        { aspect: 'Study Plan', selfStudy: '❌ Generic', mentorship: '✅ Personalized' },
        { aspect: 'Doubt Clearing', selfStudy: '❌ YouTube/Forums', mentorship: '✅ Expert 1-on-1' },
        { aspect: 'Motivation', selfStudy: '❌ Alone', mentorship: '✅ Constant Support' },
        { aspect: 'Mistakes', selfStudy: '❌ Repeat Errors', mentorship: '✅ Guided Correction' },
        { aspect: 'Mock Analysis', selfStudy: '❌ Self-review', mentorship: '✅ Expert Review' },
        { aspect: 'Success Rate', selfStudy: '⚠️ 30-40%', mentorship: '✅ 94%' }
    ];

    const CountUpNumber = ({ end, suffix, duration = 2000 }: { end: number, suffix: string, duration?: number }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            if (!statsAnimated) return;

            let startTime: number;
            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                setCount(Math.floor(progress * end));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }, [statsAnimated, end, duration]);

        return <span>{count}{suffix}</span>;
    };

    return (
        <div className="space-y-12 pb-12 animate-in fade-in duration-500">
            {/* Hero Section with Emotional Hook */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white p-8 md:p-16">
                {/* Animated background blobs */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-purple-500 opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center rounded-full bg-yellow-400/20 px-4 py-2 text-sm font-medium text-yellow-300 backdrop-blur-md mb-6 border border-yellow-400/30 animate-bounce">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Limited Offer: 20% OFF on your first month!
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Stop Struggling Alone.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                            Start Winning with a Mentor
                        </span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Join <strong className="text-white">5,247+ students</strong> who transformed their exam preparation with expert 1-on-1 guidance.
                        <strong className="text-green-400"> 94% success rate.</strong>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Button
                            size="lg"
                            className="bg-white text-purple-900 hover:bg-gray-100 font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:scale-105 transition-transform"
                            onClick={onStartWizard}
                        >
                            <Rocket className="mr-2 h-5 w-5" />
                            Start Your Journey FREE
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full backdrop-blur-sm"
                            onClick={() => onNavigate('success-stories')}
                        >
                            <Trophy className="mr-2 h-5 w-5" />
                            See Success Stories
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span>7-Day Money Back Guarantee • No Credit Card Required</span>
                    </div>
                </div>
            </div>

            {/* Problem-Solution Section */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-100">
                    <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2">
                        <span className="text-3xl">😓</span>
                        Are You Facing These Challenges?
                    </h3>
                    <ul className="space-y-4">
                        {problems.map((problem, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-3 text-gray-700 font-medium animate-slide-in-left"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <span className="text-xl">{problem}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-200">
                    <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                        <Zap className="h-7 w-7 text-green-600" />
                        Mentorship Solves All of This
                    </h3>
                    <div className="space-y-4">
                        {solutions.map((solution, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all animate-slide-in-right"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="p-2 bg-green-100 rounded-lg text-green-600 flex-shrink-0">
                                    {solution.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{solution.title}</h4>
                                    <p className="text-sm text-gray-600">{solution.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Animated Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold text-center mb-8">Trusted by Thousands of Aspirants</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color.replace('text', 'text-white')}`}>
                                {statsAnimated && <CountUpNumber end={stat.value} suffix={stat.suffix} />}
                            </div>
                            <div className="text-sm text-gray-200 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <div>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">What You Get with Mentorship</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Everything you need to crack your exam, all in one place
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
                        >
                            {feature.badge && (
                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                                        {feature.badge}
                                    </span>
                                </div>
                            )}
                            <CardContent className="p-6">
                                <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl w-fit mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                    Self-Study vs. Mentorship
                </h2>
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                            <tr>
                                <th className="py-4 px-6 text-left font-bold">Aspect</th>
                                <th className="py-4 px-6 text-center font-bold">Self-Study</th>
                                <th className="py-4 px-6 text-center font-bold bg-yellow-400/20">With Mentorship</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparison.map((row, index) => (
                                <tr
                                    key={index}
                                    className={`border-b border-gray-100 hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                >
                                    <td className="py-4 px-6 font-semibold text-gray-800">{row.aspect}</td>
                                    <td className="py-4 px-6 text-center text-gray-600">{row.selfStudy}</td>
                                    <td className="py-4 px-6 text-center font-semibold text-green-700 bg-green-50">
                                        {row.mentorship}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Testimonials Carousel */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                    Real Students, Real Results
                </h2>
                <div className="relative max-w-4xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-500 ${index === activeTestimonial ? 'opacity-100 block' : 'opacity-0 hidden'}`}
                        >
                            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 relative">
                                <div className="absolute top-6 right-6 flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                <div className="flex items-start gap-6 mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                        {testimonial.image}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-purple-600 font-semibold">{testimonial.exam}</p>
                                        <div className="flex gap-3 mt-2">
                                            <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                                                {testimonial.rank}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
                                                {testimonial.score}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-lg italic leading-relaxed">"{testimonial.quote}"</p>
                            </div>
                        </div>
                    ))}

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTestimonial(index)}
                                className={`h-2 rounded-full transition-all ${index === activeTestimonial ? 'w-8 bg-purple-600' : 'w-2 bg-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Preparation?</h2>
                    <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                        Join thousands of successful students. Start your personalized mentorship journey today!
                    </p>

                    <Button
                        size="lg"
                        className="bg-white text-purple-900 hover:bg-gray-100 font-bold px-12 py-7 text-xl rounded-full shadow-2xl hover:scale-110 transition-transform"
                        onClick={onStartWizard}
                    >
                        <Rocket className="mr-3 h-6 w-6" />
                        Get Started - It's FREE!
                        <ChevronRight className="ml-3 h-6 w-6" />
                    </Button>

                    <p className="mt-6 text-sm text-gray-200">
                        💳 No payment required to start • ⚡ Get matched in 2 minutes • 🎯 Cancel anytime
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MentorshipIntro;
