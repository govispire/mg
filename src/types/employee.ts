
export type EmployeeCategory = 
  | 'subject-matter-expert'
  | 'content-creator' 
  | 'test-developer'
  | 'quality-reviewer'
  | 'content-moderator'
  | 'technical-support'
  | 'regional-coordinator';

export type EmployeeSpecialization = 
  | 'mathematics'
  | 'english'
  | 'reasoning'
  | 'general-knowledge'
  | 'current-affairs'
  | 'banking'
  | 'ssc'
  | 'railway'
  | 'state-psc'
  | 'upsc'
  | 'technical'
  | 'regional-management'
  | 'quality-assurance'
  | 'system-administration';

export type EmployeePermission = 
  | 'create-questions'
  | 'edit-questions'
  | 'delete-questions'
  | 'approve-content'
  | 'reject-content'
  | 'manage-tests'
  | 'upload-materials'
  | 'moderate-forum'
  | 'view-analytics'
  | 'manage-users'
  | 'coordinate-region'
  | 'assign-tasks'
  | 'monitor-performance'
  | 'system-maintenance';

export interface EmployeeCategoryConfig {
  id: EmployeeCategory;
  name: string;
  description: string;
  permissions: EmployeePermission[];
  requiredFields: string[];
  dashboardSections: string[];
  workflowSteps: string[];
  priority: 'high' | 'medium' | 'low';
  selectionCriteria: {
    minExperience?: number;
    requiredCertifications?: string[];
    performanceThreshold?: number;
    workloadCapacity?: number;
  };
}

export interface CategorizedEmployee {
  id: string;
  name: string;
  email: string;
  category: EmployeeCategory;
  specializations: EmployeeSpecialization[];
  permissions: EmployeePermission[];
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
  workload: number;
  performance: {
    completedTasks: number;
    accuracy: number;
    rating: number;
  };
  categorySpecific?: {
    expertise?: string[];
    certifications?: string[];
    experience?: number;
    languages?: string[];
    region?: string;
    capacity?: number;
  };
  availability: {
    currentCapacity: number;
    maxCapacity: number;
    nextAvailable: string;
  };
}

export interface EmployeeSelectionFilters {
  category?: EmployeeCategory | 'all';
  specialization?: EmployeeSpecialization | 'all';
  minRating?: number;
  maxWorkload?: number;
  availableOnly?: boolean;
  region?: string;
  minExperience?: number;
}

export interface TaskAssignment {
  id: string;
  title: string;
  type: 'content-creation' | 'review' | 'test-development' | 'moderation' | 'coordination';
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  deadline: string;
  requiredSkills: EmployeeSpecialization[];
  assignedTo?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
}
