import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Lock,
    Shield,
    Bell,
    Smartphone,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    SmartphoneIcon,
    Laptop,
    Globe,
    LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SecuritySettings: React.FC = () => {
    const { toast } = useToast();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [toggles, setToggles] = useState({
        twoFactor: false,
        profilePublic: true,
        emailAlerts: true,
        loginNotifications: true
    });

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast({
                title: "Error",
                description: "New passwords do not match.",
                variant: "destructive"
            });
            return;
        }
        toast({
            title: "Success",
            description: "Password updated successfully.",
        });
        setPasswords({ current: '', new: '', confirm: '' });
    };

    const sessions = [
        { id: 1, device: 'MacBook Pro', location: 'Mumbai, India', date: 'Active now', icon: Laptop, current: true },
        { id: 2, device: 'iPhone 15', location: 'Mumbai, India', date: '2 hours ago', icon: SmartphoneIcon, current: false },
        { id: 3, device: 'Chrome on Windows', location: 'Pune, India', date: 'Yesterday', icon: Globe, current: false },
    ];

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Shield className="h-8 w-8 text-indigo-600" />
                    Security & Privacy
                </h1>
                <p className="text-slate-500">Manage your account security, password, and privacy preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Toggles & Sessions */}
                <div className="md:col-span-1 space-y-6">
                    {/* Privacy Toggles */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Privacy Sync</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Public Profile</Label>
                                    <p className="text-xs text-slate-500 italic">Allow others to see your stats</p>
                                </div>
                                <Switch
                                    checked={toggles.profilePublic}
                                    onCheckedChange={(v) => setToggles({ ...toggles, profilePublic: v })}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Login Alerts</Label>
                                    <p className="text-xs text-slate-500 italic">Notify on new device sign-ins</p>
                                </div>
                                <Switch
                                    checked={toggles.loginNotifications}
                                    onCheckedChange={(v) => setToggles({ ...toggles, loginNotifications: v })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Sessions */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Device History</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-0">
                            {sessions.map((session) => (
                                <div key={session.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors group">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100">
                                        <session.icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-800">{session.device}</p>
                                        <p className="text-[10px] text-slate-500">{session.location} • {session.date}</p>
                                    </div>
                                    {session.current && (
                                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">Current</span>
                                    )}
                                </div>
                            ))}
                            <div className="px-6 pt-2 pb-1">
                                <Button variant="ghost" size="sm" className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-bold">
                                    <LogOut className="h-3 w-3 mr-2" /> Sign Out All Devices
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Password Form */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b pb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>Secure your account with a strong password.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="current" className="font-bold text-slate-700">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="current"
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pr-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="new" className="font-bold text-slate-700">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="new"
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pr-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm" className="font-bold text-slate-700">Confirm Password</Label>
                                        <Input
                                            id="confirm"
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3" /> Password Requirements
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2 text-[11px] text-indigo-700">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> At least 8 characters
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-indigo-700">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> One special character
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-indigo-700">
                                            <CheckCircle2 className="h-3 w-3 text-slate-300" /> One uppercase letter
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-indigo-700">
                                            <CheckCircle2 className="h-3 w-3 text-slate-300" /> One numeric value
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="ghost" className="font-semibold" onClick={() => setPasswords({ current: '', new: '', confirm: '' })}>
                                        Reset Fields
                                    </Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 px-8 font-bold rounded-full">
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* 2FA Section */}
                    <Card className="border-indigo-100 bg-indigo-50/20 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 opacity-10 -mr-4 -mt-4 transform group-hover:scale-110 transition-transform duration-500">
                            <Smartphone size={120} className="text-indigo-600" />
                        </div>
                        <CardContent className="pt-6 pb-6 pr-20">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-50 text-indigo-600">
                                    <SmartphoneIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-indigo-900 mb-1">Two-Factor Authentication (2FA)</h3>
                                    <p className="text-sm text-indigo-700/70 mb-4 max-w-md">Add an extra layer of security to your account. We'll send a code to your mobile device whenever you log in.</p>
                                    <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold px-6">
                                        Setup 2FA Now
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
