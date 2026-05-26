import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement, CreateUserPayload } from '@/hooks/useUserManagement';
import { ManagedUser, UserRole, EXAM_CATEGORIES } from '@/types/roles';
import {
  Users, UserPlus, Search, Shield, Activity, AlertTriangle,
  CheckCircle2, XCircle, Eye, Lock, Unlock, RotateCcw,
  Upload, ChevronDown, Building2, Phone, Hash,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  'super-admin': 'bg-blue-100 text-blue-700',
  employee: 'bg-teal-100 text-teal-700',
  mentor: 'bg-amber-100 text-amber-700',
  student: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-600',
};

// ── Create User Modal ────────────────────────────────────────
interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (user: ManagedUser) => void;
  allowedRoles: UserRole[];
  createUser: (p: CreateUserPayload) => Promise<ManagedUser>;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ open, onClose, onCreated, allowedRoles, createUser }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<CreateUserPayload>>({ role: allowedRoles[0], password: '' });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof CreateUserPayload, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      toast({ title: 'Missing fields', description: 'Name, email, password and role are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const user = await createUser(form as CreateUserPayload);
      toast({ title: '✅ User Created', description: `${user.name} (${user.role}) has been added to the platform.` });
      onCreated(user);
      onClose();
      setForm({ role: allowedRoles[0], password: '' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Create New User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name *</label>
            <Input placeholder="e.g. Priya Sharma" value={form.name || ''} onChange={e => set('name', e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email *</label>
            <Input type="email" placeholder="user@example.com" value={form.email || ''} onChange={e => set('email', e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password *</label>
            <Input type="password" placeholder="Min 6 characters" value={form.password || ''} onChange={e => set('password', e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role *</label>
            <Select value={form.role || ''} onValueChange={v => set('role', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map(r => (
                  <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1).replace('-', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
              <Input placeholder="+91 9XXXXXXXXX" value={form.phone || ''} onChange={e => set('phone', e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</label>
              <Select value={form.department || ''} onValueChange={v => set('department', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {EXAM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.role === 'mentor' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Student Capacity</label>
              <Input type="number" min={1} max={200} placeholder="e.g. 80"
                value={form.employee_capacity || ''} onChange={e => set('employee_capacity', Number(e.target.value))} className="mt-1" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Deactivate Confirmation Modal ────────────────────────────
interface DeactivateModalProps {
  user: ManagedUser | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeactivateModal: React.FC<DeactivateModalProps> = ({ user, onClose, onConfirm }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await onConfirm();
      toast({ title: '⚠️ Account Deactivated', description: `${user?.name} is now marked as Former ${user?.role}.` });
      onClose();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" /> Deactivate Account
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <p className="text-sm text-foreground">
            You are about to deactivate <strong>{user?.name}</strong> ({user?.role}).
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 space-y-1">
            <p>✓ Account will be blocked immediately</p>
            <p>✓ All their uploads and task history will be preserved</p>
            <p>✓ They will appear as <em>Former {user?.role}</em> in logs</p>
            <p>✓ You can reactivate at any time</p>
          </div>
          <p className="text-xs text-muted-foreground">Note: Never delete accounts — this is irreversible and destroys audit history.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handle} disabled={loading}>
            {loading ? 'Deactivating...' : 'Deactivate Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── User Row ─────────────────────────────────────────────────
interface UserRowProps {
  user: ManagedUser;
  onDeactivate: (u: ManagedUser) => void;
  onActivate: (u: ManagedUser) => void;
  allowedRoles: UserRole[];
}

const UserRow: React.FC<UserRowProps> = ({ user, onDeactivate, onActivate, allowedRoles }) => (
  <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors group">
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </td>
    <td className="py-3 px-4">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
        {user.role}
      </span>
    </td>
    <td className="py-3 px-4">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${STATUS_COLORS[user.status]}`}>
        {user.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {user.status === 'active' ? 'Active' : 'Former'}
      </span>
    </td>
    <td className="py-3 px-4 text-xs text-muted-foreground">
      {user.department || '—'}
    </td>
    <td className="py-3 px-4 text-xs text-muted-foreground">
      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : '—'}
    </td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {user.status === 'active' ? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
            onClick={() => onDeactivate(user)}>
            <Lock className="h-3 w-3 mr-1" /> Deactivate
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-green-600 hover:bg-green-50"
            onClick={() => onActivate(user)}>
            <Unlock className="h-3 w-3 mr-1" /> Reactivate
          </Button>
        )}
      </div>
    </td>
  </tr>
);

// ── Bulk Import Panel ────────────────────────────────────────
const BulkImportPanel: React.FC<{ bulkImport: (s: any[]) => Promise<any> }> = ({ bulkImport }) => {
  const { toast } = useToast();
  const [csvText, setCsvText] = useState('Name,Email,Exam,MentorID\n');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    const lines = csvText.trim().split('\n').slice(1);
    const students = lines.map(l => {
      const [name, email, exam, mentor_id] = l.split(',').map(s => s.trim());
      return { name, email, exam, mentor_id: mentor_id ? Number(mentor_id) : undefined };
    }).filter(s => s.name && s.email);

    if (students.length === 0) { toast({ title: 'No valid rows found', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const r = await bulkImport(students);
      setResult(r);
      toast({ title: `✅ Import Complete`, description: `${r.created?.length} students created, ${r.failed?.length} failed.` });
    } catch (e: any) {
      toast({ title: 'Import failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Paste CSV data below. Format: <code className="bg-muted px-1 rounded text-xs">Name,Email,Exam,MentorID</code>
      </p>
      <textarea
        className="w-full h-48 font-mono text-xs border border-border rounded-lg p-3 bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        value={csvText}
        onChange={e => setCsvText(e.target.value)}
      />
      <Button onClick={handleImport} disabled={loading} className="gap-2">
        <Upload className="h-4 w-4" /> {loading ? 'Importing...' : 'Import Students'}
      </Button>
      {result && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{result.created?.length}</p>
            <p className="text-xs text-green-700">Created</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{result.failed?.length}</p>
            <p className="text-xs text-red-700">Failed</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const OwnerManageUsers: React.FC = () => {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [createModal, setCreateModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<ManagedUser | null>(null);
  const [roleSummary, setRoleSummary] = useState<any[]>([]);

  const { users, total, isLoading, error, refetch, createUser, deactivateUser, activateUser, bulkImport, getRoleSummary } =
    useUserManagement({ role: roleFilter || undefined, status: statusFilter || undefined, search: search || undefined });

  useEffect(() => {
    getRoleSummary().then(setRoleSummary);
  }, [users]);

  // Aggregate role stats
  const roleStats = (() => {
    const active: Record<string, number> = {};
    const inactive: Record<string, number> = {};
    roleSummary.forEach(r => {
      if (r.status === 'active') active[r.role] = parseInt(r.count);
      else inactive[r.role] = parseInt(r.count);
    });
    const all: Record<string, number> = {};
    [...Object.keys(active), ...Object.keys(inactive)].forEach(k => {
      all[k] = (active[k] || 0) + (inactive[k] || 0);
    });
    return { active, inactive, all };
  })();

  const kpiCards = [
    { label: 'Total Users', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Superadmins', value: roleStats.all['super-admin'] || 0, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Employees', value: roleStats.all['employee'] || 0, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Mentors', value: roleStats.all['mentor'] || 0, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    const result = await deactivateUser(deactivateTarget.id);
    if (result.needs_reassignment) {
      // Show reassignment notification
    }
  };

  const handleActivate = async (user: ManagedUser) => {
    try {
      await activateUser(user.id);
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, manage and monitor all platform users
          </p>
        </div>
        <Button onClick={() => setCreateModal(true)} className="gap-2 shadow-sm">
          <UserPlus className="h-4 w-4" /> Create User
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(k => (
          <Card key={k.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${k.bg}`}>
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{k.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name or email..." value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={roleFilter} onValueChange={v => setRoleFilter(v as any)}>
              <SelectTrigger className="w-40 h-9"><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                {['super-admin', 'employee', 'mentor', 'student'].map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card className="border-border/50">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dept.</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-sm text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    ) : users.map(u => (
                      <UserRow
                        key={u.id}
                        user={u}
                        allowedRoles={['super-admin', 'employee', 'mentor', 'student']}
                        onDeactivate={setDeactivateTarget}
                        onActivate={handleActivate}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {!isLoading && users.length > 0 && (
              <div className="px-4 py-3 border-t border-border/40 text-xs text-muted-foreground">
                Showing {users.length} of {total} users
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" /> Bulk Student Import
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Import multiple students at once via CSV. System auto-generates IDs and sends credentials.
              </p>
            </CardHeader>
            <CardContent>
              <BulkImportPanel bulkImport={bulkImport} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateUserModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        onCreated={refetch}
        allowedRoles={['super-admin', 'employee', 'mentor', 'student']}
        createUser={createUser}
      />
      <DeactivateModal
        user={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
      />
    </div>
  );
};

export default OwnerManageUsers;
