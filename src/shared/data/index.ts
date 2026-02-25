// Export all shared data files
// Exams
export * from './exams/examData';
export * from './exams/examNotificationData';
// Export mockQuestionsData but rename 'sections' to avoid conflict with examData
export { mockQuestions, sections as mockQuestionSections } from './exams/mockQuestionsData';
export * from './exams/quizQuestionsData';
export * from './exams/testData';
// Export testAnalysisData with renamed ComparisonData interface to avoid conflict
export type { TestAnalysisData, SectionData, TopicData, QuestionData, PerformanceData, AreaAnalysis, SpeedData, Strategy } from './exams/testAnalysisData';
export type { ComparisonData as TestComparisonData } from './exams/testAnalysisData';
export { mockTestAnalysis, generateMockAnalysisData } from './exams/testAnalysisData';
export * from './exams/dailyQuizzesData';
export * from './exams/categoryPerformanceData';
export * from './exams/categorySpeedDrillsData';


// Courses
export * from './courses/courseData';
// Export expandedCourseData but rename getCoursesByCategory to avoid conflict
export { getCoursesByCategory as getExpandedCoursesByCategory } from './courses/expandedCourseData';
export type { CategoryCourse } from './courses/expandedCourseData';
// Export syllabusData with renamed ComparisonData interface to avoid conflict
export type { ComparisonData as SyllabusComparisonData, ExamSyllabusConfig } from './courses/syllabusData';
export { allSyllabusData, categoryExamMapping, getExamsByCategoryForSyllabus, getExamSyllabus, getCategoryName, getComparisonData } from './courses/syllabusData';

export * from './courses/pdfData';

// Blog
export * from './blog/blogsData';

// Geography
export * from './geography/indiaStates';

// Mentorship
export * from './mentorship/mentorshipData';
export * from './mentorship/enhancedMentorshipData';
export * from './mentorship/expandedMentorshipData';

// Current Affairs
export * from './current-affairs/categoryCurrentAffairsData';

// Employee
export * from './employeeCategoryData';
