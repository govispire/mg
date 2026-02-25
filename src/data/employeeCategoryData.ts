
import { EmployeeCategoryConfig, CategorizedEmployee } from '@/types/employee';

export const EMPLOYEE_CATEGORIES: EmployeeCategoryConfig[] = [
  {
    id: 'subject-matter-expert',
    name: 'Subject Matter Expert',
    description: 'Experts in specific subjects who create and review high-quality educational content',
    permissions: ['create-questions', 'edit-questions', 'approve-content', 'view-analytics'],
    requiredFields: ['specializations', 'experience', 'certifications'],
    dashboardSections: ['question-creation', 'content-review', 'performance-metrics'],
    workflowSteps: ['content-creation', 'peer-review', 'final-approval'],
    priority: 'high',
    selectionCriteria: {
      minExperience: 5,
      performanceThreshold: 4.5,
      workloadCapacity: 80
    }
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Creates educational materials, courses, and study resources',
    permissions: ['create-questions', 'upload-materials', 'edit-questions'],
    requiredFields: ['specializations', 'languages'],
    dashboardSections: ['content-creation', 'upload-materials', 'pending-reviews'],
    workflowSteps: ['content-creation', 'quality-check', 'submission'],
    priority: 'high',
    selectionCriteria: {
      minExperience: 3,
      performanceThreshold: 4.0,
      workloadCapacity: 70
    }
  },
  {
    id: 'test-developer',
    name: 'Test Developer',
    description: 'Specializes in creating comprehensive tests and assessments',
    permissions: ['create-questions', 'manage-tests', 'edit-questions', 'view-analytics'],
    requiredFields: ['specializations', 'experience'],
    dashboardSections: ['test-creation', 'question-bank', 'test-analytics'],
    workflowSteps: ['test-design', 'question-selection', 'review', 'publication'],
    priority: 'high',
    selectionCriteria: {
      minExperience: 4,
      performanceThreshold: 4.3,
      workloadCapacity: 75
    }
  },
  {
    id: 'quality-reviewer',
    name: 'Quality Reviewer',
    description: 'Reviews and ensures quality of all content before publication',
    permissions: ['approve-content', 'reject-content', 'edit-questions', 'view-analytics'],
    requiredFields: ['experience', 'certifications'],
    dashboardSections: ['review-queue', 'approval-history', 'quality-metrics'],
    workflowSteps: ['content-review', 'feedback', 'approval-decision'],
    priority: 'high',
    selectionCriteria: {
      minExperience: 6,
      performanceThreshold: 4.7,
      workloadCapacity: 85,
      requiredCertifications: ['Quality Assurance Specialist']
    }
  },
  {
    id: 'content-moderator',
    name: 'Content Moderator',
    description: 'Moderates user-generated content and maintains community standards',
    permissions: ['moderate-forum', 'approve-content', 'reject-content'],
    requiredFields: ['languages'],
    dashboardSections: ['moderation-queue', 'user-reports', 'community-stats'],
    workflowSteps: ['content-monitoring', 'violation-review', 'action-taken'],
    priority: 'medium',
    selectionCriteria: {
      minExperience: 2,
      performanceThreshold: 4.0,
      workloadCapacity: 60
    }
  },
  {
    id: 'technical-support',
    name: 'Technical Support',
    description: 'Provides technical assistance and resolves platform issues',
    permissions: ['manage-users', 'view-analytics', 'system-maintenance'],
    requiredFields: ['experience'],
    dashboardSections: ['support-tickets', 'user-management', 'system-health'],
    workflowSteps: ['issue-identification', 'troubleshooting', 'resolution'],
    priority: 'medium',
    selectionCriteria: {
      minExperience: 3,
      performanceThreshold: 4.2,
      workloadCapacity: 65
    }
  },
  {
    id: 'regional-coordinator',
    name: 'Regional Coordinator',
    description: 'Coordinates regional operations and manages local employee teams',
    permissions: ['coordinate-region', 'assign-tasks', 'monitor-performance', 'view-analytics', 'manage-users'],
    requiredFields: ['region', 'experience', 'languages'],
    dashboardSections: ['regional-overview', 'team-management', 'performance-tracking', 'task-assignment'],
    workflowSteps: ['team-coordination', 'task-distribution', 'performance-monitoring', 'reporting'],
    priority: 'high',
    selectionCriteria: {
      minExperience: 7,
      performanceThreshold: 4.6,
      workloadCapacity: 90,
      requiredCertifications: ['Team Management', 'Regional Operations']
    }
  }
];

export const MOCK_CATEGORIZED_EMPLOYEES: CategorizedEmployee[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@example.com',
    category: 'subject-matter-expert',
    specializations: ['mathematics', 'reasoning'],
    permissions: ['create-questions', 'edit-questions', 'approve-content', 'view-analytics'],
    status: 'active',
    joinDate: '2024-01-15',
    lastActive: '2025-06-03',
    workload: 85,
    performance: {
      completedTasks: 245,
      accuracy: 96,
      rating: 4.8
    },
    categorySpecific: {
      expertise: ['Advanced Calculus', 'Statistics', 'Logical Reasoning'],
      certifications: ['Ph.D. Mathematics', 'Educational Content Development'],
      experience: 8,
      languages: ['English', 'Hindi']
    },
    availability: {
      currentCapacity: 85,
      maxCapacity: 100,
      nextAvailable: '2025-06-04'
    }
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@example.com',
    category: 'content-creator',
    specializations: ['english', 'general-knowledge'],
    permissions: ['create-questions', 'upload-materials', 'edit-questions'],
    status: 'active',
    joinDate: '2024-02-20',
    lastActive: '2025-06-03',
    workload: 70,
    performance: {
      completedTasks: 180,
      accuracy: 92,
      rating: 4.5
    },
    categorySpecific: {
      expertise: ['Grammar', 'Vocabulary', 'Current Affairs'],
      experience: 5,
      languages: ['English', 'Hindi', 'Bengali']
    },
    availability: {
      currentCapacity: 70,
      maxCapacity: 100,
      nextAvailable: '2025-06-03'
    }
  },
  {
    id: '3',
    name: 'Anjali Patel',
    email: 'anjali.patel@example.com',
    category: 'test-developer',
    specializations: ['banking', 'current-affairs'],
    permissions: ['create-questions', 'manage-tests', 'edit-questions', 'view-analytics'],
    status: 'active',
    joinDate: '2024-01-10',
    lastActive: '2025-06-02',
    workload: 90,
    performance: {
      completedTasks: 320,
      accuracy: 94,
      rating: 4.7
    },
    categorySpecific: {
      expertise: ['Banking Regulations', 'Financial Markets', 'Economic Policies'],
      certifications: ['Certified Banking Professional', 'Test Development Specialist'],
      experience: 6
    },
    availability: {
      currentCapacity: 90,
      maxCapacity: 100,
      nextAvailable: '2025-06-05'
    }
  },
  {
    id: '4',
    name: 'Suresh Mehta',
    email: 'suresh.mehta@example.com',
    category: 'quality-reviewer',
    specializations: ['ssc', 'railway', 'state-psc'],
    permissions: ['approve-content', 'reject-content', 'edit-questions', 'view-analytics'],
    status: 'active',
    joinDate: '2023-11-05',
    lastActive: '2025-06-03',
    workload: 75,
    performance: {
      completedTasks: 410,
      accuracy: 98,
      rating: 4.9
    },
    categorySpecific: {
      expertise: ['Government Policies', 'Public Administration', 'Constitutional Law'],
      certifications: ['Senior Content Reviewer', 'Quality Assurance Specialist'],
      experience: 10
    },
    availability: {
      currentCapacity: 75,
      maxCapacity: 100,
      nextAvailable: '2025-06-03'
    }
  },
  {
    id: '5',
    name: 'Kavita Singh',
    email: 'kavita.singh@example.com',
    category: 'regional-coordinator',
    specializations: ['regional-management', 'quality-assurance'],
    permissions: ['coordinate-region', 'assign-tasks', 'monitor-performance', 'view-analytics', 'manage-users'],
    status: 'active',
    joinDate: '2023-08-12',
    lastActive: '2025-06-03',
    workload: 88,
    performance: {
      completedTasks: 156,
      accuracy: 97,
      rating: 4.8
    },
    categorySpecific: {
      expertise: ['Team Leadership', 'Regional Operations', 'Performance Management'],
      certifications: ['Team Management', 'Regional Operations', 'PMP Certification'],
      experience: 9,
      languages: ['English', 'Hindi', 'Punjabi'],
      region: 'North India'
    },
    availability: {
      currentCapacity: 88,
      maxCapacity: 100,
      nextAvailable: '2025-06-04'
    }
  },
  {
    id: '6',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@example.com',
    category: 'technical-support',
    specializations: ['technical', 'system-administration'],
    permissions: ['manage-users', 'view-analytics', 'system-maintenance'],
    status: 'active',
    joinDate: '2024-03-15',
    lastActive: '2025-06-03',
    workload: 65,
    performance: {
      completedTasks: 89,
      accuracy: 95,
      rating: 4.4
    },
    categorySpecific: {
      expertise: ['System Administration', 'Database Management', 'Cloud Services'],
      certifications: ['AWS Solutions Architect', 'System Administrator'],
      experience: 4,
      languages: ['English', 'Telugu', 'Hindi']
    },
    availability: {
      currentCapacity: 65,
      maxCapacity: 100,
      nextAvailable: '2025-06-03'
    }
  }
];
