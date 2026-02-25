import React, { useState } from 'react';
import { Check, Star, Zap, Crown, ArrowRight, Shield, Clock, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();

  const plans = [
    {
      name: 'Free',
      icon: BookOpen,
      description: 'Perfect for getting started with exam preparation',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      features: [
        '5 Daily Quizzes',
        'Basic Performance Analytics',
        'Access to Free Study Materials',
        'Community Forum Access',
        'Email Support',
      ],
      limitations: [
        'Limited Mock Tests',
        'No Personalized Study Plans',
        'Basic Reports Only',
      ],
      cta: 'Get Started Free',
      variant: 'outline' as const,
    },
    {
      name: 'Pro',
      icon: Zap,
      description: 'Best for serious aspirants preparing for competitive exams',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      popular: true,
      features: [
        'Unlimited Daily Quizzes',
        'Advanced Performance Analytics',
        'All Study Materials Access',
        'Personalized Study Plans',
        '100+ Full-Length Mock Tests',
        'Detailed Solution Explanations',
        'Progress Tracking Dashboard',
        'Priority Email Support',
        'Mobile App Access',
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      variant: 'default' as const,
    },
    {
      name: 'Premium',
      icon: Crown,
      description: 'Ultimate preparation package with mentorship & live classes',
      monthlyPrice: 999,
      yearlyPrice: 9990,
      popular: false,
      features: [
        'Everything in Pro',
        '1-on-1 Mentor Sessions (4/month)',
        'Live Interactive Classes',
        'Interview Preparation Module',
        'Resume & Application Review',
        'Exclusive Webinars',
        'Doubt Resolution (24hr)',
        'Certificate on Completion',
        'Lifetime Access to Recordings',
        'Priority Phone Support',
      ],
      limitations: [],
      cta: 'Go Premium',
      variant: 'outline' as const,
    },
  ];

  const comparisonFeatures = [
    { feature: 'Daily Quizzes', free: '5/day', pro: 'Unlimited', premium: 'Unlimited' },
    { feature: 'Mock Tests', free: '2/month', pro: '100+', premium: '100+ with Analysis' },
    { feature: 'Study Materials', free: 'Basic', pro: 'All Access', premium: 'All + Exclusive' },
    { feature: 'Performance Analytics', free: 'Basic', pro: 'Advanced', premium: 'AI-Powered' },
    { feature: 'Study Plans', free: '✗', pro: 'Personalized', premium: 'AI-Generated' },
    { feature: 'Mentor Support', free: '✗', pro: 'Email Only', premium: '1-on-1 Sessions' },
    { feature: 'Live Classes', free: '✗', pro: '✗', premium: '✓' },
    { feature: 'Doubt Resolution', free: '48hr', pro: '24hr', premium: '6hr Priority' },
    { feature: 'Mobile App', free: 'Limited', pro: 'Full Access', premium: 'Full Access' },
    { feature: 'Offline Access', free: '✗', pro: '✓', premium: '✓' },
    { feature: 'Certificate', free: '✗', pro: '✗', premium: '✓' },
  ];

  const handleSubscribe = (planName: string) => {
    toast({
      title: 'Subscription Started',
      description: `You've selected the ${planName} plan. Redirecting to payment...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-3 w-3 mr-1" />
            Trusted by 50,000+ Students
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Choose Your Success Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Invest in your future with our comprehensive exam preparation plans. 
            Start free, upgrade when you're ready.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Label htmlFor="billing" className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>
              Monthly
            </Label>
            <Switch
              id="billing"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing" className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
              Yearly
              <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600">
                Save 17%
              </Badge>
            </Label>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-primary shadow-lg scale-105 md:scale-110' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-3 rounded-full w-fit mb-4 ${
                  plan.popular ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <plan.icon className={`h-8 w-8 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-muted-foreground">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                
                <ul className="space-y-3 text-left mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="h-5 w-5 flex items-center justify-center shrink-0">✗</span>
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.variant}
                  size="lg"
                  onClick={() => handleSubscribe(plan.name)}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>

        {/* Feature Comparison Table */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">Detailed Plan Comparison</h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold bg-primary/5 border-x border-primary/20">
                      Pro
                      <Badge variant="secondary" className="ml-2">Popular</Badge>
                    </th>
                    <th className="text-center p-4 font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center text-muted-foreground">{row.free}</td>
                      <td className="p-4 text-center bg-primary/5 border-x border-primary/20 font-medium">
                        {row.pro}
                      </td>
                      <td className="p-4 text-center">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Trust Signals */}
        <section className="mb-20">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Secure Payments', desc: '256-bit SSL encryption' },
              { icon: Clock, title: 'Instant Access', desc: 'Start learning immediately' },
              { icon: Users, title: '50,000+ Students', desc: 'Join our community' },
              { icon: Star, title: 'Money Back Guarantee', desc: '7-day refund policy' },
            ].map((item, index) => (
              <Card key={index} className="text-center p-6">
                <item.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you choose the right plan for your exam preparation journey.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="lg">
              View FAQ
            </Button>
            <Button size="lg">
              Contact Support
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
