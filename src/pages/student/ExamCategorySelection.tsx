import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Users, BookOpen, Filter, Package } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExamCategorySelection } from '@/hooks/useExamCategorySelection';
import { useExamCategoryContext } from '@/app/providers';

type FilterType = 'all' | 'regular' | 'combo';

interface BaseCategory {
  id: string;
  name: string;
  description: string;
  logo: string;
  studentsEnrolled: number;
  examsAvailable: number;
  mentorsAvailable: number;
  isCombo: boolean;
  isPopular: boolean;
}

interface RegularCategory extends BaseCategory {
  isCombo: false;
}

interface ComboCategory extends BaseCategory {
  isCombo: true;
  price: string;
  originalPrice: string;
}

type ExamCategory = RegularCategory | ComboCategory;

// Regular exam categories based on your provided data
const regularCategories: RegularCategory[] = [
  {
    id: 'jaiib-caiib',
    name: 'JAIIB/CAIIB',
    description: 'JAIIB, CAIIB, Bank Promotion Exams',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jaiib_stprpj.png',
    studentsEnrolled: 8250,
    examsAvailable: 12,
    mentorsAvailable: 56,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'ssc',
    name: 'SSC',
    description: 'CGL, CHSL, CPO, MTS, Steno & More',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    studentsEnrolled: 24680,
    examsAvailable: 15,
    mentorsAvailable: 124,
    isCombo: false,
    isPopular: true
  },
  {
    id: 'railways-rrb',
    name: 'Railways RRB',
    description: 'NTPC, JE, ALP, Group D',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    studentsEnrolled: 18750,
    examsAvailable: 8,
    mentorsAvailable: 76,
    isCombo: false,
    isPopular: true
  },
  {
    id: 'civil-services',
    name: 'Civil Services',
    description: 'UPSC, BPSC, TNPSC, UPPSC',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    studentsEnrolled: 16800,
    examsAvailable: 10,
    mentorsAvailable: 138,
    isCombo: false,
    isPopular: true
  },
  {
    id: 'regulatory',
    name: 'Regulatory',
    description: 'RBI, NABARD, SEBI, IRDAI, SIDBI',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
    studentsEnrolled: 6300,
    examsAvailable: 6,
    mentorsAvailable: 45,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'ugc-net-ctet',
    name: 'UGC NET & CTET',
    description: 'UGC NET, CTET & Teaching Exams',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/ctet_neqteo.jpg',
    studentsEnrolled: 11280,
    examsAvailable: 8,
    mentorsAvailable: 93,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'agriculture-exams',
    name: 'Agriculture Exams',
    description: 'IBPS SO Agri, DSSSB, ICAR, BoM AFO',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/icar1_dwazuz.jpg',
    studentsEnrolled: 4800,
    examsAvailable: 5,
    mentorsAvailable: 32,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'mba-entrance',
    name: 'MBA Entrance',
    description: 'CAT, XAT, NMAT, SNAP, CMAT',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png',
    studentsEnrolled: 9400,
    examsAvailable: 7,
    mentorsAvailable: 67,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'jk-ladakh-exams',
    name: 'J&K + Ladakh Exams',
    description: 'JK Bank, JKSSB, Panchayat',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jkssb1_cyoig9.jpg',
    studentsEnrolled: 5800,
    examsAvailable: 4,
    mentorsAvailable: 38,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'judiciary-exams',
    name: 'Judiciary Exams',
    description: 'Rajasthan, Haryana, Delhi, UP, MP',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062062/judi_ev3new.png',
    studentsEnrolled: 5200,
    examsAvailable: 6,
    mentorsAvailable: 42,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'uttar-pradesh-exams',
    name: 'Uttar Pradesh Exams',
    description: 'UP Police, Constable, SI',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744179613/Railway_Protection_Force_Logo_i5egw0.png',
    studentsEnrolled: 9200,
    examsAvailable: 5,
    mentorsAvailable: 52,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'banking',
    name: 'Banking',
    description: 'IBPS, SBI, RBI and other banking exams',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    studentsEnrolled: 15420,
    examsAvailable: 12,
    mentorsAvailable: 89,
    isCombo: false,
    isPopular: true
  },
  {
    id: 'upsc-epfo',
    name: 'UPSC EPFO',
    description: 'EO/AO, APFC, SSA',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/epfo_hkczjj.jpg',
    studentsEnrolled: 4200,
    examsAvailable: 3,
    mentorsAvailable: 35,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'karnataka-exams',
    name: 'Karnataka Exams',
    description: 'PSI, PWD, KAS',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/karn1_xl4tco.jpg',
    studentsEnrolled: 7600,
    examsAvailable: 4,
    mentorsAvailable: 45,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'tamil-nadu-exams',
    name: 'Tamil Nadu Exams',
    description: 'TNPSC Group 2, 4, VAO, TNUSRB SI',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061570/png-transparent-government-of-tamil-nadu-seal-of-tamil-nadu-tamil-nadu-legislative-assembly-state-emblem-of-india-others-miscellaneous-emblem-food-thumbnail_sy4peu.png',
    studentsEnrolled: 8960,
    examsAvailable: 6,
    mentorsAvailable: 67,
    isCombo: false,
    isPopular: false
  },
  {
    id: 'bihar-exams',
    name: 'Bihar Exams',
    description: 'BPSC, Police, State Exams',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062062/biharpol_dpbgss.jpg',
    studentsEnrolled: 6800,
    examsAvailable: 4,
    mentorsAvailable: 41,
    isCombo: false,
    isPopular: false
  }
];

// Combo categories based on your provided data
const comboCategories: ComboCategory[] = [
  {
    id: 'banking-ssc-railway-combo',
    name: 'Banking + SSC + Railway',
    description: 'Combined prep for all major govt exams',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    studentsEnrolled: 22500,
    examsAvailable: 35,
    mentorsAvailable: 180,
    isCombo: true,
    isPopular: true,
    price: '₹8,999',
    originalPrice: '₹15,997'
  },
  {
    id: 'ssc-railway-combo',
    name: 'SSC + Railway',
    description: 'Optimized prep for both exam types',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    studentsEnrolled: 28700,
    examsAvailable: 23,
    mentorsAvailable: 160,
    isCombo: true,
    isPopular: true,
    price: '₹5,999',
    originalPrice: '₹9,998'
  },
  {
    id: 'upsc-tnpsc-combo',
    name: 'UPSC + TNPSC',
    description: 'National and TN state civil services',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    studentsEnrolled: 14200,
    examsAvailable: 16,
    mentorsAvailable: 125,
    isCombo: true,
    isPopular: false,
    price: '₹7,499',
    originalPrice: '₹12,998'
  },
  {
    id: 'ssc-railway-defence-combo',
    name: 'SSC + Railway + Defence',
    description: 'Govt & defense services combined',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    studentsEnrolled: 19600,
    examsAvailable: 30,
    mentorsAvailable: 175,
    isCombo: true,
    isPopular: true,
    price: '₹6,999',
    originalPrice: '₹11,997'
  }
];

const allCategories: ExamCategory[] = [...regularCategories, ...comboCategories];

const ExamCategorySelection = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const navigate = useNavigate();
  const location = useLocation();
  const { hasCompletedSelection, saveSelection, getSelectedCategories } = useExamCategorySelection();
  const { setSelectedCategories: setGlobalCategories } = useExamCategoryContext();

  const memoizedHasCompleted = useCallback(() => hasCompletedSelection(), [hasCompletedSelection]);
  const memoizedGetCategories = useCallback(() => getSelectedCategories(), [getSelectedCategories]);

  useEffect(() => {
    console.log('Checking exam category selection status...');
    
    const checkSelection = setTimeout(() => {
      const isCompleted = memoizedHasCompleted();
      const isComingFromProfile = location.state?.fromProfile;
      
      console.log('Selection completed:', isCompleted, 'From profile:', isComingFromProfile);
      
      if (isCompleted && !isComingFromProfile) {
        console.log('Exam category selection already completed, redirecting...');
        navigate('/student/tests');
      } else {
        const previouslySelected = memoizedGetCategories();
        console.log('Previously selected exam categories:', previouslySelected);
        setSelectedCategories(previouslySelected);
      }
    }, 100);

    return () => clearTimeout(checkSelection);
  }, [memoizedHasCompleted, memoizedGetCategories, navigate, location.state]);

  const filteredCategories = allCategories.filter(category => {
    if (filter === 'regular') return !category.isCombo;
    if (filter === 'combo') return category.isCombo;
    return true;
  });

  const toggleCategory = (categoryId: string) => {
    console.log('Toggling exam category:', categoryId);
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleProceed = () => {
    console.log('Proceeding with exam categories:', selectedCategories);
    if (selectedCategories.length > 0) {
      // Save to local storage for exam category selection hook
      saveSelection(selectedCategories);
      // Also update global context for immediate use
      setGlobalCategories(selectedCategories);
      setTimeout(() => {
        navigate('/student/tests');
      }, 100);
    }
  };

  const totalStudents = filteredCategories.reduce((sum, cat) => sum + cat.studentsEnrolled, 0);
  const totalExams = filteredCategories.reduce((sum, cat) => sum + cat.examsAvailable, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile-optimized header */}
      <div className="bg-white border-b px-3 sm:px-4 py-3 sm:py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/student/dashboard')}
            className="text-sm sm:text-base font-medium"
          >
            ← Back to Dashboard
          </Button>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
            P
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Choose Your Exam Categories
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Select the exam categories you want to prepare for. Access comprehensive test series and practice materials for your chosen categories.
          </p>
        </div>

        {/* Statistics - Mobile Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="text-center">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{totalStudents.toLocaleString()}</div>
              <p className="text-sm sm:text-base text-gray-600">Students Enrolled</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{totalExams}</div>
              <p className="text-sm sm:text-base text-gray-600">Exams Available</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-2xl font-bold text-purple-600 mb-2">1,654+</div>
              <p className="text-sm sm:text-base text-gray-600">Expert Mentors</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Updated labels */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-0 justify-center">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4"
          >
            <Filter size={14} />
            All ({allCategories.length})
          </Button>
          <Button
            variant={filter === 'regular' ? 'default' : 'outline'}
            onClick={() => setFilter('regular')}
            className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4"
          >
            <BookOpen size={14} />
            Regular Exams ({regularCategories.length})
          </Button>
          <Button
            variant={filter === 'combo' ? 'default' : 'outline'}
            onClick={() => setFilter('combo')}
            className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4"
          >
            <Package size={14} />
            Combo Exams ({comboCategories.length})
          </Button>
        </div>

        {/* Categories Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 px-2 sm:px-0">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] touch-manipulation ${
                selectedCategories.includes(category.id)
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={category.logo}
                      alt={category.name}
                      className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg leading-tight">{category.name}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {category.isPopular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                        {category.isCombo && (
                          <Badge variant="default" className="text-xs bg-purple-600">
                            Combo Pack
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedCategories.includes(category.id) && (
                    <div className="bg-blue-500 text-white rounded-full p-1 flex-shrink-0">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
                
                {/* Combo pack pricing */}
                {category.isCombo && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">{category.price}</span>
                      <span className="text-sm text-gray-500 line-through">{category.originalPrice}</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">Special Combo Offer!</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Students:</span>
                    <span className="font-medium">{category.studentsEnrolled.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Exams:</span>
                    <span className="font-medium">{category.examsAvailable}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Mentors:</span>
                    <span className="font-medium">{category.mentorsAvailable}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Proceed Button - Mobile Responsive */}
        {selectedCategories.length > 0 && (
          <div className="text-center px-4 pb-4">
            <Button
              onClick={handleProceed}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto min-w-[280px]"
            >
              Proceed with {selectedCategories.length} {selectedCategories.length === 1 ? 'Category' : 'Categories'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCategorySelection;
