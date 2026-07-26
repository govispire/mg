import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ExamNotificationPayload } from '@/lib/api';

export function useExamNotifications(params?: { category?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['examNotifications', params],
    queryFn: () => api.getExamNotifications({ ...params, limit: 50 }),
    select: (data) => data.notifications,
  });
}

export function useExamNotification(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['examNotification', id],
    queryFn: () => api.getExamNotification(id!),
    enabled: enabled && !!id,
  });
}

export function useUpcomingExams() {
  return useQuery({
    queryKey: ['examNotifications', { status: 'upcoming' }],
    queryFn: () => api.getExamNotifications({ status: 'upcoming', limit: 20 }),
    select: (data) => data.notifications,
  });
}

export function useCreateExamNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.createExamNotification(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examNotifications'] }),
  });
}

export function useUpdateExamNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.updateExamNotification(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examNotifications'] }),
  });
}

export function useDeleteExamNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteExamNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examNotifications'] }),
  });
}
