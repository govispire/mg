import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CurrentAffairsPayload } from '@/lib/api';

export function useArticles(params?: { category?: string; topic?: string; publish_type?: string; search?: string }) {
  return useQuery({
    queryKey: ['currentAffairs', params],
    queryFn: () => api.getCurrentAffairs({ ...params, limit: 100 }),
    select: (data) => data.articles,
  });
}

export function useArticleTopics() {
  return useQuery({
    queryKey: ['currentAffairsTopics'],
    queryFn: () => api.getCurrentAffairsTopics(),
  });
}

export function useArticle(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['currentAffairsArticle', id],
    queryFn: () => api.getCurrentAffairsArticle(id!),
    enabled: enabled && !!id,
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.createCurrentAffairsArticle(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentAffairs'] }),
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.updateCurrentAffairsArticle(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentAffairs'] }),
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCurrentAffairsArticle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentAffairs'] }),
  });
}
