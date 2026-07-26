import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CoursePayload } from '@/lib/api';

export function useCourses(params?: { category?: string; instructor?: string; search?: string }) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => api.getCourses({ ...params, limit: 50 }),
    select: (data) => data.courses,
  });
}

export function useCourse(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => api.getCourse(id!),
    enabled: enabled && !!id,
  });
}

export function useCourseCategories() {
  return useQuery({
    queryKey: ['courseCategories'],
    queryFn: () => api.getCourseCategories(),
  });
}

export function useEnrolledCourses() {
  return useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: () => api.getEnrolledCourses(),
  });
}

export function useEnrollInCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => api.enrollInCourse(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrolledCourses'] });
    },
  });
}

export function useCourseSubjects(courseId: string | undefined) {
  return useQuery({
    queryKey: ['courseSubjects', courseId],
    queryFn: () => api.getCourse(courseId!),
    select: (data) => data.subjects || [],
    enabled: !!courseId,
  });
}
