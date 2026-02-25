
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ExamSidebarProps {
  showSidebar: boolean;
  toggleSidebar: () => void;
  currentSection: string;
  sections: string[];
  setCurrentSection: (section: string) => void;
  goToQuestionInSection: (section: string) => void;
  isMobile: boolean;
}

const ExamSidebar: React.FC<ExamSidebarProps> = ({
  showSidebar,
  toggleSidebar,
  currentSection,
  sections,
  setCurrentSection,
  goToQuestionInSection,
  isMobile
}) => {
  if (!showSidebar) return null;
  
  return (
    <>
      <div className="w-full md:w-48 lg:w-64 bg-gray-100 overflow-y-auto flex-shrink-0 z-10
                      fixed md:static inset-0 md:inset-auto
                      transition-transform duration-300 ease-in-out
                      transform-gpu md:transform-none
                      translate-x-0">
        {isMobile && (
          <div className="flex justify-end p-2">
            <Button variant="ghost" size="sm" onClick={toggleSidebar}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="p-2">
          <h3 className="font-medium px-2 py-1">Sections</h3>
          <div className="mt-1">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => {
                  setCurrentSection(section);
                  goToQuestionInSection(section);
                  if (isMobile) toggleSidebar();
                }}
                className={`w-full text-left px-2 py-2 rounded-md transition flex items-center ${
                  section === currentSection 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <span className="text-lg mr-2">
                  {section === currentSection ? '▶' : ''}
                </span>
                <span>{section}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Semi-transparent overlay when sidebar is shown on mobile */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default ExamSidebar;
