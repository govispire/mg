
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useQuestionEditor = (sectionName: string, questionNumber: number, onSave: (questionData: any) => void) => {
  const { toast } = useToast();
  const [questionType, setQuestionType] = useState('mcq');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { id: 'A', text: '', isCorrect: false },
    { id: 'B', text: '', isCorrect: false },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false }
  ]);
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0.25);
  const [difficulty, setDifficulty] = useState('moderate');
  const [language, setLanguage] = useState('english');
  const [hasImage, setHasImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMultiCorrect, setIsMultiCorrect] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  useEffect(() => {
    // Reset correct answers when switching between single/multi correct
    if (!isMultiCorrect) {
      const correctedOptions = options.map(opt => {
        const newOpt = {...opt};
        if (newOpt.isCorrect) {
          const hasMultipleCorrect = options.filter(o => o.isCorrect).length > 1;
          if (hasMultipleCorrect) {
            newOpt.isCorrect = false;
          }
        }
        return newOpt;
      });
      setOptions(correctedOptions);
    }
  }, [isMultiCorrect]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHasImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Image uploaded",
        description: `File ${file.name} uploaded successfully.`,
      });
    }
  };

  const handleRemoveImage = () => {
    setHasImage(false);
    setImagePreview(null);
  };

  const handleOptionChange = (id: string, text: string) => {
    const updatedOptions = options.map(opt => 
      opt.id === id ? { ...opt, text } : opt
    );
    setOptions(updatedOptions);
  };

  const handleCorrectAnswerChange = (id: string) => {
    const updatedOptions = options.map(opt => 
      isMultiCorrect 
        ? opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt
        : { ...opt, isCorrect: opt.id === id }
    );
    setOptions(updatedOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      const nextOptionId = String.fromCharCode(65 + options.length); // A, B, C, D, E, F
      setOptions([...options, { id: nextOptionId, text: '', isCorrect: false }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    } else {
      toast({
        title: "Cannot remove option",
        description: "A minimum of 2 options is required.",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    if (!questionText.trim()) {
      toast({
        title: "Error",
        description: "Question text is required.",
        variant: "destructive"
      });
      return;
    }

    // Check if at least one option is selected as correct
    if (!options.some(opt => opt.isCorrect)) {
      toast({
        title: "Error",
        description: "Please select at least one correct answer.",
        variant: "destructive"
      });
      return;
    }

    const questionData = {
      type: questionType,
      number: questionNumber,
      text: questionText,
      options: options,
      explanation: explanation,
      marks: marks,
      negativeMarks: negativeMarks,
      difficulty: difficulty,
      language: language,
      hasImage: hasImage,
      imageUrl: imagePreview,
      isMultiCorrect: isMultiCorrect,
      shuffleOptions: shuffleOptions,
      section: sectionName
    };

    onSave(questionData);
    toast({
      title: "Question saved",
      description: `Question ${questionNumber} has been saved successfully.`,
    });
  };

  return {
    questionType,
    setQuestionType,
    questionText,
    setQuestionText,
    options,
    setOptions,
    explanation,
    setExplanation,
    marks,
    setMarks,
    negativeMarks,
    setNegativeMarks,
    difficulty,
    setDifficulty,
    language,
    setLanguage,
    hasImage,
    setHasImage,
    imagePreview,
    setImagePreview,
    isMultiCorrect,
    setIsMultiCorrect,
    shuffleOptions,
    setShuffleOptions,
    handleImageUpload,
    handleRemoveImage,
    handleOptionChange,
    handleCorrectAnswerChange,
    addOption,
    removeOption,
    handleSave
  };
};
