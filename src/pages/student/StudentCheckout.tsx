import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePricingStore } from '@/hooks/usePricingStore';
import type { CartItem, Transaction, PaymentMethod } from '@/types/pricing';
import {
  Shield, Lock, ArrowLeft, Check, X, Tag, CreditCard,
  Smartphone, Building, Wallet, RefreshCw, AlertCircle,
  IndianRupee, ChevronRight, Star,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type PayMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Bank of Baroda', 'Punjab National Bank'];

// ─── Build cart item from URL params ─────────────────────────────────────────

function buildCartItem(
  type: string,
  id: string,
  billing: string,
  store: ReturnType<typeof usePricingStore>,
): CartItem | null {
  const { getPlanById, getPackageById, getActiveAddons, bundle } = store;

  if (type === 'plan') {
    const plan = getPlanById(id);
    if (!plan) return null;
    const yearly = billing === 'yearly';
    const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
    return { id: plan.id, type: 'plan', name: `${plan.name} Plan`, price, originalPrice: plan.monthlyPrice, validityDays: yearly ? 365 : 30, isYearly: yearly };
  }
  if (type === 'package') {
    const pkg = getPackageById(id);
    if (!pkg) return null;
    const price = pkg.discountedPrice ?? pkg.price;
    return { id: pkg.id, type: 'package', name: pkg.name, price, originalPrice: pkg.price, validityDays: pkg.validityDays };
  }
  if (type === 'addon') {
    const addon = getActiveAddons().find(a => a.id === id);
    if (!addon) return null;
    return { id: addon.id, type: 'addon', name: addon.name, price: addon.price, validityDays: addon.validityDays };
  }
  if (type === 'bundle') {
    const yearly = billing === 'yearly';
    const price = yearly ? bundle.yearlyPrice : bundle.monthlyPrice;
    return { id: bundle.id, type: 'bundle', name: bundle.name, price, validityDays: yearly ? 365 : 30, isYearly: yearly };
  }
  return null;
}

// ─── Cart Summary ─────────────────────────────────────────────────────────────

const CartSummary: React.FC<{ item: CartItem; store: ReturnType<typeof usePricingStore>; onBack: () => void }> = ({ item, store, onBack }) => {
  const navigate = useNavigate();
  const suggestions = store.getActiveAddons().filter(a => a.canBuyStandalone && a.id !== item.id && !a.includedInPlanIds.includes(item.id)).slice(0, 2);

  const bullets: string[] = [];
  if (item.type === 'plan') {
    const plan = store.getPlanById(item.id);
    bullets.push(...(plan?.features.filter(f => f.value !== false).map(f => f.label) ?? []).slice(0, 5));
  } else if (item.type === 'package') {
    const pkg = store.getPackageById(item.id);
    if (pkg) { bullets.push(`${pkg.includedTests} mock tests`, `${pkg.includedPDFs} PDF courses`, ...pkg.includedExams.slice(0, 3)); }
  } else if (item.type === 'bundle') {
    bullets.push('All exam categories', 'Unlimited mock tests', 'All feature add-ons', 'AI-powered analytics', 'Priority support');
  } else if (item.type === 'addon') {
    const addon = store.getActiveAddons().find(a => a.id === item.id);
    if (addon) bullets.push(addon.description);
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Pricing
      </button>

      <Card className="border-2 border-indigo-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{item.name}</CardTitle>
            <Badge className={item.type === 'bundle' ? 'bg-amber-100 text-amber-700' : item.type === 'plan' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}>
              {item.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground">{fmt(item.price)}</span>
            {item.originalPrice && item.originalPrice !== item.price && (
              <span className="text-sm text-muted-foreground line-through">{fmt(item.originalPrice)}</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Valid for: {item.validityDays === 365 ? '1 Year' : item.validityDays === 30 ? '1 Month' : `${item.validityDays} Days`}
          </div>

          {bullets.length > 0 && (
            <ul className="space-y-1.5 mt-3">
              {bullets.map(b => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {b}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">You might also want</p>
          <div className="space-y-2">
            {suggestions.map(s => (
              <button key={s.id} onClick={() => navigate(`/student/checkout?type=addon&id=${s.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.shortDescription}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold">{fmt(s.price)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Payment Panel ────────────────────────────────────────────────────────────

const PaymentPanel: React.FC<{
  item: CartItem;
  store: ReturnType<typeof usePricingStore>;
  onSuccess: (txnId: string) => void;
}> = ({ item, store, onSuccess }) => {
  const { toast } = useToast();
  const { validateCoupon, createTransaction, paymentSettings } = store;

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; id: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [bank, setBank] = useState('');
  const [processing, setProcessing] = useState(false);

  const gstRate = paymentSettings.gstRate;
  const subtotal = item.price;
  const discount = appliedCoupon?.discount ?? 0;
  const taxable = subtotal - discount;
  const gst = Math.round(taxable * gstRate / 100 * 100) / 100;
  const total = taxable + gst;

  const handleApplyCoupon = () => {
    setCouponError('');
    const result = validateCoupon(couponCode, [item], subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: result.discount, id: result.coupon.id });
      toast({ title: 'Coupon Applied!', description: `Saved ${fmt(result.discount)}` });
    } else {
      setCouponError(result.error ?? 'Invalid coupon');
    }
  };

  const handlePay = async () => {
    // Basic validation
    if (payMethod === 'upi' && !upiId.includes('@')) {
      toast({ title: 'Invalid UPI ID', description: 'Enter a valid UPI ID (e.g. name@upi)', variant: 'destructive' }); return;
    }
    if (payMethod === 'card' && (cardNum.replace(/\s/g, '').length < 16 || !cardExpiry || cardCvv.length < 3)) {
      toast({ title: 'Invalid Card Details', description: 'Fill all card fields correctly', variant: 'destructive' }); return;
    }
    if (payMethod === 'netbanking' && !bank) {
      toast({ title: 'Select a Bank', variant: 'destructive' }); return;
    }

    setProcessing(true);
    await new Promise(r => setTimeout(r, 2200));

    // 90% success simulation
    const success = Math.random() < 0.9;
    if (!success) {
      setProcessing(false);
      toast({ title: 'Payment Failed', description: 'Your payment could not be processed. Please try again.', variant: 'destructive' });
      return;
    }

    const txn: Transaction = {
      id: `txn-${Date.now()}`,
      studentId: 'current-user',
      studentName: 'You',
      studentEmail: 'student@example.com',
      items: [item],
      couponCode: appliedCoupon?.code,
      couponId: appliedCoupon?.id,
      discountAmount: discount,
      subtotal, gstRate, gstAmount: gst, total,
      status: 'completed',
      paymentMethod: payMethod as PaymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createTransaction(txn);
    setProcessing(false);
    onSuccess(txn.id);
  };

  return (
    <div className="space-y-5">
      {/* Price Breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-indigo-600" /> Price Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(subtotal)}</span></div>
          {appliedCoupon && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> {appliedCoupon.code}</span>
              <span>-{fmt(appliedCoupon.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground"><span>GST ({gstRate}%)</span><span>+{fmt(gst)}</span></div>
          <Separator />
          <div className="flex justify-between text-base font-black">
            <span>Total</span><span className="text-indigo-700">{fmt(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Coupon */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-2">
          <Label className="flex items-center gap-1.5 text-sm"><Tag className="h-4 w-4" /> Apply Coupon</Label>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <Check className="h-4 w-4" />
                <span className="font-mono font-bold text-sm">{appliedCoupon.code}</span>
                <span className="text-xs">— saved {fmt(appliedCoupon.discount)}</span>
              </div>
              <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-emerald-600 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                placeholder="COUPON CODE"
                className="font-mono uppercase"
                onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
              />
              <Button variant="outline" onClick={handleApplyCoupon} disabled={!couponCode}>Apply</Button>
            </div>
          )}
          {couponError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{couponError}</p>}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {([['upi', Smartphone, 'UPI'], ['card', CreditCard, 'Card'], ['netbanking', Building, 'Net Banking'], ['wallet', Wallet, 'Wallet']] as const).map(([m, Icon, label]) => (
              <button key={m} onClick={() => setPayMethod(m as PayMethod)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all ${payMethod === m ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-border text-muted-foreground hover:border-indigo-300'}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {/* UPI */}
          {payMethod === 'upi' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                  <span key={app} className="text-xs px-3 py-1 rounded-full bg-muted border">{app}</span>
                ))}
              </div>
              <Input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="Enter UPI ID (e.g. name@upi)" />
            </div>
          )}

          {/* Card */}
          {payMethod === 'card' && (
            <div className="space-y-3">
              <Input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))} placeholder="Card Number" maxLength={19} className="font-mono" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={cardExpiry} onChange={e => {
                  const v = e.target.value.replace(/\D/g, '');
                  setCardExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2, 4)}` : v);
                }} placeholder="MM/YY" maxLength={5} className="font-mono" />
                <Input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="CVV" maxLength={4} type="password" className="font-mono" />
              </div>
              <Input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} placeholder="Name on Card" className="uppercase" />
            </div>
          )}

          {/* Net Banking */}
          {payMethod === 'netbanking' && (
            <div className="space-y-2">
              {BANKS.map(b => (
                <label key={b} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${bank === b ? 'border-indigo-500 bg-indigo-50' : 'hover:border-indigo-200'}`}>
                  <input type="radio" name="bank" value={b} checked={bank === b} onChange={() => setBank(b)} className="accent-indigo-600" />
                  <span className="text-sm">{b}</span>
                </label>
              ))}
            </div>
          )}

          {/* Wallet */}
          {payMethod === 'wallet' && (
            <div className="grid grid-cols-2 gap-2">
              {['Paytm', 'Amazon Pay', 'Mobikwik', 'Freecharge'].map(w => (
                <button key={w} onClick={() => setBank(w)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${bank === w ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'hover:border-indigo-200'}`}>
                  {w}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay Button */}
      <Button
        size="lg"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 text-base"
        onClick={handlePay}
        disabled={processing}
      >
        {processing ? (
          <><RefreshCw className="h-5 w-5 animate-spin" /> Processing Payment...</>
        ) : (
          <><Lock className="h-5 w-5" /> Pay {fmt(total)} Securely</>
        )}
      </Button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> SSL Secured</span>
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Razorpay</span>
        <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> 7-day refund</span>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const StudentCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const store = usePricingStore();

  const type = searchParams.get('type') ?? '';
  const id = searchParams.get('id') ?? '';
  const billing = searchParams.get('billing') ?? 'monthly';

  const cartItem = buildCartItem(type, id, billing, store);

  useEffect(() => {
    if (!cartItem && type) {
      toast({ title: 'Item not found', description: 'The item you selected is no longer available.', variant: 'destructive' });
      navigate('/student/pricing');
    }
  }, []);

  if (!cartItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Loading checkout...</p>
        <Button onClick={() => navigate('/student/pricing')}>Back to Pricing</Button>
      </div>
    );
  }

  const handleSuccess = (txnId: string) => {
    navigate(`/student/subscription?success=true&item=${encodeURIComponent(cartItem.name)}`);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="h-4 w-4 text-indigo-600" />
          <span className="font-bold text-foreground">Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" /> 256-bit SSL Encrypted
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Cart */}
          <CartSummary item={cartItem} store={store} onBack={() => navigate(-1)} />

          {/* Right: Payment */}
          <PaymentPanel item={cartItem} store={store} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default StudentCheckout;
