// src/hooks/usePricingStore.ts
// Single source of truth for all pricing data.
// Owner pages write → Student pages read.
// Persisted to localStorage until real backend is wired.

import { useState, useEffect, useCallback } from 'react';
import type {
  SubscriptionPlan, ExamPackage, FeatureAddon, Coupon,
  CategoryAccess, FeatureAccess, PaymentSettings, UltimateBundle,
  Transaction, StudentAccess, Cart, CartItem, GatewayConfig,
} from '@/types/pricing';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_PLANS: SubscriptionPlan[] = [
  {
    id: 'free', name: 'Free', monthlyPrice: 0, yearlyPrice: 0, trialDays: 0,
    isActive: true, isDefault: true, sortOrder: 0,
    description: 'Get started with basic exam preparation',
    targetAudience: 'First-time aspirants',
    maxExams: 2,
    features: [
      { id: 'tests', label: 'Mock Tests', value: '5/month' },
      { id: 'ca', label: 'Current Affairs', value: 'Articles only' },
      { id: 'vocab', label: 'Vocabulary', value: false },
      { id: 'mentorship', label: 'Mentorship', value: false },
      { id: 'analytics', label: 'Analytics', value: 'Basic' },
      { id: 'exams', label: 'Tracked Exams', value: 2 },
      { id: 'pdfs', label: 'PDF Courses', value: false },
      { id: 'strict', label: 'Strict Mode', value: false },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'smart', name: 'Smart', monthlyPrice: 299, yearlyPrice: 2990, trialDays: 7,
    isActive: true, isDefault: false, sortOrder: 1,
    badge: 'STARTER', badgeColor: 'emerald',
    description: 'Perfect for focused single-category preparation',
    targetAudience: 'Students targeting 1–2 exams',
    maxExams: 5,
    features: [
      { id: 'tests', label: 'Mock Tests', value: '50/month' },
      { id: 'ca', label: 'Current Affairs', value: 'Articles + Quizzes' },
      { id: 'vocab', label: 'Vocabulary', value: true },
      { id: 'mentorship', label: 'Mentorship', value: false },
      { id: 'analytics', label: 'Analytics', value: 'Advanced' },
      { id: 'exams', label: 'Tracked Exams', value: 5 },
      { id: 'pdfs', label: 'PDF Courses', value: true },
      { id: 'strict', label: 'Strict Mode', value: false },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pro', name: 'Pro', monthlyPrice: 499, yearlyPrice: 4990, trialDays: 7,
    isActive: true, isDefault: false, sortOrder: 2,
    badge: 'MOST POPULAR', badgeColor: 'indigo',
    description: 'Complete preparation for serious aspirants',
    targetAudience: 'Students targeting multiple exams',
    maxExams: null,
    features: [
      { id: 'tests', label: 'Mock Tests', value: 'Unlimited', isHighlighted: true },
      { id: 'ca', label: 'Current Affairs', value: 'Full Access' },
      { id: 'vocab', label: 'Vocabulary', value: true },
      { id: 'mentorship', label: 'Mentorship', value: '2 sessions/month' },
      { id: 'analytics', label: 'Analytics', value: 'AI-Powered', isHighlighted: true },
      { id: 'exams', label: 'Tracked Exams', value: 'Unlimited', isHighlighted: true },
      { id: 'pdfs', label: 'PDF Courses', value: true },
      { id: 'strict', label: 'Strict Mode', value: true },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pro-max', name: 'Pro Max', monthlyPrice: 999, yearlyPrice: 9990, trialDays: 7,
    isActive: true, isDefault: false, sortOrder: 3,
    badge: 'ALL INCLUSIVE', badgeColor: 'amber',
    description: 'Everything + unlimited mentorship & AI coaching',
    targetAudience: 'Students who want the complete edge',
    maxExams: null,
    features: [
      { id: 'tests', label: 'Mock Tests', value: 'Unlimited', isHighlighted: true },
      { id: 'ca', label: 'Current Affairs', value: 'Full + Premium', isHighlighted: true },
      { id: 'vocab', label: 'Vocabulary', value: true },
      { id: 'mentorship', label: 'Mentorship', value: 'Unlimited', isHighlighted: true },
      { id: 'analytics', label: 'Analytics', value: 'AI-Powered + Rank Estimate' },
      { id: 'exams', label: 'Tracked Exams', value: 'Unlimited' },
      { id: 'pdfs', label: 'PDF Courses', value: true },
      { id: 'strict', label: 'Strict Mode', value: true },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const SEED_PACKAGES: ExamPackage[] = [
  {
    id: 'pkg-banking', name: 'Banking Pack', category: 'Banking',
    price: 999, discountedPrice: 799, validityDays: 365,
    includedExams: ['SBI PO', 'SBI Clerk', 'IBPS PO', 'IBPS Clerk', 'RBI Assistant', 'IBPS RRB Officer'],
    includedTests: 200, includedPDFs: 60, isActive: true, isFeatured: true, sortOrder: 0,
    description: 'Complete Banking exam preparation — all major exams covered',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pkg-ssc', name: 'SSC Pack', category: 'SSC',
    price: 799, discountedPrice: 649, validityDays: 365,
    includedExams: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC CPO', 'SSC GD'],
    includedTests: 160, includedPDFs: 45, isActive: true, isFeatured: true, sortOrder: 1,
    description: 'All SSC exams in one package — Tier I to Tier III',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pkg-railway', name: 'Railway Pack', category: 'Railway',
    price: 699, discountedPrice: 549, validityDays: 365,
    includedExams: ['RRB NTPC', 'RRB Group D', 'RRB JE', 'RPF SI'],
    includedTests: 140, includedPDFs: 40, isActive: true, isFeatured: true, sortOrder: 2,
    description: 'Railway recruitment exams — NTPC, Group D and more',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pkg-tnpsc', name: 'TNPSC Pack', category: 'TNPSC',
    price: 599, validityDays: 365,
    includedExams: ['TNPSC Group 1', 'TNPSC Group 2', 'TNPSC Group 4', 'TNPSC VAO'],
    includedTests: 120, includedPDFs: 35, isActive: true, isFeatured: false, sortOrder: 3,
    description: 'Tamil Nadu state government exam preparation',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pkg-upsc', name: 'UPSC Pack', category: 'UPSC',
    price: 1499, validityDays: 365,
    includedExams: ['UPSC CSE Prelims', 'UPSC CSE Mains', 'UPSC CAPF'],
    includedTests: 180, includedPDFs: 80, isActive: true, isFeatured: true, sortOrder: 4,
    description: 'India\'s toughest exam — comprehensive civil services package',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const SEED_ADDONS: FeatureAddon[] = [
  {
    id: 'addon-mentorship', name: 'Mentorship', featureKey: 'mentorship', icon: 'Brain',
    price: 299, validityDays: 30, isRecurring: true,
    includedInPlanIds: ['pro', 'pro-max'], canBuyStandalone: true, isActive: true,
    description: 'Personal 1-on-1 mentor sessions — get tailored study guidance, doubt clearing, and motivation.',
    shortDescription: '2–4 mentor sessions/month based on plan',
    sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'addon-vocabulary', name: 'Vocabulary Pro', featureKey: 'vocabulary', icon: 'BookA',
    price: 49, validityDays: 30, isRecurring: true,
    includedInPlanIds: ['smart', 'pro', 'pro-max'], canBuyStandalone: true, isActive: true,
    description: 'Daily word builder, contextual learning, retention quizzes — 3,000+ words curated for govt exams.',
    shortDescription: '3,000+ exam-curated words + daily quizzes',
    sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'addon-ca', name: 'Current Affairs Premium', featureKey: 'current-affairs-premium', icon: 'Newspaper',
    price: 79, validityDays: 30, isRecurring: true,
    includedInPlanIds: ['pro', 'pro-max'], canBuyStandalone: true, isActive: true,
    description: 'Daily & weekly CA quizzes, monthly magazines, topic-wise analysis and exam-focused summaries.',
    shortDescription: 'Daily quizzes + monthly magazine + analysis',
    sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'addon-pdf', name: 'PDF Bundle', featureKey: 'pdf-bundle', icon: 'FileText',
    price: 149, validityDays: 365, isRecurring: false,
    includedInPlanIds: ['smart', 'pro', 'pro-max'], canBuyStandalone: true, isActive: true,
    description: 'Structured PDF courses for all major subjects — Math, Reasoning, GK, English. Lifetime access.',
    shortDescription: '500+ PDFs across all subjects — lifetime access',
    sortOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'addon-strict', name: 'Strict Mode', featureKey: 'strict-mode', icon: 'ShieldCheck',
    price: 29, validityDays: 30, isRecurring: true,
    includedInPlanIds: ['pro', 'pro-max'], canBuyStandalone: true, isActive: true,
    description: 'Lock yourself into exam simulation — no exits, no cheating, real exam pressure. Builds discipline.',
    shortDescription: 'Real exam simulation with full lockdown',
    sortOrder: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const SEED_CATEGORY_ACCESS: CategoryAccess[] = [
  { id: 'ca-banking', categoryName: 'Banking', standalonePrice: 199, isFreeAccess: false, includedInPlanIds: ['smart', 'pro', 'pro-max'], isActive: true },
  { id: 'ca-ssc', categoryName: 'SSC', standalonePrice: 199, isFreeAccess: false, includedInPlanIds: ['smart', 'pro', 'pro-max'], isActive: true },
  { id: 'ca-railway', categoryName: 'Railway', standalonePrice: 149, isFreeAccess: false, includedInPlanIds: ['pro', 'pro-max'], isActive: true },
  { id: 'ca-upsc', categoryName: 'UPSC', standalonePrice: 299, isFreeAccess: false, includedInPlanIds: ['pro', 'pro-max'], isActive: true },
  { id: 'ca-tnpsc', categoryName: 'TNPSC', standalonePrice: 149, isFreeAccess: false, includedInPlanIds: ['smart', 'pro', 'pro-max'], isActive: true },
  { id: 'ca-defence', categoryName: 'Defence', standalonePrice: 149, isFreeAccess: false, includedInPlanIds: ['pro', 'pro-max'], isActive: true },
  { id: 'ca-state-psc', categoryName: 'State PSC', standalonePrice: 149, isFreeAccess: false, includedInPlanIds: ['pro', 'pro-max'], isActive: true },
  { id: 'ca-insurance', categoryName: 'Insurance', standalonePrice: 149, isFreeAccess: false, includedInPlanIds: ['smart', 'pro', 'pro-max'], isActive: true },
];

const SEED_FEATURE_ACCESS: FeatureAccess[] = [
  { id: 'fa-tests', featureName: 'Mock Tests', featureKey: 'tests', icon: 'ClipboardList', standalonePrice: 0, validityDays: 30, isRecurring: true, freeAccess: true, includedInPlanIds: ['free', 'smart', 'pro', 'pro-max'], canBuyStandalone: false, isActive: true, description: 'Full-length and sectional mock tests', shortDescription: 'Full & sectional tests' },
  { id: 'fa-vocab', featureName: 'Vocabulary', featureKey: 'vocabulary', icon: 'BookA', standalonePrice: 49, validityDays: 30, isRecurring: true, freeAccess: false, includedInPlanIds: ['smart', 'pro', 'pro-max'], canBuyStandalone: true, isActive: true, description: 'Vocabulary builder with daily quizzes', shortDescription: '3,000+ words & daily quizzes' },
  { id: 'fa-ca', featureName: 'Current Affairs', featureKey: 'current-affairs', icon: 'Newspaper', standalonePrice: 79, validityDays: 30, isRecurring: true, freeAccess: true, includedInPlanIds: ['free', 'smart', 'pro', 'pro-max'], canBuyStandalone: true, isActive: true, description: 'Daily news, quizzes, and monthly magazine', shortDescription: 'News + quizzes + magazine' },
  { id: 'fa-mentorship', featureName: 'Mentorship', featureKey: 'mentorship', icon: 'Brain', standalonePrice: 299, validityDays: 30, isRecurring: true, freeAccess: false, includedInPlanIds: ['pro', 'pro-max'], canBuyStandalone: true, isActive: true, description: 'Personal mentor sessions', shortDescription: '1-on-1 mentor sessions' },
  { id: 'fa-analytics', featureName: 'AI Analytics', featureKey: 'analytics', icon: 'BarChart3', standalonePrice: 99, validityDays: 30, isRecurring: true, freeAccess: false, includedInPlanIds: ['pro', 'pro-max'], canBuyStandalone: true, isActive: true, description: 'AI-powered performance analysis and rank estimate', shortDescription: 'AI analysis + rank estimate' },
  { id: 'fa-strict', featureName: 'Strict Mode', featureKey: 'strict-mode', icon: 'ShieldCheck', standalonePrice: 29, validityDays: 30, isRecurring: true, freeAccess: false, includedInPlanIds: ['pro', 'pro-max'], canBuyStandalone: true, isActive: true, description: 'Exam simulation lockdown mode', shortDescription: 'Real exam environment' },
  { id: 'fa-pdfs', featureName: 'PDF Courses', featureKey: 'pdf-bundle', icon: 'FileText', standalonePrice: 149, validityDays: 365, isRecurring: false, freeAccess: false, includedInPlanIds: ['smart', 'pro', 'pro-max'], canBuyStandalone: true, isActive: true, description: '500+ PDF study materials', shortDescription: '500+ PDFs — lifetime' },
  { id: 'fa-live', featureName: 'Live Classes', featureKey: 'live-classes', icon: 'Video', standalonePrice: 199, validityDays: 30, isRecurring: true, freeAccess: false, includedInPlanIds: ['pro-max'], canBuyStandalone: true, isActive: true, description: 'Live interactive classes with expert faculty', shortDescription: 'Live + recorded classes' },
];

const SEED_COUPONS: Coupon[] = [
  {
    id: 'coup-1', code: 'WELCOME50', type: 'percent', value: 50,
    minCartValue: 199, maxUses: 500, usedCount: 127,
    validFrom: '2025-01-01', validTo: '2025-12-31',
    applicableTo: ['plan'], applicableIds: [], isActive: true,
    description: 'Welcome discount for new users — 50% off any plan',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-2', code: 'BANK100', type: 'fixed', value: 100,
    minCartValue: 499, maxUses: 200, usedCount: 43,
    validFrom: '2025-01-01', validTo: '2025-12-31',
    applicableTo: ['package'], applicableIds: ['pkg-banking'], isActive: true,
    description: '₹100 off Banking Pack',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-3', code: 'SSC20', type: 'percent', value: 20,
    minCartValue: 0, maxUses: 0, usedCount: 89,
    validFrom: '2025-01-01', validTo: '2025-06-30',
    applicableTo: ['package'], applicableIds: ['pkg-ssc'], isActive: true,
    description: '20% off SSC Pack',
    createdAt: new Date().toISOString(),
  },
];

const SEED_BUNDLE: UltimateBundle = {
  id: 'bundle-ultimate',
  name: 'All Government Exams Pass',
  monthlyPrice: 1499,
  yearlyPrice: 14990,
  discountPercent: 40,
  includedCategories: ['Banking', 'SSC', 'Railway', 'UPSC', 'TNPSC', 'Defence', 'State PSC', 'Insurance', 'Teaching'],
  includedAddonIds: ['addon-mentorship', 'addon-vocabulary', 'addon-ca', 'addon-pdf', 'addon-strict'],
  isActive: true,
  updatedAt: new Date().toISOString(),
};

const SEED_PAYMENT_SETTINGS: PaymentSettings = {
  gstRate: 18,
  autoInvoice: true,
  refundWindowDays: 7,
  gateways: [
    { id: 'gw-razorpay', name: 'Razorpay', isActive: true, isTestMode: true, updatedAt: new Date().toISOString() },
    { id: 'gw-phonepe', name: 'PhonePe', isActive: false, isTestMode: true, updatedAt: new Date().toISOString() },
    { id: 'gw-cashfree', name: 'Cashfree', isActive: false, isTestMode: true, updatedAt: new Date().toISOString() },
  ],
  updatedAt: new Date().toISOString(),
};

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'txn-1', studentId: 's1', studentName: 'Arjun Kumar', studentEmail: 'arjun@example.com', items: [{ id: 'pro', type: 'plan', name: 'Pro Plan', price: 499, validityDays: 30, isYearly: false }], discountAmount: 0, subtotal: 499, gstRate: 18, gstAmount: 89.82, total: 588.82, status: 'completed', paymentMethod: 'upi', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'txn-2', studentId: 's2', studentName: 'Priya Rajan', studentEmail: 'priya@example.com', items: [{ id: 'pkg-banking', type: 'package', name: 'Banking Pack', price: 799, validityDays: 365 }], couponCode: 'BANK100', couponId: 'coup-2', discountAmount: 100, subtotal: 699, gstRate: 18, gstAmount: 125.82, total: 824.82, status: 'completed', paymentMethod: 'card', createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'txn-3', studentId: 's3', studentName: 'Mohan Das', studentEmail: 'mohan@example.com', items: [{ id: 'pro-max', type: 'plan', name: 'Pro Max Plan', price: 9990, validityDays: 365, isYearly: true }], discountAmount: 0, subtotal: 9990, gstRate: 18, gstAmount: 1798.2, total: 11788.2, status: 'completed', paymentMethod: 'netbanking', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'txn-4', studentId: 's4', studentName: 'Kavitha S', studentEmail: 'kavitha@example.com', items: [{ id: 'addon-mentorship', type: 'addon', name: 'Mentorship', price: 299, validityDays: 30 }], discountAmount: 0, subtotal: 299, gstRate: 18, gstAmount: 53.82, total: 352.82, status: 'failed', paymentMethod: 'upi', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  plans: 'exament_pricing_plans_v1',
  packages: 'exament_pricing_packages_v1',
  addons: 'exament_pricing_addons_v1',
  categoryAccess: 'exament_category_access_v1',
  featureAccess: 'exament_feature_access_v1',
  coupons: 'exament_coupons_v1',
  bundle: 'exament_bundle_v1',
  paymentSettings: 'exament_payment_settings_v1',
  transactions: 'exament_transactions_v1',
  studentAccess: 'exament_student_access_v1',
};

function loadOrSeed<T>(key: string, seed: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

function save<T>(key: string, data: T): void {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePricingStore() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => loadOrSeed(KEYS.plans, SEED_PLANS));
  const [packages, setPackages] = useState<ExamPackage[]>(() => loadOrSeed(KEYS.packages, SEED_PACKAGES));
  const [addons, setAddons] = useState<FeatureAddon[]>(() => loadOrSeed(KEYS.addons, SEED_ADDONS));
  const [categoryAccess, setCategoryAccess] = useState<CategoryAccess[]>(() => loadOrSeed(KEYS.categoryAccess, SEED_CATEGORY_ACCESS));
  const [featureAccess, setFeatureAccess] = useState<FeatureAccess[]>(() => loadOrSeed(KEYS.featureAccess, SEED_FEATURE_ACCESS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadOrSeed(KEYS.coupons, SEED_COUPONS));
  const [bundle, setBundle] = useState<UltimateBundle>(() => loadOrSeed(KEYS.bundle, SEED_BUNDLE));
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => loadOrSeed(KEYS.paymentSettings, SEED_PAYMENT_SETTINGS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadOrSeed(KEYS.transactions, SEED_TRANSACTIONS));

  // ── Plans ──────────────────────────────────────────────────────────────────

  const addPlan = useCallback((plan: SubscriptionPlan) => {
    setPlans(prev => { const next = [...prev, plan]; save(KEYS.plans, next); return next; });
  }, []);

  const updatePlan = useCallback((id: string, updates: Partial<SubscriptionPlan>) => {
    setPlans(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
      save(KEYS.plans, next); return next;
    });
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans(prev => { const next = prev.filter(p => p.id !== id); save(KEYS.plans, next); return next; });
  }, []);

  // ── Packages ──────────────────────────────────────────────────────────────

  const addPackage = useCallback((pkg: ExamPackage) => {
    setPackages(prev => { const next = [...prev, pkg]; save(KEYS.packages, next); return next; });
  }, []);

  const updatePackage = useCallback((id: string, updates: Partial<ExamPackage>) => {
    setPackages(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
      save(KEYS.packages, next); return next;
    });
  }, []);

  const deletePackage = useCallback((id: string) => {
    setPackages(prev => { const next = prev.filter(p => p.id !== id); save(KEYS.packages, next); return next; });
  }, []);

  // ── Add-ons ───────────────────────────────────────────────────────────────

  const addAddon = useCallback((addon: FeatureAddon) => {
    setAddons(prev => { const next = [...prev, addon]; save(KEYS.addons, next); return next; });
  }, []);

  const updateAddon = useCallback((id: string, updates: Partial<FeatureAddon>) => {
    setAddons(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
      save(KEYS.addons, next); return next;
    });
  }, []);

  const deleteAddon = useCallback((id: string) => {
    setAddons(prev => { const next = prev.filter(a => a.id !== id); save(KEYS.addons, next); return next; });
  }, []);

  // ── Category Access ───────────────────────────────────────────────────────

  const updateCategoryAccess = useCallback((id: string, updates: Partial<CategoryAccess>) => {
    setCategoryAccess(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      save(KEYS.categoryAccess, next); return next;
    });
  }, []);

  // ── Feature Access ────────────────────────────────────────────────────────

  const updateFeatureAccess = useCallback((id: string, updates: Partial<FeatureAccess>) => {
    setFeatureAccess(prev => {
      const next = prev.map(f => f.id === id ? { ...f, ...updates } : f);
      save(KEYS.featureAccess, next); return next;
    });
  }, []);

  // ── Coupons ───────────────────────────────────────────────────────────────

  const addCoupon = useCallback((coupon: Coupon) => {
    setCoupons(prev => { const next = [...prev, coupon]; save(KEYS.coupons, next); return next; });
  }, []);

  const updateCoupon = useCallback((id: string, updates: Partial<Coupon>) => {
    setCoupons(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      save(KEYS.coupons, next); return next;
    });
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    setCoupons(prev => { const next = prev.filter(c => c.id !== id); save(KEYS.coupons, next); return next; });
  }, []);

  // ── Bundle ────────────────────────────────────────────────────────────────

  const updateBundle = useCallback((updates: Partial<UltimateBundle>) => {
    setBundle(prev => { const next = { ...prev, ...updates, updatedAt: new Date().toISOString() }; save(KEYS.bundle, next); return next; });
  }, []);

  // ── Payment Settings ──────────────────────────────────────────────────────

  const updatePaymentSettings = useCallback((updates: Partial<PaymentSettings>) => {
    setPaymentSettings(prev => { const next = { ...prev, ...updates, updatedAt: new Date().toISOString() }; save(KEYS.paymentSettings, next); return next; });
  }, []);

  const updateGateway = useCallback((id: string, updates: Partial<GatewayConfig>) => {
    setPaymentSettings(prev => {
      const next = { ...prev, gateways: prev.gateways.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g) };
      save(KEYS.paymentSettings, next); return next;
    });
  }, []);

  // ── Coupon Validation ─────────────────────────────────────────────────────

  const validateCoupon = useCallback((code: string, cartItems: CartItem[], cartTotal: number): { valid: boolean; discount: number; coupon?: Coupon; error?: string } => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) return { valid: false, discount: 0, error: 'Invalid coupon code' };

    const now = new Date();
    if (new Date(coupon.validFrom) > now || new Date(coupon.validTo) < now)
      return { valid: false, discount: 0, error: 'Coupon has expired' };
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
      return { valid: false, discount: 0, error: 'Coupon usage limit reached' };
    if (cartTotal < coupon.minCartValue)
      return { valid: false, discount: 0, error: `Minimum cart value ₹${coupon.minCartValue} required` };

    // Check applicable items
    if (!coupon.applicableTo.includes('all')) {
      const applicable = cartItems.some(item => coupon.applicableTo.includes(item.type as any));
      if (!applicable) return { valid: false, discount: 0, error: 'Coupon not applicable for selected items' };
    }

    const discount = coupon.type === 'percent'
      ? Math.round(cartTotal * coupon.value / 100)
      : Math.min(coupon.value, cartTotal);

    return { valid: true, discount, coupon };
  }, [coupons]);

  // ── Create Transaction ────────────────────────────────────────────────────

  const createTransaction = useCallback((txn: Transaction) => {
    setTransactions(prev => {
      const next = [txn, ...prev];
      save(KEYS.transactions, next);
      return next;
    });
    // Increment coupon usage
    if (txn.couponId) {
      setCoupons(prev => {
        const next = prev.map(c => c.id === txn.couponId ? { ...c, usedCount: c.usedCount + 1 } : c);
        save(KEYS.coupons, next); return next;
      });
    }
  }, []);

  // ── Revenue KPIs ──────────────────────────────────────────────────────────

  const getRevenueKPIs = useCallback(() => {
    const completed = transactions.filter(t => t.status === 'completed');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayRevenue = completed.filter(t => new Date(t.createdAt) >= today).reduce((s, t) => s + t.total, 0);
    const monthlyRevenue = completed.filter(t => new Date(t.createdAt) >= monthStart).reduce((s, t) => s + t.total, 0);
    const yearlyRevenue = completed.reduce((s, t) => s + t.total, 0);
    const couponImpact = completed.reduce((s, t) => s + t.discountAmount, 0);

    // Tally item sales
    const categorySales: Record<string, number> = {};
    const packageSales: Record<string, number> = {};
    const addonSales: Record<string, number> = {};
    completed.forEach(t => t.items.forEach(item => {
      if (item.type === 'package') packageSales[item.id] = (packageSales[item.id] || 0) + 1;
      else if (item.type === 'addon') addonSales[item.id] = (addonSales[item.id] || 0) + 1;
    }));

    const topPackage = Object.entries(packageSales).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    const topAddon = Object.entries(addonSales).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

    const activeSubscribers = completed.filter(t => t.items.some(i => i.type === 'plan')).length;
    const totalVisitors = 12400; // mock
    const conversionRate = Math.round((activeSubscribers / totalVisitors) * 100 * 10) / 10;

    return {
      todayRevenue, monthlyRevenue, yearlyRevenue, activeSubscribers, conversionRate,
      mrr: monthlyRevenue, arpu: activeSubscribers ? Math.round(monthlyRevenue / activeSubscribers) : 0,
      churnRate: 4.2, renewalRevenue: Math.round(monthlyRevenue * 0.68), couponImpact,
      topSellingCategoryId: 'Banking', topSellingPackageId: topPackage, topSellingAddonId: topAddon,
    };
  }, [transactions]);

  return {
    // Data
    plans: plans.filter(p => p).sort((a, b) => a.sortOrder - b.sortOrder),
    packages, addons, categoryAccess, featureAccess, coupons, bundle, paymentSettings, transactions,

    // Plan CRUD
    addPlan, updatePlan, deletePlan,

    // Package CRUD
    addPackage, updatePackage, deletePackage,

    // Addon CRUD
    addAddon, updateAddon, deleteAddon,

    // Access control
    updateCategoryAccess, updateFeatureAccess,

    // Coupon CRUD
    addCoupon, updateCoupon, deleteCoupon,

    // Bundle + Settings
    updateBundle, updatePaymentSettings, updateGateway,

    // Student actions
    validateCoupon, createTransaction,

    // Analytics
    getRevenueKPIs,

    // Helpers
    getActivePlans: () => plans.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    getActivePackages: () => packages.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    getActiveAddons: () => addons.filter(a => a.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    getActiveCoupons: () => coupons.filter(c => c.isActive),
    getPlanById: (id: string) => plans.find(p => p.id === id),
    getPackageById: (id: string) => packages.find(p => p.id === id),
  };
}
