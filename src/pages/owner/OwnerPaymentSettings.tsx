import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePricingStore } from '@/hooks/usePricingStore';
import type { GatewayConfig } from '@/types/pricing';
import {
  Settings, CreditCard, Shield, Building2, FileText, AlertTriangle,
  Save, Eye, EyeOff, Zap, RefreshCw, Percent, Calendar, IndianRupee,
  CheckCircle2, XCircle, ExternalLink, Trash2,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const GATEWAY_INFO: Record<string, { color: string; bg: string; description: string; website: string }> = {
  Razorpay: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', description: "India's #1 payment gateway — UPI, Cards, NetBanking, Wallets", website: 'https://razorpay.com' },
  PhonePe: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', description: 'UPI-first payment processor with 450M+ users', website: 'https://phonepe.com' },
  Cashfree: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', description: 'Fast settlements + auto-split for marketplace payouts', website: 'https://cashfree.com' },
};

// ─── Gateway Card ─────────────────────────────────────────────────────────────

const GatewayCard: React.FC<{ gw: GatewayConfig; onToggle: (id: string, field: 'isActive' | 'isTestMode', value: boolean) => void; onConfigure: (gw: GatewayConfig) => void }> = ({ gw, onToggle, onConfigure }) => {
  const info = GATEWAY_INFO[gw.name] ?? { color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', description: '', website: '' };
  return (
    <Card className={`border ${info.bg} transition-all`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className={`text-lg font-bold ${info.color}`}>{gw.name}</div>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">{info.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {gw.isActive ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1"><CheckCircle2 className="h-3 w-3" /> Active</Badge>
            ) : (
              <Badge variant="outline" className="text-slate-500 gap-1"><XCircle className="h-3 w-3" /> Inactive</Badge>
            )}
            {gw.isActive && gw.isTestMode && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">TEST MODE</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/70 border border-white/80">
            <span className="text-sm font-medium">Active</span>
            <Switch checked={gw.isActive} onCheckedChange={v => onToggle(gw.id, 'isActive', v)} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/70 border border-white/80">
            <span className="text-sm font-medium">Test Mode</span>
            <Switch checked={gw.isTestMode} onCheckedChange={v => onToggle(gw.id, 'isTestMode', v)} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => onConfigure(gw)}>
            <Settings className="h-3.5 w-3.5" /> Configure Keys
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => window.open(info.website, '_blank')}>
            <ExternalLink className="h-3.5 w-3.5" /> Docs
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">Last updated: {new Date(gw.updatedAt).toLocaleDateString('en-IN')}</p>
      </CardContent>
    </Card>
  );
};

// ─── Configure Keys Dialog ────────────────────────────────────────────────────

const ConfigDialog: React.FC<{ gw: GatewayConfig | null; onClose: () => void; onSave: (id: string, keyId: string, webhookSecret: string) => void }> = ({ gw, onClose, onSave }) => {
  const [keyId, setKeyId] = useState(gw?.keyId ?? '');
  const [secret, setSecret] = useState(gw?.webhookSecret ?? '');
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (gw) { setKeyId(gw.keyId ?? ''); setSecret(gw.webhookSecret ?? ''); }
  }, [gw]);

  const handleSave = async () => {
    if (!gw) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    onSave(gw.id, keyId, secret);
    setSaving(false);
    onClose();
  };

  if (!gw) return null;

  return (
    <AlertDialog open={!!gw} onOpenChange={o => !o && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" /> Configure {gw.name}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Enter your {gw.name} API credentials. These are stored securely.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Key ID / Client ID</Label>
            <div className="relative">
              <Input type={showKey ? 'text' : 'password'} value={keyId} onChange={e => setKeyId(e.target.value)} placeholder={`rzp_test_...`} className="pr-10 font-mono text-sm" />
              <button onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Webhook Secret</Label>
            <div className="relative">
              <Input type={showSecret ? 'text' : 'password'} value={secret} onChange={e => setSecret(e.target.value)} placeholder="whsec_..." className="pr-10 font-mono text-sm" />
              <button onClick={() => setShowSecret(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {gw.isTestMode && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" /> Test Mode is ON. Use test credentials. Disable before going live.
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Keys
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const OwnerPaymentSettings: React.FC = () => {
  const { toast } = useToast();
  const { paymentSettings, updatePaymentSettings, updateGateway } = usePricingStore();

  const [configGw, setConfigGw] = useState<GatewayConfig | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Tax section state
  const [gstRate, setGstRate] = useState(paymentSettings.gstRate);
  const [autoInvoice, setAutoInvoice] = useState(paymentSettings.autoInvoice);
  const [refundDays, setRefundDays] = useState(paymentSettings.refundWindowDays);
  const [savingTax, setSavingTax] = useState(false);

  // Bank section state
  const [bankName, setBankName] = useState(paymentSettings.bankAccount?.bankName ?? '');
  const [accountName, setAccountName] = useState(paymentSettings.bankAccount?.accountName ?? '');
  const [accountNumber, setAccountNumber] = useState(paymentSettings.bankAccount?.accountNumber ?? '');
  const [ifsc, setIfsc] = useState(paymentSettings.bankAccount?.ifsc ?? '');
  const [showAccNum, setShowAccNum] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  const handleToggleGateway = (id: string, field: 'isActive' | 'isTestMode', value: boolean) => {
    updateGateway(id, { [field]: value });
    const gw = paymentSettings.gateways.find(g => g.id === id);
    toast({ title: field === 'isActive' ? (value ? 'Gateway Enabled' : 'Gateway Disabled') : (value ? 'Test Mode On' : 'Test Mode Off'), description: `${gw?.name}` });
  };

  const handleSaveGatewayKeys = (id: string, keyId: string, webhookSecret: string) => {
    updateGateway(id, { keyId, webhookSecret });
    toast({ title: 'API Keys Saved', description: 'Credentials updated securely.' });
  };

  const handleSaveTax = async () => {
    setSavingTax(true);
    await new Promise(r => setTimeout(r, 400));
    updatePaymentSettings({ gstRate, autoInvoice, refundWindowDays: refundDays });
    toast({ title: 'Tax Settings Saved', description: `GST rate set to ${gstRate}%` });
    setSavingTax(false);
  };

  const handleSaveBank = async () => {
    setSavingBank(true);
    await new Promise(r => setTimeout(r, 400));
    updatePaymentSettings({ bankAccount: { accountName, accountNumber, ifsc, bankName } });
    toast({ title: 'Bank Account Saved', description: 'Settlement account updated.' });
    setSavingBank(false);
  };

  const activeGateways = paymentSettings.gateways.filter(g => g.isActive);
  const sampleTotal = 499 * (1 + gstRate / 100);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-600" /> Payment Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure payment gateways, GST and billing preferences</p>
        </div>
      </div>

      {/* No active gateway warning */}
      {activeGateways.length === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">No payment gateway is active. Students cannot make purchases until at least one gateway is enabled.</p>
        </div>
      )}

      {/* Gateways */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Payment Gateways</h2>
            <p className="text-xs text-muted-foreground">Configure which payment processors accept student payments</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentSettings.gateways.map(gw => (
            <GatewayCard key={gw.id} gw={gw} onToggle={handleToggleGateway} onConfigure={setConfigGw} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Tax Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Tax Configuration</h2>
            <p className="text-xs text-muted-foreground">GST and billing cycle settings</p>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Percent className="h-4 w-4" /> GST Rate (%)</Label>
                <Input type="number" min={0} max={30} value={gstRate} onChange={e => setGstRate(Number(e.target.value))} />
                <p className="text-xs text-muted-foreground">
                  Example: ₹499 plan → student pays <span className="font-bold text-foreground">{fmt(sampleTotal)}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Refund Window (days)</Label>
                <Input type="number" min={0} max={30} value={refundDays} onChange={e => setRefundDays(Number(e.target.value))} />
                <p className="text-xs text-muted-foreground">0 = no refunds after purchase</p>
              </div>

              <div className="space-y-2">
                <Label>Auto-generate Invoices</Label>
                <div className="flex items-center gap-3 mt-2 p-3 rounded-lg bg-muted/30 border">
                  <Switch checked={autoInvoice} onCheckedChange={setAutoInvoice} />
                  <span className="text-sm text-muted-foreground">{autoInvoice ? 'Invoice sent on every payment' : 'Manual invoicing only'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveTax} disabled={savingTax} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {savingTax ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Tax Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Bank Account */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Settlement Bank Account</h2>
            <p className="text-xs text-muted-foreground">Razorpay will settle payments to this account</p>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Exament Edu Private Ltd" />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="HDFC Bank" />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <div className="relative">
                  <Input
                    type={showAccNum ? 'text' : 'password'}
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="XXXXXXXXXXXX"
                    className="pr-10 font-mono"
                  />
                  <button onClick={() => setShowAccNum(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showAccNum ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>IFSC Code</Label>
                <Input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="HDFC0001234" className="font-mono uppercase" />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
              <Shield className="h-4 w-4 flex-shrink-0" />
              Account details are encrypted and only used for payment settlement. Never shared with students.
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveBank} disabled={savingBank} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {savingBank ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Bank Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Business Info */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Business Billing Info</h2>
            <p className="text-xs text-muted-foreground">This appears on all invoices sent to students</p>
          </div>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Business Name', value: 'Exament Edu Private Ltd' },
                { label: 'GSTIN', value: '33AABCE1234F1Z5' },
                { label: 'Support Email', value: 'payments@exament.in' },
                { label: 'Address', value: 'Chennai, Tamil Nadu, India' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium text-foreground">{r.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Danger Zone */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="text-base font-semibold text-red-600">System Settings</h2>
        </div>
        <Card className="border border-red-200 bg-red-50/30">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white border">
              <div>
                <p className="text-sm font-medium">Clear All Test Transactions</p>
                <p className="text-xs text-muted-foreground">Remove all mock transactions from the database</p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setClearConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-1.5" /> Clear Transactions
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white border">
              <div>
                <p className="text-sm font-medium">Reset Pricing to Defaults</p>
                <p className="text-xs text-muted-foreground">Restore all plans, packages, and add-ons to original seed data</p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setResetConfirm(true)}>
                <RefreshCw className="h-4 w-4 mr-1.5" /> Reset Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Gateway config dialog */}
      <ConfigDialog gw={configGw} onClose={() => setConfigGw(null)} onSave={handleSaveGatewayKeys} />

      {/* Clear Confirm */}
      <AlertDialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Transactions?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete all transaction records. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
              localStorage.removeItem('exament_transactions_v1');
              toast({ title: 'Transactions Cleared', description: 'All test transactions have been removed.' });
              setClearConfirm(false);
              window.location.reload();
            }}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirm */}
      <AlertDialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Pricing?</AlertDialogTitle>
            <AlertDialogDescription>This will reset all plans, packages, addons, and coupons to their default values. All your customizations will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
              ['exament_pricing_plans_v1', 'exament_pricing_packages_v1', 'exament_pricing_addons_v1', 'exament_coupons_v1', 'exament_bundle_v1', 'exament_payment_settings_v1', 'exament_category_access_v1', 'exament_feature_access_v1'].forEach(k => localStorage.removeItem(k));
              toast({ title: 'Pricing Reset', description: 'All pricing data has been restored to defaults.' });
              setResetConfirm(false);
              window.location.reload();
            }}>
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerPaymentSettings;
