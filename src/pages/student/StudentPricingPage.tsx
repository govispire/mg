import React, { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { usePricingStore } from '@/hooks/usePricingStore';
import {
  Check, X, Star, Zap, Crown, BookOpen, ShieldCheck, ArrowRight,
  Brain, FileText, Newspaper, BookA, Layers, Package, Gift,
  Users, Shield, Clock, TrendingUp, ChevronRight, Sparkles, IndianRupee,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Brain, FileText, Newspaper, BookA, ShieldCheck, Layers,
  mentorship: Brain, vocabulary: BookA, 'current-affairs-premium': Newspaper,
  'pdf-bundle': FileText, 'strict-mode': ShieldCheck,
};

const PLAN_COLORS: Record<string, { border: string; badge: string; btn: string; glow: string }> = {
  free:     { border: 'border-slate-200',   badge: 'bg-slate-100 text-slate-700',     btn: 'bg-slate-800 hover:bg-slate-700',     glow: '' },
  smart:    { border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', glow: 'shadow-emerald-100' },
  pro:      { border: 'border-indigo-400',  badge: 'bg-indigo-600 text-white',        btn: 'bg-indigo-600 hover:bg-indigo-700',   glow: 'shadow-indigo-200 shadow-xl' },
  'pro-max':{ border: 'border-amber-300',   badge: 'bg-amber-500 text-white',         btn: 'bg-amber-500 hover:bg-amber-600',     glow: 'shadow-amber-100' },
};

// ─── Hero Section ─────────────────────────────────────────────────────────────

const HeroSection: React.FC<{ yearly: boolean; setYearly: (v: boolean) => void }> = ({ yearly, setYearly }) => (
  <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white py-20 px-4">
    {/* Background blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-4xl mx-auto text-center space-y-6">
      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm">
        <Sparkles className="h-4 w-4 text-amber-400" />
        Trusted by 50,000+ Government Exam Aspirants
      </div>

      <h1 className="text-4xl sm:text-5xl font-black leading-tight">
        Choose Your{' '}
        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Success Plan
        </span>
      </h1>

      <p className="text-lg text-indigo-200 max-w-xl mx-auto">
        Prepare smarter for Banking, SSC, Railway, UPSC and more — at your own pace, on your terms.
      </p>

      {/* Trust pills */}
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        {['7-day free trial', 'Cancel anytime', 'Secure payments', 'Instant access'].map(t => (
          <span key={t} className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1">
            <Check className="h-3.5 w-3.5 text-emerald-400" /> {t}
          </span>
        ))}
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <span className={`text-sm font-medium ${!yearly ? 'text-white' : 'text-white/50'}`}>Monthly</span>
        <Switch
          checked={yearly}
          onCheckedChange={setYearly}
          className="data-[state=checked]:bg-emerald-500"
        />
        <span className={`text-sm font-medium flex items-center gap-2 ${yearly ? 'text-white' : 'text-white/50'}`}>
          Yearly
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">SAVE 17%</Badge>
        </span>
      </div>
    </div>
  </section>
);

// ─── Plan Cards ───────────────────────────────────────────────────────────────

const PlansSection: React.FC<{ yearly: boolean }> = ({ yearly }) => {
  const { getActivePlans } = usePricingStore();
  const navigate = useNavigate();
  const plans = getActivePlans();

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-foreground">Subscription Plans</h2>
        <p className="text-muted-foreground mt-2">Full access to all features within your plan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {plans.map(plan => {
          const colors = PLAN_COLORS[plan.id] ?? PLAN_COLORS.free;
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isPopular = plan.badge === 'MOST POPULAR';

          return (
            <Card key={plan.id} className={`relative border-2 transition-all ${colors.border} ${isPopular ? `scale-105 ${colors.glow}` : ''}`}>
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${colors.badge}`}>
                  {plan.badge}
                </div>
              )}
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                </div>

                <div>
                  {plan.monthlyPrice === 0 ? (
                    <div className="text-3xl font-black text-foreground">Free</div>
                  ) : (
                    <div>
                      <div className="text-3xl font-black text-foreground">{fmt(price)}</div>
                      <div className="text-xs text-muted-foreground">
                        {yearly ? `₹${Math.round(plan.yearlyPrice / 12).toLocaleString('en-IN')}/mo billed yearly` : '/month'}
                      </div>
                    </div>
                  )}
                  {plan.trialDays > 0 && (
                    <div className="text-xs text-emerald-600 font-medium mt-1">{plan.trialDays}-day free trial</div>
                  )}
                </div>

                <Button
                  className={`w-full text-white gap-1.5 ${colors.btn}`}
                  onClick={() => navigate(`/student/checkout?type=plan&id=${plan.id}&billing=${yearly ? 'yearly' : 'monthly'}`)}
                >
                  {plan.monthlyPrice === 0 ? 'Get Started Free' : `Start ${plan.trialDays > 0 ? 'Free Trial' : 'Now'}`}
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <ul className="space-y-2">
                  {plan.features.slice(0, 8).map(f => (
                    <li key={f.id} className="flex items-start gap-2 text-sm">
                      {f.value === false ? (
                        <X className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isPopular ? 'text-indigo-500' : 'text-emerald-500'}`} />
                      )}
                      <span className={`${f.value === false ? 'text-muted-foreground/60 line-through' : 'text-foreground'} ${f.isHighlighted ? 'font-semibold' : ''}`}>
                        {f.label}
                        {typeof f.value === 'string' && f.value !== 'true' && f.value !== 'false' ? (
                          <span className="text-muted-foreground font-normal"> — {f.value}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

// ─── Packages Section ─────────────────────────────────────────────────────────

const PackagesSection: React.FC = () => {
  const { getActivePackages } = usePricingStore();
  const navigate = useNavigate();
  const packages = getActivePackages();

  const CAT_COLORS: Record<string, string> = {
    Banking: 'bg-blue-100 text-blue-700', SSC: 'bg-orange-100 text-orange-700',
    Railway: 'bg-green-100 text-green-700', UPSC: 'bg-purple-100 text-purple-700',
    TNPSC: 'bg-rose-100 text-rose-700', Defence: 'bg-sky-100 text-sky-700',
  };

  return (
    <section className="py-16 px-4 bg-muted/30" id="packages">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Exam Category Packages</h2>
          <p className="text-muted-foreground mt-2">Prefer to prepare for specific exams only? Get a targeted package.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map(pkg => {
            const catColor = CAT_COLORS[pkg.category] ?? 'bg-slate-100 text-slate-700';
            const effectivePrice = pkg.discountedPrice ?? pkg.price;
            const discounted = !!pkg.discountedPrice;

            return (
              <Card key={pkg.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{pkg.name}</h3>
                      <Badge className={`text-xs mt-1 ${catColor}`}>{pkg.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-foreground">{fmt(effectivePrice)}</div>
                      {discounted && (
                        <div className="text-xs text-muted-foreground line-through">{fmt(pkg.price)}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {pkg.includedTests} Tests</span>
                    <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {pkg.includedPDFs} PDFs</span>
                    <Badge variant="outline" className="text-[10px]">{pkg.validityDays === 365 ? '1 Year' : `${pkg.validityDays} days`}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {pkg.includedExams.slice(0, 3).map(e => (
                      <span key={e} className="text-[10px] bg-muted border rounded px-2 py-0.5">{e}</span>
                    ))}
                    {pkg.includedExams.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{pkg.includedExams.length - 3} more</span>
                    )}
                  </div>

                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5" onClick={() => navigate(`/student/checkout?type=package&id=${pkg.id}`)}>
                    Get Package <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─── Addons Section ───────────────────────────────────────────────────────────

const AddonsSection: React.FC = () => {
  const { getActiveAddons } = usePricingStore();
  const navigate = useNavigate();
  const addons = getActiveAddons().filter(a => a.canBuyStandalone);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto" id="addons">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-foreground">Feature Add-ons</h2>
        <p className="text-muted-foreground mt-2">Supercharge your preparation with targeted feature packs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {addons.map(addon => {
          const Icon = ICON_MAP[addon.featureKey] ?? ICON_MAP[addon.icon] ?? Zap;
          const includedInPro = addon.includedInPlanIds.includes('pro') || addon.includedInPlanIds.includes('pro-max');

          return (
            <Card key={addon.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{addon.name}</h3>
                    <p className="text-xs text-muted-foreground">{addon.shortDescription}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-foreground">{fmt(addon.price)}</span>
                    <span className="text-xs text-muted-foreground">/{addon.isRecurring ? 'month' : 'one-time'}</span>
                  </div>
                  {includedInPro && (
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">Free in Pro</Badge>
                  )}
                </div>

                <Button variant="outline" className="w-full gap-1.5 hover:border-indigo-400 hover:text-indigo-700" onClick={() => navigate(`/student/checkout?type=addon&id=${addon.id}`)}>
                  Add to Plan <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

// ─── Ultimate Bundle ──────────────────────────────────────────────────────────

const BundleSection: React.FC<{ yearly: boolean }> = ({ yearly }) => {
  const { bundle } = usePricingStore();
  const navigate = useNavigate();
  if (!bundle.isActive) return null;

  const price = yearly ? bundle.yearlyPrice : bundle.monthlyPrice;

  return (
    <section className="py-16 px-4" id="bundle">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 text-white shadow-2xl">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 rounded-full px-3 py-1 text-amber-300 text-xs font-bold">
                  <Crown className="h-3.5 w-3.5" /> BEST VALUE — SAVE {bundle.discountPercent}%
                </div>
                <h2 className="text-3xl font-black">{bundle.name}</h2>
                <p className="text-indigo-300 text-sm">Everything. Every exam. Every feature. One plan.</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-4xl font-black">{fmt(price)}</div>
                <div className="text-indigo-400 text-sm">/{yearly ? 'year' : 'month'}</div>
              </div>
            </div>

            <Separator className="my-6 bg-white/10" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {[
                ...bundle.includedCategories.map(c => `${c} Category`),
                'Unlimited Mock Tests',
                'AI-Powered Analytics',
                'All Feature Add-ons',
                'Priority Support',
                'Lifetime Certificate',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-indigo-200">
                  <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold gap-2 text-base px-8"
              onClick={() => navigate(`/student/checkout?type=bundle&billing=${yearly ? 'yearly' : 'monthly'}`)}
            >
              <Crown className="h-5 w-5" /> Get Ultimate Bundle <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

// ─── Trust + FAQ ──────────────────────────────────────────────────────────────

const TrustFAQ: React.FC = () => (
  <section className="py-16 px-4 bg-muted/30">
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Trust */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Shield, title: 'Secure Payments', desc: '256-bit SSL encrypted' },
          { icon: Clock, title: 'Instant Access', desc: 'Start learning right away' },
          { icon: Users, title: '50,000+ Students', desc: 'Trusted community' },
          { icon: TrendingUp, title: '7-Day Refund', desc: 'Money-back guarantee' },
        ].map(t => (
          <Card key={t.title} className="border-0 shadow-sm text-center">
            <CardContent className="p-4">
              <t.icon className="h-7 w-7 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-foreground text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {[
            { q: 'Can I change my plan later?', a: 'Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately. Downgrades take effect at your next billing cycle.' },
            { q: 'Is there a free trial?', a: 'Yes, Smart, Pro, and Pro Max plans come with a 7-day free trial. No credit card required to start.' },
            { q: 'What payment methods are accepted?', a: 'We accept UPI (GPay, PhonePe, Paytm), all major Credit/Debit cards, Net Banking, and popular wallets.' },
            { q: 'Can I buy a package without a subscription?', a: 'Absolutely! Category packages and add-ons are fully standalone. You can purchase just the Banking Pack or SSC Pack without any subscription.' },
            { q: 'Do prices include GST?', a: 'Prices shown are exclusive of GST. GST at 18% will be added at checkout. You will see the full breakup before payment.' },
            { q: 'How do I cancel my subscription?', a: 'You can cancel anytime from your Subscription page → Cancel Subscription. You will retain access until the end of your billing period.' },
          ].map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4 bg-background shadow-sm">
              <AccordionTrigger className="text-sm font-medium text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

// ─── Main Export ──────────────────────────────────────────────────────────────

const StudentPricingPage: React.FC = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection yearly={yearly} setYearly={setYearly} />
      <PlansSection yearly={yearly} />
      <PackagesSection />
      <AddonsSection />
      <BundleSection yearly={yearly} />
      <TrustFAQ />
    </div>
  );
};

export default StudentPricingPage;
