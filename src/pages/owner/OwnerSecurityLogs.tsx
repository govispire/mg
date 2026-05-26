import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuditLog } from '@/types/roles';
import {
  Shield, Search, RefreshCw, AlertCircle, User, Clock,
  Database, FileText, Users, Settings, CheckCircle2,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function authHeaders() {
  try {
    const token = JSON.parse(localStorage.getItem('auth') || '{}')?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch { return {}; }
}

const ACTION_COLORS: Record<string, string> = {
  'user.create': 'bg-green-100 text-green-700',
  'user.deactivate': 'bg-red-100 text-red-700',
  'user.activate': 'bg-teal-100 text-teal-700',
  'user.edit': 'bg-blue-100 text-blue-700',
  'user.password_reset': 'bg-purple-100 text-purple-700',
  'task.assign': 'bg-amber-100 text-amber-700',
  'task.edit': 'bg-orange-100 text-orange-700',
  'task.delete': 'bg-red-100 text-red-700',
  'content.approve': 'bg-green-100 text-green-700',
  'content.reject': 'bg-red-100 text-red-700',
  'content.archive': 'bg-gray-100 text-gray-700',
};

const RESOURCE_ICONS: Record<string, React.FC<any>> = {
  user: Users,
  task: FileText,
  content: Database,
  settings: Settings,
};

const OwnerSecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('action', search);
      if (resourceFilter) params.set('resource_type', resourceFilter);

      const res = await fetch(`${API}/api/audit-logs?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load logs');
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [search, resourceFilter]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const ResourceIcon = ({ type }: { type: string }) => {
    const Icon = RESOURCE_ICONS[type] || Shield;
    return <Icon className="h-3.5 w-3.5" />;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Security & Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete forensic trail of all platform actions
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="text-xs">
            {total.toLocaleString()} total events
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Forensic-grade audit trail</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Every state-changing action (user creation, content approval, task assignment, deactivation) is permanently recorded here with actor identity, timestamp, and resource details. Records cannot be deleted.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter by action (e.g. user.create)..."
            value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="All Resources" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Resources</SelectItem>
            {['user', 'task', 'content', 'settings'].map(r => (
              <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs table */}
      <Card className="border-border/50">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchLogs}>Retry</Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resource</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">IP</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">{log.actor_name || 'System'}</p>
                          <p className="text-[10px] text-muted-foreground">{log.actor_role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ResourceIcon type={log.resource_type} />
                        <span className="font-medium text-foreground">{log.resource_type}</span>
                        {log.resource_name && <span className="text-muted-foreground">· {log.resource_name}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                      {log.ip_address || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(log.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && logs.length > 0 && (
          <div className="px-4 py-3 border-t border-border/40 text-xs text-muted-foreground">
            Showing {logs.length} of {total} events
          </div>
        )}
      </Card>
    </div>
  );
};

export default OwnerSecurityLogs;
