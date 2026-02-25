// Re-export all providers for cleaner imports
export { AuthProvider, useAuth } from './AuthProvider';
export { StudentDataProvider, useStudentData } from './StudentDataProvider';
export { ExamCategoryProvider, useExamCategoryContext } from './ExamCategoryProvider';
export { AppProviders } from './AppProviders';
export type { UserRole } from './AuthProvider';
export type { StudentData, StudentAnalytics } from './StudentDataProvider';
