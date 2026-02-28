import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Users, Search, BookOpen, FileText, Newspaper, CheckCircle2,
    Clock, XCircle, TrendingUp, Eye, UserX, UserCheck, Edit,
    BarChart3, Award, AlertCircle,
} from 'lucide-react';
import { useEmployeeList, useContentItems, type EmployeePermissions } from '@/hooks/useEmployeePermissions';
import { useExamCatalog } from '@/hooks/useExamCatalog';
import { useToast } from '@/hooks/use-toast';

const EmployeeManager: React.FC = () => {
    const { toast } = useToast();
    const { employees, toggleEmployeeActive } = useEmployeeList();
    const { items: contentItems } = useContentItems();
    const { catalog } = useExamCatalog();

    const [search, setSearch] = useState('');
    const [selectedEmp, setSelectedEmp] = useState<EmployeePermissions | null>(null);

    // Compute stats per employee
    const empStats = useMemo(() => {
        return employees.map(emp => {
            const myItems = contentItems.filter(i => i.employeeId === emp.id);
            return {
                employee: emp,
                total: myItems.length,
                questions: myItems.filter(i => i.type === 'question').length,
                tests: myItems.filter(i => i.type === 'test').length,
                blogs: myItems.filter(i => i.type === 'blog').length,
                currentAffairs: myItems.filter(i => i.type === 'current_affairs').length,
                pending: myItems.filter(i => i.status === 'pending_approval').length,
                approved: myItems.filter(i => i.status === 'approved').length,
                rejected: myItems.filter(i => i.status === 'rejected').length,
                drafts: myItems.filter(i => i.status === 'draft').length,
                approvalRate: myItems.length > 0
                    ? Math.round((myItems.filter(i => i.status === 'approved').length / myItems.length) * 100)
                    : 0,
            };
        });
    }, [employees, contentItems]);

    const filtered = useMemo(() =>
        empStats.filter(s =>
            s.employee.name.toLowerCase().includes(search.toLowerCase()) ||
            s.employee.email.toLowerCase().includes(search.toLowerCase())
        ), [empStats, search]);

    const selectedStats = selectedEmp
        ? empStats.find(s => s.employee.id === selectedEmp.id)
        : null;

    const selectedContent = selectedEmp
        ? contentItems.filter(i => i.employeeId === selectedEmp.id)
        : [];

    const getCategoryName = (id: string) => catalog.find(c => c.id === id)?.name || id;

    // Overall platform stats
    const totalPending = contentItems.filter(i => i.status === 'pending_approval').length;
    const totalApproved = contentItems.filter(i => i.status === 'approved').length;
    const activeEmps = employees.filter(e => e.isActive).length;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-primary" /> Employee Monitor
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Track employee performance, content output, and approval rates in real time.
                </p>
            </div>

            {/* Platform-wide stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{activeEmps}</div>
                    <div className="text-xs text-gray-600 uppercase">Active Employees</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{contentItems.length}</div>
                    <div className="text-xs text-gray-600 uppercase">Total Uploads</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{totalPending}</div>
                    <div className="text-xs text-gray-600 uppercase">Pending Approval</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{totalApproved}</div>
                    <div className="text-xs text-gray-600 uppercase">Approved Content</div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Employee cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No employees found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(({ employee: emp, ...stats }) => (
                        <Card key={emp.id} className={`hover:shadow-md transition-all cursor-pointer ${!emp.isActive ? 'opacity-60' : ''}`}
                            onClick={() => setSelectedEmp(emp)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base">{emp.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                                    </div>
                                    <Badge variant={emp.isActive ? 'default' : 'secondary'} className="text-xs">
                                        {emp.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Approval rate */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Approval Rate</span>
                                        <span className="font-semibold text-green-600">{stats.approvalRate}%</span>
                                    </div>
                                    <Progress value={stats.approvalRate} className="h-1.5" />
                                </div>

                                {/* Content breakdown */}
                                <div className="grid grid-cols-4 gap-1 text-center">
                                    <div className="bg-blue-50 rounded p-1">
                                        <div className="text-sm font-bold text-blue-600">{stats.questions}</div>
                                        <div className="text-[9px] text-gray-500">Q</div>
                                    </div>
                                    <div className="bg-purple-50 rounded p-1">
                                        <div className="text-sm font-bold text-purple-600">{stats.tests}</div>
                                        <div className="text-[9px] text-gray-500">Tests</div>
                                    </div>
                                    <div className="bg-orange-50 rounded p-1">
                                        <div className="text-sm font-bold text-orange-600">{stats.blogs}</div>
                                        <div className="text-[9px] text-gray-500">Blogs</div>
                                    </div>
                                    <div className="bg-green-50 rounded p-1">
                                        <div className="text-sm font-bold text-green-600">{stats.currentAffairs}</div>
                                        <div className="text-[9px] text-gray-500">CA</div>
                                    </div>
                                </div>

                                {/* Status pills */}
                                <div className="flex gap-1 flex-wrap text-[10px]">
                                    {stats.pending > 0 && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">⏳ {stats.pending} pending</span>}
                                    {stats.approved > 0 && <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">✅ {stats.approved} approved</span>}
                                    {stats.rejected > 0 && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">❌ {stats.rejected} rejected</span>}
                                    {stats.drafts > 0 && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">📝 {stats.drafts} drafts</span>}
                                </div>

                                {/* Assigned categories */}
                                <div className="flex flex-wrap gap-1">
                                    {emp.assignedCategories.slice(0, 3).map(cid => (
                                        <Badge key={cid} variant="outline" className="text-[10px] px-1.5">{getCategoryName(cid)}</Badge>
                                    ))}
                                    {emp.assignedCategories.length > 3 && (
                                        <Badge variant="outline" className="text-[10px] px-1.5">+{emp.assignedCategories.length - 3}</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Employee Detail Modal */}
            <Dialog open={!!selectedEmp} onOpenChange={o => !o && setSelectedEmp(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            {selectedEmp?.name} — Performance
                        </DialogTitle>
                    </DialogHeader>

                    {selectedStats && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium">{selectedEmp?.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Created by {selectedEmp?.createdBy} · {selectedEmp?.createdAt && new Date(selectedEmp.createdAt).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => {
                                        if (selectedEmp) {
                                            toggleEmployeeActive(selectedEmp.id);
                                            toast({ title: selectedEmp.isActive ? `${selectedEmp.name} deactivated` : `${selectedEmp.name} activated` });
                                        }
                                    }}
                                    className="gap-1"
                                >
                                    {selectedEmp?.isActive
                                        ? <><UserX className="h-3.5 w-3.5 text-orange-500" />Deactivate</>
                                        : <><UserCheck className="h-3.5 w-3.5 text-green-500" />Activate</>
                                    }
                                </Button>
                            </div>

                            {/* Permissions summary */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Permissions</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedEmp?.canUploadQuestions && <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Upload Questions</Badge>}
                                    {selectedEmp?.canCreateTests && <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">Create Tests</Badge>}
                                    {selectedEmp?.canWriteBlogs && <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">Write Blogs</Badge>}
                                    {selectedEmp?.canCreateCurrentAffairs && <Badge className="bg-green-100 text-green-700 border-0 text-xs">Current Affairs</Badge>}
                                    {selectedEmp?.canScheduleTests && <Badge className="bg-teal-100 text-teal-700 border-0 text-xs">Schedule Tests</Badge>}
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-purple-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-purple-600">{selectedStats.total}</div>
                                    <div className="text-xs text-gray-600">Total Uploads</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-green-600">{selectedStats.approvalRate}%</div>
                                    <div className="text-xs text-gray-600">Approval Rate</div>
                                </div>
                            </div>

                            {/* Recent content */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Uploads</p>
                                {selectedContent.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">No content uploaded yet.</p>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {selectedContent.slice().reverse().slice(0, 15).map(item => (
                                            <div key={item.id} className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2">
                                                <span className="capitalize text-xs text-muted-foreground w-20 shrink-0">{item.type.replace('_', ' ')}</span>
                                                <span className="flex-1 line-clamp-1">{item.title}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize shrink-0 ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                                                            item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>{item.status.replace('_', ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedEmp(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EmployeeManager;
