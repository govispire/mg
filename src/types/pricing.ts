// src/types/pricing.ts — Canonical types for the entire payment system
// Owner controls all pricing. Super Admin cannot access any of these.

// ─── Subscription Plans ────────────────────────────────────────────────────────

export type PlanId = 'free' | 'smart' | 'pro' | 'pro-max';

export interface PlanFeature {
  id: string;
  label: string;
  value: string | boolean | number; // true = included, false = not, string = "Limited", number = count
  isHighlighted?: boolean;
}

export interface SubscriptionPlan {
  id: PlanId | string;
  name: string;             // "Pro"
  badge?: string;           // "MOST POPULAR"
  badgeColor?: string;      // "indigo" | "amber" | "emerald"
  monthlyPrice: number;     // 499 (₹) — 0 for Free
  yearlyPrice: number;      // 4990 (₹)
  trialDays: number;        // 0 or 7
  isActive: boolean;
  isDefault: boolean;       // true for Free plan
  sortOrder: number;        // 0 = first
  description: string;
  targetAudience: string;   // "Serious aspirants"
  maxExams: number | null;  // null = unlimited
  features: PlanFeature[];
  createdAt: string;
  updatedAt: string;
}

// ─── Category Access (which plans include which categories) ────────────────────

export interface CategoryAccess {
  id: string;
  categoryName: string;     // "Banking"
  standalonePrice: number;  // ₹199 — to buy without a plan
  isFreeAccess: boolean;    // true = free plan gets this too
  includedInPlanIds: string[]; // ["smart", "pro", "pro-max"]
  isActive: boolean;
}

// ─── Exam Category Packages ────────────────────────────────────────────────────

export interface ExamPackage {
  id: string;
  name: string;             // "Banking Pack"
  category: string;         // "Banking"
  price: number;            // 999
  discountedPrice?: number; // 799
  validityDays: number;     // 365
  includedExams: string[];  // ["SBI PO", "IBPS PO", ...]
  includedTests: number;    // 200
  includedPDFs: number;     // 50
  isActive: boolean;
  description: string;
  isFeatured: boolean;      // shown in Ultimate Bundle
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Feature Add-ons ──────────────────────────────────────────────────────────

export interface FeatureAccess {
  id: string;
  featureName: string;      // "Vocabulary"
  featureKey: string;       // "vocabulary" — used in access checks
  icon: string;             // lucide icon name
  standalonePrice: number;  // ₹49/month
  validityDays: number;     // 30
  isRecurring: boolean;     // monthly or one-time
  freeAccess: boolean;      // free plan gets it?
  includedInPlanIds: string[]; // ["smart", "pro", "pro-max"]
  canBuyStandalone: boolean;
  isActive: boolean;
  description: string;
  shortDescription: string; // shown on pricing cards
}

export interface FeatureAddon {
  id: string;
  name: string;             // "Mentorship"
  featureKey: string;       // "mentorship"
  icon: string;
  price: number;            // 299
  validityDays: number;
  isRecurring: boolean;
  includedInPlanIds: string[];
  canBuyStandalone: boolean;
  isActive: boolean;
  description: string;
  shortDescription: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export type CouponType = 'percent' | 'fixed';
export type CouponAppliesTo = 'plan' | 'package' | 'addon' | 'all';

export interface Coupon {
  id: string;
  code: string;               // "WELCOME50"
  type: CouponType;
  value: number;              // 50 (%) or 100 (₹)
  minCartValue: number;       // ₹0 = no minimum
  maxUses: number;            // 0 = unlimited
  usedCount: number;
  validFrom: string;          // ISO date
  validTo: string;            // ISO date
  applicableTo: CouponAppliesTo[];
  applicableIds: string[];    // [] = all items of that type
  isActive: boolean;
  description?: string;
  createdAt: string;
}

// ─── Student Access Model ─────────────────────────────────────────────────────

export interface StudentPurchasedItem {
  itemId: string;
  itemType: 'plan' | 'package' | 'addon' | 'bundle';
  itemName: string;
  price: number;
  purchasedAt: string;
  expiresAt: string | null;   // null = lifetime
  isActive: boolean;
  transactionId: string;
}

export interface StudentAccess {
  studentId: string;
  currentPlanId: string | null;        // active subscription plan id
  currentPlanExpiry: string | null;    // ISO date
  purchasedCategories: string[];       // ["Banking", "SSC"] — standalone purchases
  purchasedPackageIds: string[];       // exam package ids
  purchasedAddonIds: string[];         // addon feature ids
  hasBundleAccess: boolean;            // ultimate bundle
  bundleExpiry: string | null;
  purchaseHistory: StudentPurchasedItem[];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  type: 'plan' | 'package' | 'addon' | 'bundle' | 'category';
  name: string;
  price: number;
  originalPrice?: number;
  validityDays: number;
  isYearly?: boolean;         // for plans
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  couponId?: string;
  discountAmount: number;
  subtotal: number;
  gstRate: number;            // e.g. 18
  gstAmount: number;
  total: number;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionStatus = 'completed' | 'failed' | 'pending' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  items: CartItem[];
  couponCode?: string;
  couponId?: string;
  discountAmount: number;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  gatewayRef?: string;        // Razorpay order id etc.
  createdAt: string;
  updatedAt: string;
}

// ─── Payment Gateway Settings ─────────────────────────────────────────────────

export interface GatewayConfig {
  id: string;
  name: string;               // "Razorpay"
  isActive: boolean;
  isTestMode: boolean;
  keyId?: string;
  webhookSecret?: string;
  updatedAt: string;
}

export interface PaymentSettings {
  gstRate: number;            // 18
  autoInvoice: boolean;
  refundWindowDays: number;   // 7
  gateways: GatewayConfig[];
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  updatedAt: string;
}

// ─── Ultimate Bundle ───────────────────────────────────────────────────────────

export interface UltimateBundle {
  id: string;
  name: string;               // "All Government Exams Pass"
  monthlyPrice: number;
  yearlyPrice: number;
  discountPercent: number;    // vs buying everything separately
  includedCategories: string[];
  includedAddonIds: string[];
  isActive: boolean;
  updatedAt: string;
}

// ─── Revenue Analytics ────────────────────────────────────────────────────────

export interface RevenueKPI {
  todayRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  activeSubscribers: number;
  conversionRate: number;     // %
  mrr: number;                // Monthly Recurring Revenue
  arpu: number;               // Average Revenue Per User
  churnRate: number;          // %
  renewalRevenue: number;
  couponImpact: number;       // total discounts given this month
  topSellingCategoryId: string;
  topSellingPackageId: string;
  topSellingAddonId: string;
}
