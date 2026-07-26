import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useGlobalLeaderboard() {
  return useQuery({
    queryKey: ['globalLeaderboard'],
    queryFn: () => api.getGlobalLeaderboard(),
  });
}

export function useQuizLeaderboard(quizId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['quizLeaderboard', quizId],
    queryFn: () => api.getQuizLeaderboard(quizId!),
    enabled: enabled && !!quizId,
  });
}
