// src/hooks/useUserManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { ManagedUser, UserRole, AccountStatus } from '@/types/roles';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function authHeaders() {
  try {
    const token = JSON.parse(localStorage.getItem('auth') || '{}')?.token;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  } catch { return { 'Content-Type': 'application/json' }; }
}

export interface UserFilters {
  role?: UserRole | '';
  status?: AccountStatus | '';
  search?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  department?: string;
  employee_capacity?: number;
}

export function useUserManagement(filters: UserFilters = {}) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.role)   params.set('role', filters.role);
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`${API}/api/admin/users?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load users');
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters.role, filters.status, filters.search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const createUser = useCallback(async (payload: CreateUserPayload): Promise<ManagedUser> => {
    const res = await fetch(`${API}/api/admin/users`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create user');
    const user = await res.json();
    setUsers(prev => [user, ...prev]);
    setTotal(prev => prev + 1);
    return user;
  }, []);

  const deactivateUser = useCallback(async (userId: number): Promise<{ needs_reassignment: boolean; pending_tasks: number; content_items: number }> => {
    const res = await fetch(`${API}/api/admin/users/${userId}/deactivate`, {
      method: 'POST', headers: authHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to deactivate user');
    const data = await res.json();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'inactive' } : u));
    return data;
  }, []);

  const activateUser = useCallback(async (userId: number) => {
    const res = await fetch(`${API}/api/admin/users/${userId}/activate`, {
      method: 'POST', headers: authHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to activate user');
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u));
  }, []);

  const resetPassword = useCallback(async (userId: number, new_password: string) => {
    const res = await fetch(`${API}/api/admin/users/${userId}/reset-password`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ new_password }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to reset password');
  }, []);

  const bulkImport = useCallback(async (students: any[]) => {
    const res = await fetch(`${API}/api/admin/users/bulk-import`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ students }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to import');
    const data = await res.json();
    await fetchUsers();
    return data;
  }, [fetchUsers]);

  const getRoleSummary = useCallback(async () => {
    const res = await fetch(`${API}/api/admin/users/meta/role-summary`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  }, []);

  return { users, total, isLoading, error, refetch: fetchUsers, createUser, deactivateUser, activateUser, resetPassword, bulkImport, getRoleSummary };
}
