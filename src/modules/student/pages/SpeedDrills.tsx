
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategorySelector } from '@/components/global/CategorySelector';

import { useCategoryFilteredSpeedDrills } from '@/hooks/useCategoryFilteredContent';
import { Clock, BookOpen, ListChecks, CheckCircle, BarChart2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  { id: 'english', name: 'English', icon: '🔤' },
  { id: 'reasoning', name: 'Reasoning', icon: '🧩' },
  { id: 'quantitative', name: 'Quantitative', icon: '📊' },
  { id: 'gen-awareness', name: 'General Awareness', icon: '🌍' },
  { id: 'computer', name: 'Computer Awareness', icon: '💻' }
];

const SpeedDrills = () => {
  const { speedDrills, stats, hasFilters, selectedCategories } = useCategoryFilteredSpeedDrills();
  const [activeSection, setActiveSection] = useState('all');

  const getFilteredDrills = () => {
    if (activeSection === 'all') return speedDrills;
    return speedDrills.filter(drill => drill.subject === activeSection);
  };

  const filteredDrills = getFilteredDrills();

  const getSectionCounts = () => {
    const counts: { [key: string]: number } = {};
    sections.forEach(section => {
      counts[section.id] = speedDrills.filter(drill => drill.subject === section.id).length;
    });
    return counts;
  };

  const sectionCounts = getSectionCounts();

  return (
    <div className="container mx-auto px-4 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Speed Drills</h1>
          <p className="text-gray-500">
            {hasFilters
              ? `Quick practice sessions for your selected categories`
              : 'Select your exam categories to see relevant speed drills'
            }
          </p>
        </div>
        <CategorySelector />
      </div>



      {/* Stats Cards */}
      {hasFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drills</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attempted</p>
                <p className="text-2xl font-bold">{stats.attempted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
              <BarChart2 className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold">{stats.subjects}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Section Navigation */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex overflow-x-auto pb-2 gap-2">
          <Button
            variant={activeSection === 'all' ? "default" : "outline"}
            onClick={() => setActiveSection('all')}
            className="whitespace-nowrap"
          >
            All ({speedDrills.length})
          </Button>
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              onClick={() => setActiveSection(section.id)}
              className="whitespace-nowrap"
              disabled={sectionCounts[section.id] === 0}
            >
              {section.icon} {section.name} ({sectionCounts[section.id] || 0})
            </Button>
          ))}
        </div>
      </div>

      {/* Drills Content */}
      <div className="space-y-4 max-w-5xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">
            {activeSection === 'all'
              ? hasFilters
                ? `All Category Drills (${selectedCategories.length} categories selected)`
                : 'All Speed Drills'
              : `${sections.find(s => s.id === activeSection)?.name} Drills`
            }
          </h2>
          <Button variant="outline" size="sm">
            View History
          </Button>
        </div>

        {filteredDrills.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasFilters ? 'No drills found' : 'Select Your Categories'}
              </h3>
              <p className="text-gray-600 mb-4">
                {hasFilters
                  ? `No ${activeSection === 'all' ? '' : activeSection} drills available for your selected categories.`
                  : 'Please select your exam categories using the Category Selector above to see relevant speed drills.'
                }
              </p>
              {!hasFilters && (
                <div className="flex justify-center">
                  <CategorySelector />
                </div>
              )}
            </div>
          </Card>
        ) : (
          filteredDrills.map((drill) => (
            <Card key={drill.id} className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-lg ${drill.subject === 'english' ? 'bg-blue-50 text-blue-600' :
                      drill.subject === 'reasoning' ? 'bg-purple-50 text-purple-600' :
                        drill.subject === 'quantitative' ? 'bg-green-50 text-green-600' :
                          drill.subject === 'gen-awareness' ? 'bg-orange-50 text-orange-600' :
                            'bg-red-50 text-red-600'
                    }`}>
                    {drill.subject === 'english' ? <BookOpen className="h-5 w-5" /> :
                      drill.subject === 'reasoning' ? <ListChecks className="h-5 w-5" /> :
                        drill.subject === 'quantitative' ? <BarChart2 className="h-5 w-5" /> :
                          drill.subject === 'gen-awareness' ? <BookOpen className="h-5 w-5" /> :
                            <BookOpen className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{drill.title}</h3>
                      <Badge variant={drill.difficulty === 'Easy' ? 'secondary' : drill.difficulty === 'Medium' ? 'default' : 'destructive'}>
                        {drill.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{drill.timeLimit}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-3.5 w-3.5 mr-1" />
                        <span>{drill.questions} questions</span>
                      </div>
                      {drill.isAttempted && drill.averageScore && (
                        <div className="flex items-center text-green-600">
                          <BarChart2 className="h-3.5 w-3.5 mr-1" />
                          <span>Score: {drill.averageScore}/{drill.questions}</span>
                        </div>
                      )}
                      {drill.isAttempted && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          <span>Attempted</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {drill.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {drill.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{drill.topics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {drill.isAttempted ? (
                    <>
                      <Button variant="outline" size="sm" className="w-full md:w-auto">
                        <BarChart2 className="h-4 w-4 mr-2" />
                        View Result
                      </Button>
                      <Link to={`/student/tests/${drill.subject}/${drill.id}/exam`} className="w-full md:w-auto">
                        <Button size="sm" className="w-full">
                          Reattempt
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to={`/student/tests/${drill.subject}/${drill.id}/exam`} className="w-full md:w-auto">
                      <Button size="sm" className="w-full">
                        Start Drill
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SpeedDrills;
