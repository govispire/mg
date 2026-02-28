import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, FileText, Newspaper, Calendar, CheckSquare, Clock,
  CheckCircle2, XCircle, TrendingUp, Lock,
} from 'lucide-react';
import { useCurrentEmployeePermissions, useContentItems } from '@/hooks/useEmployeePermissions';
import { useExamCatalog } from '@/hooks/useExamCatalog';

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const permissions = useCurrentEmployeePermissions();
  const { items } = useContentItems();
  const { catalog } = useExamCatalog();

  const employeeId = permissions?.id || 'unknown';
  const myItems = items.filter(i => i.employeeId === employeeId);

  const stats = useMemo(() => ({
    total: myItems.length,
    drafts: myItems.filter(i => i.status === 'draft').length,
    pending: myItems.filter(i => i.status === 'pending_approval').length,
    approved: myItems.filter(i => i.status === 'approved').length,
    rejected: myItems.filter(i => i.status === 'rejected').length,
    questions: myItems.filter(i => i.type === 'question').length,
    tests: myItems.filter(i => i.type === 'test').length,
    blogs: myItems.filter(i => i.type === 'blog').length,
    currentAffairs: myItems.filter(i => i.type === 'current_affairs').length,
  }), [myItems]);

  const assignedCategoryNames = permissions?.assignedCategories.map(cid =>
    catalog.find(c => c.id === cid)?.name || cid
  ) || [];

  const quickActions = [
    { label: 'Upload Questions', icon: CheckSquare, path: '/employee/upload-questions', enabled: permissions?.canUploadQuestions, color: 'bg-blue-50 text-blue-600' },
    { label: 'Create Tests', icon: FileText, path: '/employee/preview-tests', enabled: permissions?.canCreateTests, color: 'bg-purple-50 text-purple-600' },
    { label: 'Write Blog', icon: FileText, path: '/employee/create-blog', enabled: permissions?.canWriteBlogs, color: 'bg-orange-50 text-orange-600' },
    { label: 'Current Affairs', icon: Newspaper, path: '/employee/create-current-affairs', enabled: permissions?.canCreateCurrentAffairs, color: 'bg-green-50 text-green-600' },
    { label: 'Calendar', icon: Calendar, path: '/employee/calendar', enabled: true, color: 'bg-teal-50 text-teal-600' },
  ];

  const recent = myItems.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {permissions?.name || 'Employee'} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your assigned scope: <strong>{assignedCategoryNames.length === 0 ? 'No categories assigned' : assignedCategoryNames.join(', ')}</strong>
          </p>
        </div>
        <Badge variant={permissions?.isActive ? 'default' : 'destructive'} className="text-sm px-3 py-1">
          {permissions?.isActive === false ? '⛔ Inactive' : '🟢 Active'}
        </Badge>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground uppercase">Total Uploads</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-muted-foreground uppercase">Pending Review</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs text-muted-foreground uppercase">Approved</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-xs text-muted-foreground uppercase">Rejected</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {quickActions.map(action => (
            <button
              key={action.label}
              disabled={!action.enabled}
              onClick={() => action.enabled && navigate(action.path)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium
                ${action.enabled
                  ? `${action.color} border-transparent hover:scale-105 hover:shadow-md cursor-pointer`
                  : 'border-dashed border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
            >
              {action.enabled
                ? <action.icon className="h-6 w-6" />
                : <Lock className="h-5 w-5" />
              }
              <span className="text-xs text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
        {quickActions.some(a => !a.enabled) && (
          <p className="text-xs text-muted-foreground mt-2">
            🔒 Locked actions require permission from your Superadmin.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> My Content Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Questions', count: stats.questions, icon: CheckSquare, color: 'text-blue-600' },
              { label: 'Tests', count: stats.tests, icon: FileText, color: 'text-purple-600' },
              { label: 'Blogs', count: stats.blogs, icon: FileText, color: 'text-orange-600' },
              { label: 'Current Affairs', count: stats.currentAffairs, icon: Newspaper, color: 'text-green-600' },
            ].map(({ label, count, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm">{label}</span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity yet. Start uploading!</p>
            ) : (
              <div className="space-y-2">
                {recent.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    {item.status === 'approved' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                    {item.status === 'pending_approval' && <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                    {item.status === 'rejected' && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                    {item.status === 'draft' && <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
                    <span className="flex-1 line-clamp-1 text-xs">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 capitalize">{item.type.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Permissions Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">My Permissions & Scope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Feature Permissions</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Upload Questions', key: 'canUploadQuestions' },
                { label: 'Create Tests', key: 'canCreateTests' },
                { label: 'Write Blogs', key: 'canWriteBlogs' },
                { label: 'Current Affairs', key: 'canCreateCurrentAffairs' },
                { label: 'Schedule Tests', key: 'canScheduleTests' },
              ].map(({ label, key }) => (
                <Badge
                  key={key}
                  className={permissions?.[key as keyof typeof permissions]
                    ? 'bg-green-100 text-green-700 border-0'
                    : 'bg-gray-100 text-gray-400 border-0'
                  }
                >
                  {permissions?.[key as keyof typeof permissions] ? '✅' : '🔒'} {label}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Assigned Exam Categories</p>
            <div className="flex flex-wrap gap-1">
              {assignedCategoryNames.length === 0
                ? <span className="text-xs text-gray-400">No categories assigned</span>
                : assignedCategoryNames.map(name => (
                  <Badge key={name} variant="outline" className="text-xs">{name}</Badge>
                ))}
            </div>
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">
            🔒 All uploaded content goes to Superadmin for approval. Employees cannot delete approved content.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
