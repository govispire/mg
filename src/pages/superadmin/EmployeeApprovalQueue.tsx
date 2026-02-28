import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    CheckCircle2, XCircle, Clock, FileText, BookOpen, Newspaper, Eye,
    ChevronRight, Search, Filter,
} from 'lucide-react';
import { useContentItems, type ContentItem } from '@/hooks/useEmployeePermissions';
import { useToast } from '@/hooks/use-toast';

const TYPE_ICON: Record<ContentItem['type'], React.ElementType> = {
    question: BookOpen,
    test: FileText,
    blog: FileText,
    current_affairs: Newspaper,
};

const TYPE_COLOR: Record<ContentItem['type'], string> = {
    question: 'bg-blue-100 text-blue-700',
    test: 'bg-purple-100 text-purple-700',
    blog: 'bg-orange-100 text-orange-700',
    current_affairs: 'bg-green-100 text-green-700',
};

const STATUS_COLOR: Record<ContentItem['status'], string> = {
    draft: 'bg-gray-100 text-gray-600',
    pending_approval: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const EmployeeApprovalQueue: React.FC = () => {
    const { toast } = useToast();
    const { items, approveItem, rejectItem } = useContentItems();

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<ContentItem['type'] | 'all'>('all');
    const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
    const [rejectTarget, setRejectTarget] = useState<ContentItem | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const pending = useMemo(() =>
        items.filter(i => i.status === 'pending_approval' &&
            (typeFilter === 'all' || i.type === typeFilter) &&
            (i.title.toLowerCase().includes(search.toLowerCase()) || i.employeeName.toLowerCase().includes(search.toLowerCase()))
        ), [items, typeFilter, search]);

    const approved = useMemo(() =>
        items.filter(i => i.status === 'approved'), [items]);

    const rejected = useMemo(() =>
        items.filter(i => i.status === 'rejected'), [items]);

    const handleApprove = (item: ContentItem) => {
        approveItem(item.id, 'Superadmin');
        toast({ title: `✅ Approved: "${item.title}"` });
    };

    const handleReject = () => {
        if (!rejectTarget) return;
        rejectItem(rejectTarget.id, rejectReason || 'Does not meet quality standards.');
        toast({ title: `❌ Rejected: "${rejectTarget.title}"`, variant: 'destructive' });
        setRejectTarget(null);
        setRejectReason('');
    };

    const ContentCard = ({ item }: { item: ContentItem }) => {
        const Icon = TYPE_ICON[item.type];
        return (
            <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${TYPE_COLOR[item.type]}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                                <Badge className={`text-[10px] px-1.5 shrink-0 ${STATUS_COLOR[item.status]}`}>
                                    {item.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                By <strong>{item.employeeName}</strong> · {new Date(item.createdAt).toLocaleDateString('en-IN')}
                                {item.categoryId && <> · Category: {item.categoryId}</>}
                            </p>
                            {item.body && (
                                <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{item.body}</p>
                            )}
                            {item.status === 'rejected' && item.rejectionReason && (
                                <p className="text-xs text-red-600 mt-1">Reason: {item.rejectionReason}</p>
                            )}
                        </div>
                    </div>
                    {item.status === 'pending_approval' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => setPreviewItem(item)}>
                                <Eye className="h-3.5 w-3.5" /> Preview
                            </Button>
                            <Button size="sm" className="flex-1 text-xs gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(item)}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1 text-xs gap-1" onClick={() => setRejectTarget(item)}>
                                <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="h-6 w-6 text-amber-500" /> Approval Queue
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review and approve employee-submitted content before it goes live.
                    </p>
                </div>
                {pending.length > 0 && (
                    <Badge className="bg-amber-500 text-white px-3 py-1 text-sm">
                        {pending.length} pending
                    </Badge>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{items.filter(i => i.status === 'pending_approval').length}</div>
                    <div className="text-xs text-gray-600 uppercase">Pending</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{approved.length}</div>
                    <div className="text-xs text-gray-600 uppercase">Approved</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
                    <div className="text-xs text-gray-600 uppercase">Rejected</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search by title or employee…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    {(['all', 'question', 'test', 'blog', 'current_affairs'] as const).map(t => (
                        <Button
                            key={t}
                            variant={typeFilter === t ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTypeFilter(t)}
                            className="text-xs capitalize"
                        >
                            {t === 'all' ? 'All' : t.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">
                        <Clock className="h-4 w-4 mr-1" />Pending ({items.filter(i => i.status === 'pending_approval').length})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                        <CheckCircle2 className="h-4 w-4 mr-1" />Approved ({approved.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                        <XCircle className="h-4 w-4 mr-1" />Rejected ({rejected.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                    {pending.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-xl">
                            <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-3" />
                            <p className="text-muted-foreground">All caught up! No pending approvals.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pending.map(item => <ContentCard key={item.id} item={item} />)}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="approved" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {approved.map(item => <ContentCard key={item.id} item={item} />)}
                    </div>
                </TabsContent>

                <TabsContent value="rejected" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rejected.map(item => <ContentCard key={item.id} item={item} />)}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Preview Dialog */}
            <Dialog open={!!previewItem} onOpenChange={o => !o && setPreviewItem(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {previewItem && (() => { const Icon = TYPE_ICON[previewItem.type]; return <Icon className="h-5 w-5" />; })()}
                            {previewItem?.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>By <strong>{previewItem?.employeeName}</strong></span>
                            <span>·</span>
                            <span>Type: <strong className="capitalize">{previewItem?.type.replace('_', ' ')}</strong></span>
                            <span>·</span>
                            <span>{previewItem && new Date(previewItem.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        {previewItem?.body && (
                            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                                {previewItem.body}
                            </div>
                        )}
                        {previewItem?.metadata && (
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                                {JSON.stringify(previewItem.metadata, null, 2)}
                            </pre>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="destructive" onClick={() => { setRejectTarget(previewItem); setPreviewItem(null); }}>
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => { if (previewItem) handleApprove(previewItem); setPreviewItem(null); }}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject with reason Dialog */}
            <Dialog open={!!rejectTarget} onOpenChange={o => !o && setRejectTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>❌ Reject "{rejectTarget?.title}"</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label>Rejection Reason</Label>
                        <Textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Explain why this is being rejected so the employee can improve it…"
                            rows={4}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject}>Confirm Reject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EmployeeApprovalQueue;
