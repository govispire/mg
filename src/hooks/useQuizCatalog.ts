import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, QuizBankPayload, QuizBankDetailPayload } from '@/lib/api';

export function useQuizzes(params?: { type?: string; subject?: string; difficulty?: string; search?: string }) {
  return useQuery({
    queryKey: ['quizBank', params],
    queryFn: () => api.getQuizBank({ ...params, limit: 50 }),
    select: (data) => data.quizzes,
  });
}

export function useQuiz(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['quizBankItem', id],
    queryFn: () => api.getQuizBankItem(id!),
    enabled: enabled && !!id,
  });
}

export function useQuizCategories() {
  return useQuery({
    queryKey: ['quizCategories'],
    queryFn: () => api.getQuizCategories(),
  });
}

export function useQuizQuestions(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quizQuestions', quizId],
    queryFn: () => api.getQuizBankItem(quizId!),
    select: (data) => data.questions || [],
    enabled: !!quizId,
  });
}

export function useCreateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.createQuiz(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quizBank'] }),
  });
}

export function useDeleteQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteQuiz(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quizBank'] }),
  });
}
