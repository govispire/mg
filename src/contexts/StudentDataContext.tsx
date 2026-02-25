
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface StudentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  state: string;
  category: string;
  examType: string;
  registrationDate: Date;
  status: 'active' | 'inactive' | 'pending';
  mentorId?: string;
}

export interface StudentAnalytics {
  totalStudents: number;
  categoryWiseCounts: Record<string, number>;
  stateWiseCounts: Record<string, number>;
  examTypeWiseCounts: Record<string, number>;
  recentRegistrations: StudentData[];
  growthMetrics: {
    dailyGrowth: number;
    weeklyGrowth: number;
    monthlyGrowth: number;
  };
}

interface StudentDataContextType {
  students: StudentData[];
  analytics: StudentAnalytics;
  addStudent: (student: Omit<StudentData, 'id' | 'registrationDate'>) => void;
  updateStudent: (id: string, updates: Partial<StudentData>) => void;
  deleteStudent: (id: string) => void;
  getStudentsByCategory: (category: string) => StudentData[];
  getStudentsByState: (state: string) => StudentData[];
  getStudentsByMentor: (mentorId: string) => StudentData[];
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

export const useStudentData = () => {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error('useStudentData must be used within a StudentDataProvider');
  }
  return context;
};

// Sample initial data
const initialStudents: StudentData[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    state: 'Maharashtra',
    category: 'Banking',
    examType: 'IBPS PO',
    registrationDate: new Date(2024, 11, 1),
    status: 'active',
    mentorId: 'mentor1'
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '+91 98765 43211',
    state: 'Gujarat',
    category: 'SSC',
    examType: 'SSC CGL',
    registrationDate: new Date(2024, 11, 5),
    status: 'active',
    mentorId: 'mentor1'
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit.kumar@email.com',
    phone: '+91 98765 43212',
    state: 'Delhi',
    category: 'UPSC',
    examType: 'UPSC CSE',
    registrationDate: new Date(2024, 11, 10),
    status: 'active',
    mentorId: 'mentor2'
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@email.com',
    phone: '+91 98765 43213',
    state: 'Uttar Pradesh',
    category: 'MBA',
    examType: 'CAT',
    registrationDate: new Date(2024, 11, 15),
    status: 'active',
    mentorId: 'mentor2'
  },
  {
    id: '5',
    name: 'Arjun Singh',
    email: 'arjun.singh@email.com',
    state: 'Rajasthan',
    category: 'Banking',
    examType: 'IBPS Clerk',
    registrationDate: new Date(2024, 11, 20),
    status: 'active'
  },
  {
    id: '6',
    name: 'Kavya Nair',
    email: 'kavya.nair@email.com',
    state: 'Kerala',
    category: 'SSC',
    examType: 'SSC CHSL',
    registrationDate: new Date(2024, 11, 25),
    status: 'pending'
  }
];

// Helper function to convert stored data with proper Date objects
const convertStoredData = (data: any[]): StudentData[] => {
  return data.map(student => ({
    ...student,
    registrationDate: new Date(student.registrationDate)
  }));
};

export const StudentDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<StudentData[]>(() => {
    const stored = localStorage.getItem('studentData');
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        return convertStoredData(parsedData);
      } catch (error) {
        console.error('Error parsing stored student data:', error);
        return initialStudents;
      }
    }
    return initialStudents;
  });

  // Calculate analytics
  const analytics: StudentAnalytics = React.useMemo(() => {
    const totalStudents = students.length;
    const categoryWiseCounts: Record<string, number> = {};
    const stateWiseCounts: Record<string, number> = {};
    const examTypeWiseCounts: Record<string, number> = {};

    students.forEach(student => {
      categoryWiseCounts[student.category] = (categoryWiseCounts[student.category] || 0) + 1;
      stateWiseCounts[student.state] = (stateWiseCounts[student.state] || 0) + 1;
      examTypeWiseCounts[student.examType] = (examTypeWiseCounts[student.examType] || 0) + 1;
    });

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyGrowth = students.filter(s => s.registrationDate >= oneDayAgo).length;
    const weeklyGrowth = students.filter(s => s.registrationDate >= oneWeekAgo).length;
    const monthlyGrowth = students.filter(s => s.registrationDate >= oneMonthAgo).length;

    const recentRegistrations = students
      .sort((a, b) => b.registrationDate.getTime() - a.registrationDate.getTime())
      .slice(0, 5);

    return {
      totalStudents,
      categoryWiseCounts,
      stateWiseCounts,
      examTypeWiseCounts,
      recentRegistrations,
      growthMetrics: {
        dailyGrowth,
        weeklyGrowth,
        monthlyGrowth
      }
    };
  }, [students]);

  // Save to localStorage whenever students change
  useEffect(() => {
    localStorage.setItem('studentData', JSON.stringify(students));
  }, [students]);

  const addStudent = (studentData: Omit<StudentData, 'id' | 'registrationDate'>) => {
    const newStudent: StudentData = {
      ...studentData,
      id: Date.now().toString(),
      registrationDate: new Date(),
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: string, updates: Partial<StudentData>) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, ...updates } : student
    ));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  const getStudentsByCategory = (category: string) => {
    return students.filter(student => student.category === category);
  };

  const getStudentsByState = (state: string) => {
    return students.filter(student => student.state === state);
  };

  const getStudentsByMentor = (mentorId: string) => {
    return students.filter(student => student.mentorId === mentorId);
  };

  return (
    <StudentDataContext.Provider value={{
      students,
      analytics,
      addStudent,
      updateStudent,
      deleteStudent,
      getStudentsByCategory,
      getStudentsByState,
      getStudentsByMentor
    }}>
      {children}
    </StudentDataContext.Provider>
  );
};
