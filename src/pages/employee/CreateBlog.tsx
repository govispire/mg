import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Save, Send, FileText, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContentItems, useCurrentEmployeePermissions } from '@/hooks/useEmployeePermissions';

const CreateBlog: React.FC = () => {
    const { toast } = useToast();
    const permissions = useCurrentEmployeePermissions();
    const { items, addItem, updateItem, deleteOwnDraft } = useContentItems();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [submitConfirm, setSubmitConfirm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Only this employee's blogs
    const employeeId = permissions?.id || 'unknown';
    const myBlogs = items.filter(i => i.type === 'blog' && i.employeeId === employeeId);

    const resetForm = () => { setTitle(''); setBody(''); setTags(''); setIsFeatured(false); setEditingId(null); };

    const saveDraft = () => {
        if (!title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
        if (editingId) {
            updateItem(editingId, { title, body, metadata: { tags, isFeatured } });
            toast({ title: '📝 Draft updated' });
        } else {
            addItem({
                type: 'blog',
                title,
                body,
                status: 'draft',
                employeeId,
                employeeName: permissions?.name || 'Employee',
                metadata: { tags, isFeatured },
            });
            toast({ title: '📝 Draft saved!' });
        }
        resetForm();
    };

    const submitForApproval = () => {
        if (!title.trim() || !body.trim()) {
            toast({ title: 'Title and body are required', variant: 'destructive' }); return;
        }
        if (editingId) {
            updateItem(editingId, { title, body, status: 'pending_approval', metadata: { tags, isFeatured } });
            toast({ title: '✅ Submitted for approval!' });
        } else {
            addItem({
                type: 'blog',
                title,
                body,
                status: 'pending_approval',
                employeeId,
                employeeName: permissions?.name || 'Employee',
                metadata: { tags, isFeatured },
            });
            toast({ title: '✅ Blog submitted for approval!' });
        }
        setSubmitConfirm(false);
        resetForm();
    };

    const loadForEdit = (id: string) => {
        const item = myBlogs.find(i => i.id === id);
        if (!item || item.status !== 'draft') return;
        setTitle(item.title);
        setBody(item.body || '');
        setTags((item.metadata?.tags as string) || '');
        setIsFeatured((item.metadata?.isFeatured as boolean) || false);
        setEditingId(id);
    };

    const STATUS_ICON = { draft: Clock, pending_approval: Clock, approved: CheckCircle2, rejected: XCircle };
    const STATUS_COLOR = { draft: 'text-gray-500', pending_approval: 'text-amber-600', approved: 'text-green-600', rejected: 'text-red-600' };

    if (!permissions?.canWriteBlogs) {
        return (
            <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-gray-600">No Blog Access</h2>
                <p className="text-muted-foreground text-sm mt-1">Your account doesn't have blog writing permissions. Contact your Superadmin.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" /> Write Blog
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Create blog articles. Save as draft or submit for Superadmin approval.
                </p>
            </div>

            <Tabs defaultValue="editor">
                <TabsList>
                    <TabsTrigger value="editor">✍️ Editor {editingId && <Badge className="ml-1 text-[10px] bg-amber-100 text-amber-700 border-0">Editing Draft</Badge>}</TabsTrigger>
                    <TabsTrigger value="my-blogs">📚 My Blogs ({myBlogs.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-4">
                    <Card>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <Label>Blog Title *</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Top 10 Tips for IBPS PO 2024" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Content *</Label>
                                <Textarea
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    placeholder="Write your blog content here…"
                                    rows={12}
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground text-right">{body.length} characters</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Tags (comma-separated)</Label>
                                    <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="banking, ibps, tips" />
                                </div>
                                <div className="flex items-center gap-3 mt-5">
                                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                                    <Label className="cursor-pointer">Mark as Featured</Label>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button variant="outline" onClick={saveDraft} className="gap-2 flex-1">
                                    <Save className="h-4 w-4" /> {editingId ? 'Update Draft' : 'Save as Draft'}
                                </Button>
                                <Button onClick={() => setSubmitConfirm(true)} className="gap-2 flex-1">
                                    <Send className="h-4 w-4" /> Submit for Approval
                                </Button>
                                {editingId && (
                                    <Button variant="ghost" onClick={resetForm} className="text-xs">Cancel Edit</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="my-blogs" className="mt-4">
                    {myBlogs.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-muted-foreground">No blogs yet. Write your first one!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myBlogs.slice().reverse().map(blog => {
                                const Icon = STATUS_ICON[blog.status];
                                return (
                                    <Card key={blog.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${STATUS_COLOR[blog.status]}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-medium text-sm">{blog.title}</h3>
                                                        <Badge className={`text-[10px] shrink-0 capitalize ${blog.status === 'approved' ? 'bg-green-100 text-green-700 border-0' :
                                                                blog.status === 'pending_approval' ? 'bg-amber-100 text-amber-700 border-0' :
                                                                    blog.status === 'rejected' ? 'bg-red-100 text-red-700 border-0' : 'bg-gray-100 text-gray-600 border-0'
                                                            }`}>{blog.status.replace('_', ' ')}</Badge>
                                                    </div>
                                                    {blog.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{blog.body}</p>}
                                                    {blog.status === 'rejected' && blog.rejectionReason && (
                                                        <p className="text-xs text-red-600 mt-1">❌ {blog.rejectionReason}</p>
                                                    )}
                                                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(blog.createdAt).toLocaleDateString('en-IN')}</p>
                                                </div>
                                            </div>
                                            {blog.status === 'draft' && (
                                                <div className="flex gap-2 mt-2 pt-2 border-t">
                                                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => loadForEdit(blog.id)}>
                                                        <Eye className="h-3 w-3" /> Edit Draft
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => deleteOwnDraft(blog.id, employeeId)}>
                                                        Delete Draft
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <AlertDialog open={submitConfirm} onOpenChange={setSubmitConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Blog for Approval?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "<strong>{title}</strong>" will be sent to the Superadmin for review. You won't be able to edit it once submitted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={submitForApproval}>Yes, Submit</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CreateBlog;
