import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, MaterialPayload } from '@/lib/api';

export function useMaterials(params?: { type?: string; category?: string; subject?: string; search?: string }) {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => api.getMaterials({ ...params, limit: 50 }),
    select: (data) => data.materials,
  });
}

export function useMaterial(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['material', id],
    queryFn: () => api.getMaterial(id!),
    enabled: enabled && !!id,
  });
}

export function useDownloadMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.downloadMaterial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materials'] }),
  });
}
