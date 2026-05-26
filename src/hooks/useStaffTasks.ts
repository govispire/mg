// src/hooks/useStaffTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { StaffTask, StaffTaskLog, TaskSummary, TaskStatus, TaskPriority } from '@/types/roles';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  const raw = localStorage.getItem('auth');
  if (!raw) return null;
  try { return JSON.parse(raw)?.token || null; } catch { return null; }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  assigned_to?: number;
  date_filter?: 'today' | 'this_week' | 'overdue';
}

export function useStaffTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [summary, setSummary] = useState<TaskSummary>({ total: 0, assigned: 0, in_progress: 0, completed: 0, blocked: 0, overdue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status)      params.set('status', filters.status);
      if (filters.priority)    params.set('priority', filters.priority);
      if (filters.category)    params.set('category', filters.category);
      if (filters.assigned_to) params.set('assigned_to', String(filters.assigned_to));
      if (filters.date_filter) params.set('date_filter', filters.date_filter);

      const res = await fetch(`${API}/api/staff-tasks?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load tasks');
      const data = await res.json();
      setTasks(data.tasks);
      setSummary(data.summary);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.priority, filters.category, filters.assigned_to, filters.date_filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const assignTask = useCallback(async (payload: {
    title: string;
    description?: string;
    assigned_to: number;
    category?: string;
    priority?: TaskPriority;
    due_date?: string;
  }) => {
    const res = await fetch(`${API}/api/staff-tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to assign task');
    const task = await res.json();
    setTasks(prev => [task, ...prev]);
    setSummary(prev => ({ ...prev, total: prev.total + 1, assigned: prev.assigned + 1 }));
    return task;
  }, []);

  const updateStatus = useCallback(async (taskId: number, status: TaskStatus, comment?: string, proof_url?: string, extension_reason?: string) => {
    const res = await fetch(`${API}/api/staff-tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status, comment, proof_url, extension_reason }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update status');
    const updated = await res.json();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updated } : t));
    return updated;
  }, []);

  const addComment = useCallback(async (taskId: number, comment: string): Promise<StaffTaskLog> => {
    const res = await fetch(`${API}/api/staff-tasks/${taskId}/comment`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ comment }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to add comment');
    return res.json();
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    const res = await fetch(`${API}/api/staff-tasks/${taskId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete task');
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSummary(prev => ({ ...prev, total: prev.total - 1 }));
  }, []);

  const getTaskWithLogs = useCallback(async (taskId: number): Promise<{ task: StaffTask; logs: StaffTaskLog[] }> => {
    const res = await fetch(`${API}/api/staff-tasks/${taskId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to load task');
    return res.json();
  }, []);

  return { tasks, summary, isLoading, error, refetch: fetchTasks, assignTask, updateStatus, addComment, deleteTask, getTaskWithLogs };
}

// Hook for performance stats of a specific user
export function useEmployeePerformance(userId: number | null) {
  const [perf, setPerf] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    fetch(`${API}/api/staff-tasks/performance/${userId}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setPerf)
      .finally(() => setIsLoading(false));
  }, [userId]);

  return { perf, isLoading };
}
