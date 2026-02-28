import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Edit, Trash2, UserCheck, UserX, Users, Shield, BookOpen,
  CheckSquare, FileText, Newspaper, Calendar, Eye, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeList, type EmployeePermissions } from '@/hooks/useEmployeePermissions';
import { useExamCatalog } from '@/hooks/useExamCatalog';

// ─── Default permission form ─────────────────────────────────────────────────

const defaultForm = () => ({
  name: '',
  email: '',
  phone: '',
  assignedCategories: [] as string[],
  assignedExams: [] as string[],
  canUploadQuestions: false,
  canCreateTests: false,
  canWriteBlogs: false,
  canCreateCurrentAffairs: false,
  canScheduleTests: false,
});

type FormState = ReturnType<typeof defaultForm>;

// ─── Permission Toggle Row ───────────────────────────────────────────────────

const PermToggle = ({
  icon: Icon, label, description, checked, onChange,
}: { icon: React.ElementType; label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-0">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

// ─── Category / Exam multi-select ────────────────────────────────────────────

const MultiCheckList = ({
  items, selected, onToggle, label,
}: { items: { id: string; name: string }[]; selected: string[]; onToggle: (id: string) => void; label: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label>{label} ({selected.length} selected)</Label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition"
      >
        <span className="text-muted-foreground truncate">
          {selected.length === 0 ? `Select ${label}…` : selected.slice(0, 3).join(', ') + (selected.length > 3 ? ` +${selected.length - 3} more` : '')}
        </span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>
      {open && (
        <div className="border rounded-md max-h-40 overflow-y-auto divide-y bg-white shadow-sm">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3 text-center">No items available</p>
          ) : items.map(item => (
            <label key={item.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => onToggle(item.id)}
                className="rounded"
              />
              {item.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CreateAdmins = () => {
  const { toast } = useToast();
  const { employees, addEmployee, updateEmployee, removeEmployee, toggleEmployeeActive } = useEmployeeList();
  const { catalog } = useExamCatalog();

  const [form, setForm] = useState<FormState>(defaultForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmployeePermissions | null>(null);

  // Build category + exam lists from catalog
  const categoryOptions = useMemo(() =>
    catalog.map(c => ({ id: c.id, name: c.name })), [catalog]);

  const examOptions = useMemo(() => {
    if (form.assignedCategories.length === 0) return [];
    return catalog
      .filter(c => form.assignedCategories.includes(c.id))
      .flatMap(c => c.sections.flatMap(s => s.exams.map(e => ({ id: e.id, name: e.name }))));
  }, [catalog, form.assignedCategories]);

  const toggleCategory = (id: string) => setForm(f => ({
    ...f,
    assignedCategories: f.assignedCategories.includes(id)
      ? f.assignedCategories.filter(x => x !== id)
      : [...f.assignedCategories, id],
    // Remove exams that no longer belong to selected categories
    assignedExams: f.assignedExams.filter(eid =>
      catalog.some(c => [...f.assignedCategories.filter(x => x !== id), id].includes(c.id) &&
        c.sections.some(s => s.exams.some(e => e.id === eid)))
    ),
  }));

  const toggleExam = (id: string) => setForm(f => ({
    ...f,
    assignedExams: f.assignedExams.includes(id)
      ? f.assignedExams.filter(x => x !== id)
      : [...f.assignedExams, id],
  }));

  const openCreate = () => { setEditingId(null); setForm(defaultForm()); setDialogOpen(true); };
  const openEdit = (emp: EmployeePermissions) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name, email: emp.email, phone: emp.phone || '',
      assignedCategories: emp.assignedCategories,
      assignedExams: emp.assignedExams,
      canUploadQuestions: emp.canUploadQuestions,
      canCreateTests: emp.canCreateTests,
      canWriteBlogs: emp.canWriteBlogs,
      canCreateCurrentAffairs: emp.canCreateCurrentAffairs,
      canScheduleTests: emp.canScheduleTests,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Name and email are required', variant: 'destructive' }); return;
    }
    if (editingId) {
      updateEmployee(editingId, { ...form });
      toast({ title: '✅ Employee updated', description: form.name });
    } else {
      addEmployee({
        ...form,
        createdBy: 'superadmin',
        isActive: true,
      });
      toast({ title: '✅ Employee created!', description: `${form.name} can now log in as Employee.` });
    }
    setDialogOpen(false);
    setForm(defaultForm());
    setEditingId(null);
  };

  const activeCount = employees.filter(e => e.isActive).length;
  const inactiveCount = employees.filter(e => !e.isActive).length;

  const getPermissionBadges = (emp: EmployeePermissions) => {
    const perms = [];
    if (emp.canUploadQuestions) perms.push('Questions');
    if (emp.canCreateTests) perms.push('Tests');
    if (emp.canWriteBlogs) perms.push('Blogs');
    if (emp.canCreateCurrentAffairs) perms.push('Current Affairs');
    if (emp.canScheduleTests) perms.push('Schedule');
    return perms;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Staff Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create employees with scoped permissions and exam assignments.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Total</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Active</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{inactiveCount}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Inactive</div>
        </div>
      </div>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees"><Users className="h-4 w-4 mr-1" />Employees ({employees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-4">
          {employees.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No employees yet. Create one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(emp => (
                <Card key={emp.id} className={`transition-all ${!emp.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{emp.name}</CardTitle>
                        <CardDescription className="truncate text-xs">{emp.email}</CardDescription>
                      </div>
                      <Badge variant={emp.isActive ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Assigned categories */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Assigned Categories</p>
                      <div className="flex flex-wrap gap-1">
                        {emp.assignedCategories.length === 0 ? (
                          <span className="text-xs text-gray-400">None</span>
                        ) : emp.assignedCategories.slice(0, 3).map(cid => {
                          const cat = catalog.find(c => c.id === cid);
                          return <Badge key={cid} variant="outline" className="text-[10px] px-1.5">{cat?.name || cid}</Badge>;
                        })}
                        {emp.assignedCategories.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5">+{emp.assignedCategories.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                    {/* Permissions */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Permissions</p>
                      <div className="flex flex-wrap gap-1">
                        {getPermissionBadges(emp).length === 0
                          ? <span className="text-xs text-gray-400">No permissions</span>
                          : getPermissionBadges(emp).map(p => (
                            <Badge key={p} className="text-[10px] px-1.5 bg-primary/10 text-primary border-0">{p}</Badge>
                          ))}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 pt-1">
                      <Button variant="outline" size="sm" className="gap-1 flex-1 text-xs" onClick={() => openEdit(emp)}>
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                      <Button
                        variant="outline" size="sm" className="gap-1 text-xs"
                        onClick={() => toggleEmployeeActive(emp.id)}
                        title={emp.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {emp.isActive ? <UserX className="h-3.5 w-3.5 text-orange-500" /> : <UserCheck className="h-3.5 w-3.5 text-green-500" />}
                      </Button>
                      <Button
                        variant="outline" size="sm" className="gap-1 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(emp)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Create / Edit Employee Dialog ────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? '✏️ Edit Employee' : '➕ Create Employee'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Priya Sharma" />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="priya@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
            </div>

            {/* Exam Scope */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Exam Scope
                </CardTitle>
                <CardDescription className="text-xs">Select which categories and exams this employee can work on.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MultiCheckList
                  label="Exam Categories"
                  items={categoryOptions}
                  selected={form.assignedCategories}
                  onToggle={toggleCategory}
                />
                <MultiCheckList
                  label="Specific Exams"
                  items={examOptions}
                  selected={form.assignedExams}
                  onToggle={toggleExam}
                />
                {form.assignedCategories.length > 0 && examOptions.length === 0 && (
                  <p className="text-xs text-amber-600">No exams found under selected categories. Add exams via Test Catalog.</p>
                )}
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Feature Permissions
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose what this employee is allowed to do. All uploads require Superadmin approval. Employees can never delete.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermToggle
                  icon={CheckSquare}
                  label="Upload Questions"
                  description="Can upload questions to assigned exams (requires approval)"
                  checked={form.canUploadQuestions}
                  onChange={v => setForm(f => ({ ...f, canUploadQuestions: v }))}
                />
                <PermToggle
                  icon={Eye}
                  label="Create & Preview Tests"
                  description="Can create test papers and preview (requires approval to publish)"
                  checked={form.canCreateTests}
                  onChange={v => setForm(f => ({ ...f, canCreateTests: v }))}
                />
                <PermToggle
                  icon={FileText}
                  label="Write Blogs"
                  description="Can write blog articles (draft → superadmin approval)"
                  checked={form.canWriteBlogs}
                  onChange={v => setForm(f => ({ ...f, canWriteBlogs: v }))}
                />
                <PermToggle
                  icon={Newspaper}
                  label="Create Current Affairs"
                  description="Can post current affairs entries (requires approval)"
                  checked={form.canCreateCurrentAffairs}
                  onChange={v => setForm(f => ({ ...f, canCreateCurrentAffairs: v }))}
                />
                <PermToggle
                  icon={Calendar}
                  label="Schedule Tests"
                  description="Can set scheduling dates for tests they have created"
                  checked={form.canScheduleTests}
                  onChange={v => setForm(f => ({ ...f, canScheduleTests: v }))}
                />
              </CardContent>
            </Card>

            {/* Always-fixed rules info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">🔒 Fixed rules for all employees:</p>
              <ul className="list-disc ml-4 space-y-0.5">
                <li>Can always edit their own <strong>draft</strong> content</li>
                <li>Cannot delete any submitted/approved content</li>
                <li>All uploads must be approved by Superadmin before going live</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? 'Save Changes' : 'Create Employee'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ───────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🗑️ Remove Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email}).
              Their uploaded content will remain but they will lose access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  removeEmployee(deleteTarget.id);
                  toast({ title: `${deleteTarget.name} removed`, variant: 'destructive' });
                  setDeleteTarget(null);
                }
              }}
            >
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateAdmins;
