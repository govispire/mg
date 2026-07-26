import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, BlogPayload } from '@/lib/api';

export function useBlogs(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => api.getBlogs({ ...params, limit: 50 }),
    select: (data) => data.blogs,
  });
}

export function useBlog(slug: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => api.getBlog(slug!),
    enabled: enabled && !!slug,
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.createBlog(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.updateBlog(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blogs'] }),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteBlog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blogs'] }),
  });
}
