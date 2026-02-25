
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Plus, Settings, Filter, BookOpen, Package } from 'lucide-react';
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

// Regular exam categories - same as ExamCategorySelection
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

// Combo categories - same as ExamCategorySelection
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

export const CategorySelector: React.FC = () => {
  const { selectedCategories, toggleCategory, setSelectedCategories } = useExamCategoryContext();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredCategories = allCategories.filter(category => {
    if (filter === 'regular') return !category.isCombo;
    if (filter === 'combo') return category.isCombo;
    return true;
  });

  const handleSave = () => {
    setIsOpen(false);
  };

  const selectedCategoryNames = allCategories
    .filter(cat => selectedCategories.includes(cat.id))
    .map(cat => cat.name);

  const getDisplayText = () => {
    if (selectedCategories.length === 0) {
      return 'Select Categories';
    } else if (selectedCategories.length === 1) {
      const category = allCategories.find(cat => cat.id === selectedCategories[0]);
      const categoryName = category ? category.name : 'Category';
      // Truncate long names for mobile view
      return categoryName.length > 15 ? categoryName.substring(0, 15) + '...' : categoryName;
    } else {
      const firstCategory = allCategories.find(cat => cat.id === selectedCategories[0]);
      const firstName = firstCategory ? firstCategory.name : 'Category';
      const additionalCount = selectedCategories.length - 1;

      // Truncate first category name for mobile space
      const truncatedName = firstName.length > 10 ? firstName.substring(0, 10) + '...' : firstName;

      return `${truncatedName} & ${additionalCount} more`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="truncate">
            {getDisplayText()}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl">Select Exam Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Current Selection */}
          {selectedCategories.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm sm:text-base">Selected Categories ({selectedCategories.length})</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {selectedCategoryNames.map(name => (
                  <Badge key={name} variant="default" className="text-xs sm:text-sm px-2 py-1">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex items-center gap-2 justify-center text-xs sm:text-sm h-8 sm:h-9"
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">All ({allCategories.length})</span>
            </Button>
            <Button
              variant={filter === 'regular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('regular')}
              className="flex items-center gap-2 justify-center text-xs sm:text-sm h-8 sm:h-9"
            >
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Regular ({regularCategories.length})</span>
            </Button>
            <Button
              variant={filter === 'combo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('combo')}
              className="flex items-center gap-2 justify-center text-xs sm:text-sm h-8 sm:h-9"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Combo ({comboCategories.length})</span>
            </Button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md touch-manipulation ${selectedCategories.includes(category.id)
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                  }`}
                onClick={() => toggleCategory(category.id)}
              >
                <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <img
                        src={category.logo}
                        alt={category.name}
                        className="h-6 w-6 sm:h-8 sm:w-8 object-contain flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base leading-tight truncate">{category.name}</CardTitle>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {category.isPopular && (
                            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                              Popular
                            </Badge>
                          )}
                          {category.isCombo && (
                            <Badge variant="default" className="text-[10px] sm:text-xs bg-purple-600 px-1.5 py-0.5">
                              Combo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`rounded-full p-1 flex-shrink-0 border-2 transition-colors duration-200 ${selectedCategories.includes(category.id)
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400'
                        }`}
                    >
                      {selectedCategories.includes(category.id)
                        ? <Check size={14} className="sm:w-[14px] sm:h-[14px]" />
                        : <Plus size={14} className="sm:w-[14px] sm:h-[14px]" />
                      }
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Combo pack pricing */}
                  {category.isCombo && (
                    <div className="mb-2 sm:mb-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base font-bold text-purple-600">{category.price}</span>
                        <span className="text-xs sm:text-sm text-gray-500 line-through">{category.originalPrice}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-purple-600 mt-1">Special Combo Offer!</p>
                    </div>
                  )}

                  <div className="space-y-1 sm:space-y-1.5">
                    <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
                      <span>{category.studentsEnrolled.toLocaleString()} students</span>
                      <span>{category.examsAvailable} exams</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setSelectedCategories([])}
              className="w-full sm:w-auto text-sm"
            >
              Clear All
            </Button>
            <Button
              onClick={handleSave}
              className="w-full sm:w-auto text-sm"
            >
              Save Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
