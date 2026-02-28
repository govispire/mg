import { useState, useEffect, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────

export type ContentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export interface EmployeePermissions {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
    createdBy: 'superadmin' | 'owner';
    isActive: boolean;

    // ── Exam Scope ──────────────────────────────────────────────────────────
    assignedCategories: string[]; // category IDs e.g. ['banking', 'ssc']
    assignedExams: string[];      // exam IDs e.g. ['sbi-po', 'ibps-clerk']

    // ── Feature Permissions ─────────────────────────────────────────────────
    canUploadQuestions: boolean;
    canCreateTests: boolean;
    canWriteBlogs: boolean;
    canCreateCurrentAffairs: boolean;
    canScheduleTests: boolean;

    // ── Always fixed for employees ──────────────────────────────────────────
    // canDelete: always false — superadmin only
    // canEditDrafts: always true
}

export interface ContentItem {
    id: string;
    type: 'question' | 'test' | 'blog' | 'current_affairs';
    title: string;
    body?: string;
    status: ContentStatus;
    employeeId: string;
    employeeName: string;
    categoryId?: string;
    examId?: string;
    createdAt: string;
    updatedAt: string;
    rejectionReason?: string;
    approvedAt?: string;
    approvedBy?: string;
    scheduledAt?: string;
    // Additional metadata
    metadata?: Record<string, unknown>;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const EMPLOYEES_KEY = 'employee_permissions_list';
const CONTENT_KEY = 'employee_content_items';
const CHANNEL_NAME = 'employee_permissions_channel';

// ─── Hook: Employee List (Superadmin/Owner side) ────────────────────────────

export const useEmployeeList = () => {
    const [employees, setEmployees] = useState<EmployeePermissions[]>([]);

    useEffect(() => {
        const load = () => {
            try {
                const raw = localStorage.getItem(EMPLOYEES_KEY);
                setEmployees(raw ? JSON.parse(raw) : []);
            } catch {
                setEmployees([]);
            }
        };
        load();

        // Cross-tab sync
        let channel: BroadcastChannel | null = null;
        try {
            channel = new BroadcastChannel(CHANNEL_NAME);
            channel.onmessage = (e) => {
                if (e.data?.type === 'employees_updated') setEmployees(e.data.data);
            };
        } catch { /* not supported */ }

        return () => { channel?.close(); };
    }, []);

    const saveAndBroadcast = useCallback((next: EmployeePermissions[]) => {
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(next));
        try {
            const ch = new BroadcastChannel(CHANNEL_NAME);
            ch.postMessage({ type: 'employees_updated', data: next });
            ch.close();
        } catch { /* not supported */ }
    }, []);

    const addEmployee = useCallback((emp: Omit<EmployeePermissions, 'id' | 'createdAt'>) => {
        setEmployees(prev => {
            const next = [...prev, {
                ...emp,
                id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                createdAt: new Date().toISOString(),
            }];
            setTimeout(() => saveAndBroadcast(next), 0);
            return next;
        });
    }, [saveAndBroadcast]);

    const updateEmployee = useCallback((id: string, updates: Partial<EmployeePermissions>) => {
        setEmployees(prev => {
            const next = prev.map(e => e.id === id ? { ...e, ...updates } : e);
            setTimeout(() => saveAndBroadcast(next), 0);
            return next;
        });
    }, [saveAndBroadcast]);

    const removeEmployee = useCallback((id: string) => {
        setEmployees(prev => {
            const next = prev.filter(e => e.id !== id);
            setTimeout(() => saveAndBroadcast(next), 0);
            return next;
        });
    }, [saveAndBroadcast]);

    const toggleEmployeeActive = useCallback((id: string) => {
        setEmployees(prev => {
            const next = prev.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e);
            setTimeout(() => saveAndBroadcast(next), 0);
            return next;
        });
    }, [saveAndBroadcast]);

    return { employees, addEmployee, updateEmployee, removeEmployee, toggleEmployeeActive };
};

// ─── Hook: Content Items (upload/approval workflow) ─────────────────────────

export const useContentItems = () => {
    const [items, setItems] = useState<ContentItem[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CONTENT_KEY);
            setItems(raw ? JSON.parse(raw) : []);
        } catch {
            setItems([]);
        }
    }, []);

    const persist = useCallback((next: ContentItem[]) => {
        localStorage.setItem(CONTENT_KEY, JSON.stringify(next));
    }, []);

    const addItem = useCallback((item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        setItems(prev => {
            const next = [...prev, {
                ...item,
                id: `content_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }];
            setTimeout(() => persist(next), 0);
            return next;
        });
    }, [persist]);

    const updateItem = useCallback((id: string, updates: Partial<ContentItem>) => {
        setItems(prev => {
            const next = prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i);
            setTimeout(() => persist(next), 0);
            return next;
        });
    }, [persist]);

    const approveItem = useCallback((id: string, approverName: string) => {
        setItems(prev => {
            const next = prev.map(i => i.id === id ? {
                ...i,
                status: 'approved' as ContentStatus,
                approvedAt: new Date().toISOString(),
                approvedBy: approverName,
                updatedAt: new Date().toISOString(),
            } : i);
            setTimeout(() => persist(next), 0);
            return next;
        });
    }, [persist]);

    const rejectItem = useCallback((id: string, reason: string) => {
        setItems(prev => {
            const next = prev.map(i => i.id === id ? {
                ...i,
                status: 'rejected' as ContentStatus,
                rejectionReason: reason,
                updatedAt: new Date().toISOString(),
            } : i);
            setTimeout(() => persist(next), 0);
            return next;
        });
    }, [persist]);

    // Employees can only delete their own drafts
    const deleteOwnDraft = useCallback((id: string, employeeId: string) => {
        setItems(prev => {
            const item = prev.find(i => i.id === id);
            if (!item || item.employeeId !== employeeId || item.status !== 'draft') return prev;
            const next = prev.filter(i => i.id !== id);
            setTimeout(() => persist(next), 0);
            return next;
        });
    }, [persist]);

    const pendingItems = items.filter(i => i.status === 'pending_approval');
    const pendingCount = pendingItems.length;

    return { items, addItem, updateItem, approveItem, rejectItem, deleteOwnDraft, pendingItems, pendingCount };
};

// ─── Hook: Current Employee Permissions (Employee side) ─────────────────────
// In a real app this would come from a JWT/session.
// For MVP, we read by email stored in localStorage as the "logged in" employee.

export const useCurrentEmployeePermissions = (): EmployeePermissions | null => {
    const [permissions, setPermissions] = useState<EmployeePermissions | null>(null);

    useEffect(() => {
        try {
            // The auth system stores: { role: 'employee', email: '...' }
            const authRaw = localStorage.getItem('user') || localStorage.getItem('auth_user') || '{}';
            const auth = JSON.parse(authRaw);
            const email = auth?.email;
            if (!email) return;

            const empRaw = localStorage.getItem(EMPLOYEES_KEY);
            const employees: EmployeePermissions[] = empRaw ? JSON.parse(empRaw) : [];
            const found = employees.find(e => e.email === email && e.isActive);
            setPermissions(found ?? null);
        } catch {
            setPermissions(null);
        }
    }, []);

    return permissions;
};
