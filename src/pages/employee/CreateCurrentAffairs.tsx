import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Save, Send, Newspaper, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContentItems, useCurrentEmployeePermissions } from '@/hooks/useEmployeePermissions';

const TOPICS = [
    'Polity', 'Economy', 'Science & Technology', 'Environment',
    'International Affairs', 'Sports', 'Awards & Honours', 'Defence',
    'Banking & Finance', 'Appointments', 'Government Schemes', 'Miscellaneous',
];

const CreateCurrentAffairs: React.FC = () => {
    const { toast } = useToast();
    const permissions = useCurrentEmployeePermissions();
    const { items, addItem, updateItem, deleteOwnDraft } = useContentItems();

    const [headline, setHeadline] = useState('');
    const [body, setBody] = useState('');
    const [topic, setTopic] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
    const [submitConfirm, setSubmitConfirm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const employeeId = permissions?.id || 'unknown';
    const myItems = items.filter(i => i.type === 'current_affairs' && i.employeeId === employeeId);

    const resetForm = () => { setHeadline(''); setBody(''); setTopic(''); setSourceUrl(''); setEventDate(new Date().toISOString().slice(0, 10)); setEditingId(null); };

    const saveDraft = () => {
        if (!headline.trim()) { toast({ title: 'Headline is required', variant: 'destructive' }); return; }
        if (editingId) {
            updateItem(editingId, { title: headline, body, metadata: { topic, sourceUrl, eventDate } });
            toast({ title: '📝 Draft updated' });
        } else {
            addItem({
                type: 'current_affairs',
                title: headline,
                body,
                status: 'draft',
                employeeId,
                employeeName: permissions?.name || 'Employee',
                metadata: { topic, sourceUrl, eventDate },
            });
            toast({ title: '📝 Draft saved!' });
        }
        resetForm();
    };

    const submitForApproval = () => {
        if (!headline.trim() || !body.trim()) {
            toast({ title: 'Headline and body are required', variant: 'destructive' }); return;
        }
        if (editingId) {
            updateItem(editingId, { title: headline, body, status: 'pending_approval', metadata: { topic, sourceUrl, eventDate } });
        } else {
            addItem({
                type: 'current_affairs',
                title: headline,
                body,
                status: 'pending_approval',
                employeeId,
                employeeName: permissions?.name || 'Employee',
                metadata: { topic, sourceUrl, eventDate },
            });
        }
        toast({ title: '✅ Submitted for approval!' });
        setSubmitConfirm(false);
        resetForm();
    };

    const loadForEdit = (id: string) => {
        const item = myItems.find(i => i.id === id);
        if (!item || item.status !== 'draft') return;
        setHeadline(item.title);
        setBody(item.body || '');
        setTopic((item.metadata?.topic as string) || '');
        setSourceUrl((item.metadata?.sourceUrl as string) || '');
        setEventDate((item.metadata?.eventDate as string) || new Date().toISOString().slice(0, 10));
        setEditingId(id);
    };

    if (!permissions?.canCreateCurrentAffairs) {
        return (
            <div className="p-8 text-center">
                <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-gray-600">No Current Affairs Access</h2>
                <p className="text-muted-foreground text-sm mt-1">Contact your Superadmin to enable this permission.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Newspaper className="h-6 w-6 text-primary" /> Current Affairs
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Post current affairs entries. They will appear for students after Superadmin approval.
                </p>
            </div>

            <Tabs defaultValue="editor">
                <TabsList>
                    <TabsTrigger value="editor">
                        ✍️ New Entry {editingId && <Badge className="ml-1 text-[10px] bg-amber-100 text-amber-700 border-0">Editing Draft</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="my-entries">📰 My Entries ({myItems.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-4">
                    <Card>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <Label>Headline *</Label>
                                <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. RBI raises repo rate by 25 basis points" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Topic</Label>
                                    <Select value={topic} onValueChange={setTopic}>
                                        <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                                        <SelectContent>
                                            {TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Event Date</Label>
                                    <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Source URL</Label>
                                    <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://…" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Details / Context *</Label>
                                <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Explain the event, its significance, key facts…" rows={8} />
                                <p className="text-xs text-muted-foreground text-right">{body.length} chars</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                                💡 <strong>Tip:</strong> Include key facts, one-liners, and MCQ-relevant details. Superadmin will review before publishing.
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button variant="outline" onClick={saveDraft} className="gap-2 flex-1">
                                    <Save className="h-4 w-4" /> {editingId ? 'Update Draft' : 'Save as Draft'}
                                </Button>
                                <Button onClick={() => setSubmitConfirm(true)} className="gap-2 flex-1">
                                    <Send className="h-4 w-4" /> Submit for Approval
                                </Button>
                                {editingId && <Button variant="ghost" onClick={resetForm} className="text-xs">Cancel</Button>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="my-entries" className="mt-4 space-y-3">
                    {myItems.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-muted-foreground">No entries yet. Create your first one!</p>
                        </div>
                    ) : myItems.slice().reverse().map(item => (
                        <Card key={item.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-medium text-sm">{item.title}</h3>
                                            <Badge className={`text-[10px] capitalize ${item.status === 'approved' ? 'bg-green-100 text-green-700 border-0' :
                                                    item.status === 'pending_approval' ? 'bg-amber-100 text-amber-700 border-0' :
                                                        item.status === 'rejected' ? 'bg-red-100 text-red-700 border-0' : 'bg-gray-100 text-gray-600 border-0'
                                                }`}>{item.status.replace('_', ' ')}</Badge>
                                            {item.metadata?.topic && <Badge variant="outline" className="text-[10px]">{item.metadata.topic as string}</Badge>}
                                        </div>
                                        {item.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.body}</p>}
                                        {item.status === 'rejected' && item.rejectionReason && (
                                            <p className="text-xs text-red-600 mt-1">❌ {item.rejectionReason}</p>
                                        )}
                                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                                {item.status === 'draft' && (
                                    <div className="flex gap-2 mt-2 pt-2 border-t">
                                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => loadForEdit(item.id)}>
                                            <Eye className="h-3 w-3" /> Edit Draft
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => deleteOwnDraft(item.id, employeeId)}>
                                            Delete Draft
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>

            <AlertDialog open={submitConfirm} onOpenChange={setSubmitConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit for Approval?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "<strong>{headline}</strong>" will be sent to Superadmin for review. You won't be able to edit it once submitted.
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

export default CreateCurrentAffairs;
