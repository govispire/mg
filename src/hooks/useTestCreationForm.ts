
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { examCategories, getSectionsByCategory } from '@/data/examData';

export const useTestCreationForm = (onClose: () => void) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableSections, setAvailableSections] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    instructions: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 35,
    negativeMarking: false,
    testType: 'prelims',
    sections: [
      { name: 'General Awareness', questions: 25, marks: 25 }
    ]
  });

  useEffect(() => {
    if (selectedCategory) {
      const sections = getSectionsByCategory(selectedCategory);
      if (sections && sections.length > 0) {
        setFormData(prev => ({
          ...prev,
          sections: sections.slice(0, 3).map(section => ({
            name: section.name,
            questions: 25,
            marks: 25
          }))
        }));
        setAvailableSections(sections);
      }
    }
  }, [selectedCategory]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData({
      ...formData,
      [field]: value
    });

    if (field === 'category') {
      setSelectedCategory(value as string);
    }
  };

  const handleSectionChange = (index: number, field: string, value: string | number) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: field === 'name' ? value : Number(value)
    };
    
    // Update total marks
    const totalMarks = updatedSections.reduce((sum, section) => sum + section.marks, 0);
    
    setFormData({
      ...formData,
      sections: updatedSections,
      totalMarks: totalMarks
    });
  };

  const handleAddSection = () => {
    if (formData.sections.length < 5) {
      let newSectionName = 'New Section';
      
      if (availableSections.length > formData.sections.length) {
        const usedNames = formData.sections.map(s => s.name);
        const availableName = availableSections.find(s => !usedNames.includes(s.name));
        if (availableName) {
          newSectionName = availableName.name;
        }
      }
      
      setFormData({
        ...formData,
        sections: [
          ...formData.sections,
          { name: newSectionName, questions: 10, marks: 10 }
        ]
      });
    } else {
      toast({
        title: "Maximum sections reached",
        description: "You can add up to 5 sections per test.",
      });
    }
  };

  const handleRemoveSection = (index: number) => {
    const updatedSections = [...formData.sections];
    updatedSections.splice(index, 1);
    
    // Update total marks
    const totalMarks = updatedSections.reduce((sum, section) => sum + section.marks, 0);
    
    setFormData({
      ...formData,
      sections: updatedSections,
      totalMarks: totalMarks
    });
  };

  const handleSaveTest = () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Required fields missing",
        description: "Please fill out all required fields before saving.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would save the test to the backend
    toast({
      title: "Test Created",
      description: `Test "${formData.name}" has been created successfully.`,
    });
    onClose();
  };

  const countSectionQuestions = (sectionName: string) => {
    return questions.filter(q => q.section === sectionName).length;
  };

  return {
    formData,
    selectedCategory,
    availableSections,
    questions,
    setQuestions,
    handleInputChange,
    handleSectionChange,
    handleAddSection,
    handleRemoveSection,
    handleSaveTest,
    countSectionQuestions
  };
};
