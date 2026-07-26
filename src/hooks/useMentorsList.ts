import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, MentorPayload, MentorStudentPayload } from '@/lib/api';

export function useMentors(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['mentors', params],
    queryFn: () => api.getMentors(params),
  });
}

export function useMentorStudents(mentorId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['mentorStudents', mentorId],
    queryFn: () => api.getMentorStudents(mentorId!),
    enabled: enabled && !!mentorId,
  });
}

export function useWeakAreas(studentId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['weakAreas', studentId],
    queryFn: () => api.getStudentWeakAreas(studentId!),
    enabled: enabled && !!studentId,
  });
}

export function useAssignMentor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { mentor_id: string; student_id: string; category?: string }) =>
      api.assignMentor(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentors'] });
      qc.invalidateQueries({ queryKey: ['mentorStudents'] });
    },
  });
}

export function useUnassignMentorStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mentorId, studentId }: { mentorId: string; studentId: string }) =>
      api.unassignMentorStudent(mentorId, studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentors'] });
      qc.invalidateQueries({ queryKey: ['mentorStudents'] });
    },
  });
}

export function useStudentRecommendations(studentId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['studentRecommendations', studentId],
    queryFn: () => api.getStudentRecommendations(studentId!),
    enabled: enabled && !!studentId,
  });
}
