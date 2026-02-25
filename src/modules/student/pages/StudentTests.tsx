
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, BookOpen, TrendingUp } from 'lucide-react';
import { getExamsByCategoryGrouped, examCategories, type GroupedExams, SBI_LOGO, SSC_LOGO, RAILWAY_LOGO, UPSC_LOGO, IBPS_LOGO, NIACL_LOGO } from '@/data/examData';
import { useExamCategoryContext } from '@/app/providers';

const StudentTests = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { selectedCategories, hasSelectedCategories } = useExamCategoryContext();
  const [activeCategory, setActiveCategory] = useState('');

  console.log('StudentTests render - selectedCategories:', selectedCategories);
  console.log('StudentTests render - hasSelectedCategories:', hasSelectedCategories);
  console.log('StudentTests render - activeCategory:', activeCategory);
  console.log('StudentTests render - URL category param:', category);

  // Simplified active category logic
  useEffect(() => {
    console.log('Effect triggered - category param:', category, 'selectedCategories:', selectedCategories);

    if (selectedCategories.length > 0) {
      // If URL has a category and it's in selected categories, use it
      if (category && selectedCategories.includes(category)) {
        console.log('Setting active category from URL:', category);
        setActiveCategory(category);
      } else {
        // Otherwise use first selected category
        const firstCategory = selectedCategories[0];
        console.log('Setting active category to first selected:', firstCategory);
        setActiveCategory(firstCategory);
        // Update URL to match the active category
        if (!category || !selectedCategories.includes(category)) {
          navigate(`/student/tests/${firstCategory}`, { replace: true });
        }
      }
    } else {
      // No categories selected
      console.log('No categories selected, clearing active category');
      setActiveCategory('');
    }
  }, [category, selectedCategories, navigate]);

  // Filter categories to show only selected ones - include all from examCategories that match selected IDs
  const availableCategories = selectedCategories.map(selectedId => {
    // First try to find in examCategories
    const foundCategory = examCategories.find(cat => cat.id === selectedId);
    if (foundCategory) {
      return foundCategory;
    }

    // If not found in examCategories, create a minimal category object for combo categories
    // This ensures combo categories still show as tabs even if not in main examCategories
    return {
      id: selectedId,
      name: getCategoryDisplayName(selectedId),
      description: getCategoryDescription(selectedId),
      logo: getCategoryLogo(selectedId),
      studentsEnrolled: 0,
      examsAvailable: 0,
      colorClass: 'bg-gray-50 border-gray-200',
      isPopular: false
    };
  }).filter(Boolean);

  console.log('Available categories for tabs:', availableCategories);

  if (!hasSelectedCategories) {
    return (
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Exam Categories Selected</h2>
          <p className="text-gray-600 mb-6">
            Please select exam categories using the "Select Categories" button in the header to view tests.
          </p>
        </div>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setActiveCategory(value);
    navigate(`/student/tests/${value}`);
  };

  // Helper function to get the correct logo for each section within combo categories
  const getSectionLogo = (categoryId: string) => {
    switch (categoryId) {
      case 'banking-insurance':
      case 'banking':
        return SBI_LOGO;
      case 'ssc':
        return SSC_LOGO;
      case 'railway':
      case 'railways-rrb':
        return RAILWAY_LOGO;
      case 'upsc':
      case 'civil-services':
        return UPSC_LOGO;
      case 'defence':
        return UPSC_LOGO;
      case 'tnpsc':
      case 'tamil-nadu-exams':
        return 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061570/png-transparent-government-of-tamil-nadu-seal-of-tamil-nadu-tamil-nadu-legislative-assembly-state-emblem-of-india-others-miscellaneous-emblem-food-thumbnail_sy4peu.png';
      default:
        return NIACL_LOGO;
    }
  };

  // Helper function to get combo logos (3-in-1 style logos for combo categories)
  const getComboLogo = (categoryId: string) => {
    switch (categoryId) {
      case 'banking-ssc-railway-combo':
        // Use a combo logo that represents all three
        return 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062500/combo-banking-ssc-railway_placeholder.png';
      case 'ssc-railway-combo':
        // Use a combo logo for SSC + Railway
        return 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062500/combo-ssc-railway_placeholder.png';
      case 'upsc-tnpsc-combo':
        // Use a combo logo for UPSC + TNPSC
        return 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062500/combo-upsc-tnpsc_placeholder.png';
      case 'ssc-railway-defence-combo':
        // Use a combo logo for SSC + Railway + Defence
        return 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062500/combo-ssc-railway-defence_placeholder.png';
      default:
        return null;
    }
  };

  // Component to render category content with sections
  const CategoryContent = ({ categoryId }: { categoryId: string }) => {
    const categoryData = availableCategories.find(cat => cat.id === categoryId);
    const groupedExams: GroupedExams = getExamsByCategoryGrouped(categoryId);

    if (!categoryData) return null;

    // Use combo logo for combo categories, otherwise use the category logo
    const headerLogo = getComboLogo(categoryId) || categoryData.logo;

    return (
      <div className="space-y-4">
        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
              <img
                src={headerLogo}
                alt={categoryData.name}
                className="w-16 h-16 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold truncate">{categoryData.name}</h1>
                <p className="text-gray-600 line-clamp-2 md:whitespace-normal">{categoryData.description}</p>
              </div>
            </div>

            <div className="flex flex-nowrap gap-4 justify-start md:justify-end overflow-x-auto pb-2 md:pb-0">
              <div className="text-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 min-w-[100px] flex-shrink-0">
                <div className="text-xl font-bold text-blue-600 leading-none mb-1">{categoryData.studentsEnrolled.toLocaleString()}</div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Enrolled</div>
              </div>
              <div className="text-center bg-green-50 px-4 py-2 rounded-lg border border-green-100 min-w-[100px] flex-shrink-0">
                <div className="text-xl font-bold text-green-600 leading-none mb-1">{groupedExams.sections.reduce((total, section) => total + section.exams.length, 0)}</div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Exams</div>
              </div>
              <div className="text-center bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 min-w-[100px] flex-shrink-0">
                <div className="text-xl font-bold text-purple-600 leading-none mb-1">95%</div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Success</div>
              </div>
              <div className="text-center bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 min-w-[100px] flex-shrink-0">
                <div className="text-xl font-bold text-orange-600 leading-none mb-1">120</div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Tests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Sections */}
        <div className="space-y-4">
          {groupedExams.sections.map((section, index) => (
            <div key={section.categoryId} className="space-y-4">
              {/* Section Header - only show for combo categories with multiple sections */}
              {groupedExams.isGrouped && groupedExams.sections.length > 1 && (
                <div className="flex items-center gap-3 border-b pb-3">
                  <img
                    src={getSectionLogo(section.categoryId)}
                    alt={section.categoryName}
                    className="w-8 h-8 object-contain"
                  />
                  <h2 className="text-xl font-semibold text-gray-900">{section.categoryName}</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {section.exams.length} exams
                  </Badge>
                </div>
              )}

              {/* Exams Grid for this section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {section.exams.length > 0 ? (
                  section.exams.map((exam) => (
                    <Card
                      key={exam.id}
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/student/tests/${categoryId}/${exam.id}`)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={exam.logo}
                              alt={exam.name}
                              className="w-10 h-10 object-contain"
                            />
                            <div>
                              <h3 className="font-semibold">{exam.name}</h3>
                              {exam.isPopular && (
                                <Badge variant="secondary" className="mt-1">Popular</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">35%</span>
                          </div>
                          <Progress value={35} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-blue-600">120</div>
                            <div className="text-gray-500">Tests</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600">42</div>
                            <div className="text-gray-500">Completed</div>
                          </div>
                        </div>

                        <Button className="w-full">
                          View Tests
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Available</h3>
                    <p className="text-gray-600">
                      No tests found for this section.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Category Tabs */}
      {availableCategories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <Tabs value={activeCategory} onValueChange={handleTabChange}>
            <div className="border-b px-6 py-4">
              <TabsList className="grid w-full gap-1 bg-gray-100 p-1 rounded-lg overflow-hidden" style={{
                gridTemplateColumns: `repeat(${availableCategories.length}, minmax(0, 1fr))`
              }}>
                {availableCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 rounded-md"
                  >
                    <span className="truncate">{cat.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content for each category */}
            {availableCategories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="p-6">
                <CategoryContent categoryId={cat.id} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};

// Helper functions to handle category display for combo categories
const getCategoryDisplayName = (categoryId: string): string => {
  const nameMap: { [key: string]: string } = {
    'banking-ssc-railway-combo': 'Banking + SSC + Railway',
    'ssc-railway-combo': 'SSC + Railway',
    'upsc-tnpsc-combo': 'UPSC + TNPSC',
    'ssc-railway-defence-combo': 'SSC + Railway + Defence'
  };
  return nameMap[categoryId] || categoryId;
};

const getCategoryDescription = (categoryId: string): string => {
  const descMap: { [key: string]: string } = {
    'banking-ssc-railway-combo': 'Combined prep for all major govt exams',
    'ssc-railway-combo': 'Optimized prep for both exam types',
    'upsc-tnpsc-combo': 'National and TN state civil services',
    'ssc-railway-defence-combo': 'Govt & defense services combined'
  };
  return descMap[categoryId] || 'Comprehensive exam preparation';
};

const getCategoryLogo = (categoryId: string): string => {
  const logoMap: { [key: string]: string } = {
    'banking-ssc-railway-combo': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062500/combo-banking-ssc-railway_placeholder.png',
    'ssc-railway-combo': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062500/combo-ssc-railway_placeholder.png',
    'upsc-tnpsc-combo': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062500/combo-upsc-tnpsc_placeholder.png',
    'ssc-railway-defence-combo': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062500/combo-ssc-railway-defence_placeholder.png'
  };
  return logoMap[categoryId] || NIACL_LOGO;
};

export default StudentTests;
