import { useMemo } from 'react';
import { useExamCategoryContext } from '@/app/providers';
import { getAllMentorsByCategories, getMentorsByCategory } from '@/data/expandedMentorshipData';
import { getCoursesByCategories, getVideosByCategories } from '@/data/expandedCourseData';
import { getCurrentAffairsByCategories, getCurrentAffairsStats } from '@/data/categoryCurrentAffairsData';
import { getSpeedDrillsByCategories, getSpeedDrillsStats } from '@/data/categorySpeedDrillsData';
import { getPerformanceDataByCategories, getAggregatedPerformanceStats } from '@/data/categoryPerformanceData';
import { getExamNotificationsByCategories, getExamNotificationStats } from '@/data/examNotificationData';
import type { Mentor } from '@/data/mentorshipData';
import type { CategoryCourse, CategoryVideo } from '@/data/expandedCourseData';
import type { CategoryCurrentAffair } from '@/data/categoryCurrentAffairsData';
import type { CategorySpeedDrill } from '@/data/categorySpeedDrillsData';
import type { CategoryPerformanceData } from '@/data/categoryPerformanceData';
import type { ExamNotification } from '@/data/examNotificationData';

export const useCategoryFilteredMentors = () => {
  const { selectedCategories } = useExamCategoryContext();

  const filteredMentors = useMemo(() => {
    console.log('Filtering mentors for categories:', selectedCategories);
    return getAllMentorsByCategories(selectedCategories);
  }, [selectedCategories]);

  const getMentorsForCategory = (categoryId: string, limit: number = 10) => {
    return getMentorsByCategory(categoryId, limit);
  };

  return {
    mentors: filteredMentors,
    getMentorsForCategory,
    selectedCategories,
    hasFilters: selectedCategories.length > 0
  };
};

export const useCategoryFilteredCourses = () => {
  const { selectedCategories } = useExamCategoryContext();

  const filteredCourses = useMemo(() => {
    console.log('Filtering courses for categories:', selectedCategories);
    return getCoursesByCategories(selectedCategories);
  }, [selectedCategories]);

  return {
    courses: filteredCourses,
    selectedCategories,
    hasFilters: selectedCategories.length > 0
  };
};

export const useCategoryFilteredVideos = () => {
  const { selectedCategories } = useExamCategoryContext();

  const filteredVideos = useMemo(() => {
    console.log('Filtering videos for categories:', selectedCategories);
    return getVideosByCategories(selectedCategories);
  }, [selectedCategories]);

  const getVideosForCategory = (categoryId: string) => {
    return getVideosByCategories([categoryId]);
  };

  return {
    videos: filteredVideos,
    getVideosForCategory,
    selectedCategories,
    hasFilters: selectedCategories.length > 0
  };
};

export const useCategoryFilteredCurrentAffairs = () => {
  const { selectedCategories } = useExamCategoryContext();

  const filteredCurrentAffairs = useMemo(() => {
    console.log('Filtering current affairs for categories:', selectedCategories);
    return getCurrentAffairsByCategories(selectedCategories);
  }, [selectedCategories]);

  const stats = useMemo(() => {
    return getCurrentAffairsStats(selectedCategories);
  }, [selectedCategories]);

  return {
    currentAffairs: filteredCurrentAffairs,
    stats,
    selectedCategories,
    hasFilters: selectedCategories.length > 0
  };
};

export const useCategoryFilteredSpeedDrills = () => {
  const { selectedCategories } = useExamCategoryContext();

  const filteredSpeedDrills = useMemo(() => {
    console.log('Filtering speed drills for categories:', selectedCategories);
    return getSpeedDrillsByCategories(selectedCategories);
  }, [selectedCategories]);

  const stats = useMemo(() => {
    return getSpeedDrillsStats(selectedCategories);
  }, [selectedCategories]);

  return {
    speedDrills: filteredSpeedDrills,
    stats,
    selectedCategories,
    hasFilters: selectedCategories.length > 0
  };
};

export const useCategoryFilteredPerformance = () => {
  const { selectedCategories } = useExamCategoryContext();

  const filteredPerformanceData = useMemo(() => {
    console.log('Filtering performance data for categories:', selectedCategories);
    return getPerformanceDataByCategories(selectedCategories);
  }, [selectedCategories]);

  const aggregatedStats = useMemo(() => {
    return getAggregatedPerformanceStats(selectedCategories);
  }, [selectedCategories]);

  return {
    performanceData: filteredPerformanceData,
    aggregatedStats,
    selectedCategories,
    hasFilters: selectedCategories.length > 0
  };
};

export const useCategoryFilteredExamNotifications = () => {
  const { selectedCategories } = useExamCategoryContext();

  const filteredExamNotifications = useMemo(() => {
    console.log('Filtering exam notifications for categories:', selectedCategories);
    return getExamNotificationsByCategories(selectedCategories);
  }, [selectedCategories]);

  const stats = useMemo(() => {
    return getExamNotificationStats(selectedCategories);
  }, [selectedCategories]);

  return {
    examNotifications: filteredExamNotifications,
    stats,
    selectedCategories,
    hasFilters: selectedCategories.length > 0
  };
};

export const useDynamicContentStats = () => {
  const { selectedCategories } = useExamCategoryContext();
  const { mentors } = useCategoryFilteredMentors();
  const { courses } = useCategoryFilteredCourses();
  const { videos } = useCategoryFilteredVideos();
  const { currentAffairs } = useCategoryFilteredCurrentAffairs();
  const { speedDrills } = useCategoryFilteredSpeedDrills();
  const { examNotifications } = useCategoryFilteredExamNotifications();

  const stats = useMemo(() => {
    return {
      mentorCount: mentors.length,
      courseCount: courses.length,
      videoCount: videos.length,
      currentAffairsCount: currentAffairs.length,
      speedDrillsCount: speedDrills.length,
      examNotificationsCount: examNotifications.length,
      categoriesSelected: selectedCategories.length,
      watchedVideos: videos.filter(v => v.isWatched).length,
      attemptedDrills: speedDrills.filter(d => d.isAttempted).length,
      upcomingExams: examNotifications.filter(e => e.isUpcoming).length,
      totalDuration: videos.reduce((total, video) => {
        const [minutes, seconds] = video.duration.split(':').map(Number);
        return total + minutes + (seconds / 60);
      }, 0)
    };
  }, [mentors, courses, videos, currentAffairs, speedDrills, examNotifications, selectedCategories]);

  return stats;
};
