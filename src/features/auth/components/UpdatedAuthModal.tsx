import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedSelect, EnhancedSelectContent, EnhancedSelectItem, EnhancedSelectTrigger, EnhancedSelectValue } from "@/components/ui/enhanced-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { CalendarIcon, User, Shield, UserCheck, Crown, Building, CheckCircle2, FileText, Target, Eye, MessageSquare, Wrench, Sparkles, Award, PartyPopper, Camera, Upload, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { useAuth, UserRole } from '@/app/providers';
import { examCategories, getExamsByCategory } from '@/data/examData';
import { indiaStates } from '@/data/indiaStates';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { ImageCropper } from '@/components/ui/image-cropper';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

interface CompulsoryFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    username: string;
    onComplete: (data: CompulsoryFormData) => void;
    initialData?: Partial<CompulsoryFormData>;
    onInstantUpdate?: (data: Partial<CompulsoryFormData>) => void;
    role?: string;
}

interface CompulsoryFormData {
    examCategory: string;
    customExamCategory?: string;
    targetExam: string;
    customTargetExam?: string;
    preparationStartDate: Date | null;
    state: string;
    avatar?: string;
}

const AVATAR_PRESETS = [
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
];

const CompulsoryFormModal = ({ open, onOpenChange, username, onComplete, initialData, onInstantUpdate, role }: CompulsoryFormModalProps) => {
    const [examCategory, setExamCategory] = useState(initialData?.examCategory || 'banking');
    const [customExamCategory, setCustomExamCategory] = useState(initialData?.customExamCategory || '');
    const [targetExam, setTargetExam] = useState(initialData?.targetExam || '');
    const [customTargetExam, setCustomTargetExam] = useState(initialData?.customTargetExam || '');
    const [preparationStartDate, setPreparationStartDate] = useState<Date | null>(initialData?.preparationStartDate ? new Date(initialData.preparationStartDate) : null);
    const [selectedState, setSelectedState] = useState(initialData?.state || '');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [avatarType, setAvatarType] = useState<'preset' | 'upload'>((initialData?.avatar && !initialData.avatar.startsWith('http')) ? 'upload' : 'preset');
    const [selectedAvatar, setSelectedAvatar] = useState((initialData?.avatar && initialData.avatar.startsWith('http')) ? initialData.avatar : AVATAR_PRESETS[0]);
    const [uploadedImage, setUploadedImage] = useState<string | null>(initialData?.avatar && !initialData.avatar.startsWith('http') ? initialData.avatar : null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const { user } = useAuth();
    // Use the passed role prop, or fall back to the authenticated user's role, or default to 'student'
    const effectiveRole = role || user?.role || 'student';
    const isStudent = effectiveRole === 'student';

    // Cropper state
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const isEditMode = !!initialData;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImage: string) => {
        setUploadedImage(croppedImage);
        setAvatarType('upload');
        setIsCropping(false);
        setImageToCrop(null);

        // If we're in edit mode, provide instant feedback by updating the form state 
        // which will flow back to relevant components if needed, 
        // though typically we wait for 'Save Changes'.
        // To satisfy the 'instant' requirement, we could call onComplete for JUST the avatar,
        // but it's cleaner to let the user see the updated preview in the form first.
        if (isEditMode && onInstantUpdate) {
            onInstantUpdate({ avatar: croppedImage });
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setImageToCrop(null);
    };

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        // Only validate these fields if the user is a student
        if (isStudent) {
            if (!examCategory) errors.examCategory = 'Exam category is required';
            if (examCategory === 'others' && !customExamCategory.trim()) {
                errors.customExamCategory = 'Please specify your exam category';
            }
            if (examCategory && examCategory !== 'others' && !targetExam) {
                errors.targetExam = 'Target exam is required';
            }
            if (targetExam === 'others' && !customTargetExam.trim()) {
                errors.customTargetExam = 'Please specify your target exam';
            }
            if (!preparationStartDate) errors.preparationStartDate = 'Preparation start date is required';
        }

        if (!selectedState) errors.selectedState = 'State is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        onComplete({
            examCategory: examCategory === 'others' ? 'others' : examCategory,
            customExamCategory: examCategory === 'others' ? customExamCategory : undefined,
            targetExam: targetExam === 'others' ? 'others' : targetExam,
            customTargetExam: targetExam === 'others' ? customTargetExam : undefined,
            preparationStartDate,
            state: selectedState,
            avatar: avatarType === 'upload' ? uploadedImage || undefined : selectedAvatar
        });

        // Close the modal after successful submission
        onOpenChange(false);
    };

    const availableExams = examCategory && examCategory !== 'others' ? getExamsByCategory(examCategory) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className="text-2xl font-bold text-center">
                    {isEditMode ? 'Update Your Profile' : 'Complete Your Profile'}
                </DialogTitle>
                <DialogDescription className="text-center text-muted-foreground">
                    {isEditMode ? `Update your details, ${username}` : `Hey ${username}! 👋 Please fill in these details to personalize your learning journey`}
                </DialogDescription>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">

                    {/* Avatar Selection */}
                    <div className="flex flex-col items-center space-y-4 mb-6">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 ring-4 ring-primary/5 transition-all duration-300 group-hover:scale-105">
                                <img
                                    src={uploadedImage || selectedAvatar}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay for hover effect */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                            </div>

                            <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 p-2.5 bg-primary rounded-full text-white cursor-pointer hover:bg-primary/90 transition-all shadow-lg hover:scale-110 z-10 border-2 border-white">
                                <Camera className="w-4 h-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium bg-primary/5 px-3 py-1 rounded-full text-primary">
                            Tap camera to update photo
                        </p>
                    </div>



                    <div className="space-y-4">
                        {/* Student-only fields */}
                        {isStudent && (
                            <>
                                {/* Exam Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="exam-category" className="text-sm font-medium">
                                        Select Your Exam Category <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={examCategory} onValueChange={setExamCategory}>
                                        <SelectTrigger className={cn("h-12 text-base", formErrors.examCategory && "border-red-500")}>
                                            <SelectValue placeholder="Choose exam category" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] bg-white border shadow-lg z-50">
                                            {examCategories.map((category) => (
                                                <SelectItem key={category.id} value={category.id} className="text-base py-3">
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="others" className="text-base py-3">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.examCategory && <p className="text-red-500 text-xs">{formErrors.examCategory}</p>}
                                    <p className="text-xs text-muted-foreground">📚 Banking is selected by default</p>
                                </div>

                                {/* Custom Exam Category */}
                                {examCategory === 'others' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-exam-category" className="text-sm font-medium">
                                            Enter Your Exam Category <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="custom-exam-category"
                                            placeholder="e.g., State Government Exams"
                                            value={customExamCategory}
                                            onChange={(e) => setCustomExamCategory(e.target.value)}
                                            className={cn("h-12 text-base", formErrors.customExamCategory && "border-red-500")}
                                        />
                                        {formErrors.customExamCategory && <p className="text-red-500 text-xs">{formErrors.customExamCategory}</p>}
                                    </div>
                                )}

                                {/* Target Exam */}
                                {examCategory && examCategory !== 'others' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="target-exam" className="text-sm font-medium">
                                            Your Target Exam <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={targetExam} onValueChange={setTargetExam}>
                                            <SelectTrigger className={cn("h-12 text-base", formErrors.targetExam && "border-red-500")}>
                                                <SelectValue placeholder="Choose your target exam" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px] bg-white border shadow-lg z-50">
                                                {availableExams.map((exam) => (
                                                    <SelectItem key={exam.id} value={exam.id} className="text-base py-3">
                                                        {exam.name}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="others" className="text-base py-3">Others</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formErrors.targetExam && <p className="text-red-500 text-xs">{formErrors.targetExam}</p>}
                                    </div>
                                )}

                                {/* Custom Target Exam */}
                                {targetExam === 'others' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-target-exam" className="text-sm font-medium">
                                            Enter Your Target Exam <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="custom-target-exam"
                                            placeholder="e.g., IBPS PO 2024"
                                            value={customTargetExam}
                                            onChange={(e) => setCustomTargetExam(e.target.value)}
                                            className={cn("h-12 text-base", formErrors.customTargetExam && "border-red-500")}
                                        />
                                        {formErrors.customTargetExam && <p className="text-red-500 text-xs">{formErrors.customTargetExam}</p>}
                                    </div>
                                )}

                                {/* Preparation Start Date */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        When do you plan to start your preparation? <span className="text-red-500">*</span>
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="w-full">
                                                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal h-12 text-base",
                                                                    !preparationStartDate && "text-muted-foreground",
                                                                    formErrors.preparationStartDate && "border-red-500",
                                                                    initialData?.preparationStartDate && "opacity-75 cursor-not-allowed bg-muted/30"
                                                                )}
                                                                disabled={!!initialData?.preparationStartDate}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {preparationStartDate ? format(preparationStartDate, "PPP") : "Select your start date"}
                                                                {initialData?.preparationStartDate && <Lock className="ml-auto h-4 w-4 text-muted-foreground" />}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        {!initialData?.preparationStartDate && (
                                                            <PopoverContent className="w-auto p-0 z-50" align="start">
                                                                <EnhancedCalendar
                                                                    mode="single"
                                                                    selected={preparationStartDate || undefined}
                                                                    onSelect={(date) => {
                                                                        setPreparationStartDate(date || null);
                                                                        setIsDatePickerOpen(false);
                                                                    }}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        )}
                                                    </Popover>
                                                </div>
                                            </TooltipTrigger>
                                            {initialData?.preparationStartDate && (
                                                <TooltipContent>
                                                    <p>This date is locked after initial entry</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                    {formErrors.preparationStartDate && <p className="text-red-500 text-xs">{formErrors.preparationStartDate}</p>}
                                    <p className="text-xs text-muted-foreground">📅 Select the actual date you want to begin</p>
                                </div>
                            </>
                        )}

                        {/* State */}
                        <div className="space-y-2">
                            <Label htmlFor="state" className="text-sm font-medium">
                                Your State <span className="text-red-500">*</span>
                            </Label>
                            <EnhancedSelect value={selectedState} onValueChange={setSelectedState}>
                                <EnhancedSelectTrigger className={cn("h-12 text-base", formErrors.selectedState && "border-red-500")}>
                                    <EnhancedSelectValue placeholder="Select your state" />
                                </EnhancedSelectTrigger>
                                <EnhancedSelectContent searchable searchPlaceholder="Search states...">
                                    {indiaStates.map((state) => (
                                        <EnhancedSelectItem key={state.id} value={state.id} className="text-base py-3">
                                            {state.name}
                                        </EnhancedSelectItem>
                                    ))}
                                </EnhancedSelectContent>
                            </EnhancedSelect>
                            {formErrors.selectedState && <p className="text-red-500 text-xs">{formErrors.selectedState}</p>}
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium">
                        {isEditMode ? 'Save Changes' : 'Complete Registration'}
                    </Button>
                </form>
            </DialogContent>

            {
                imageToCrop && (
                    <ImageCropper
                        image={imageToCrop}
                        open={isCropping}
                        onCropComplete={handleCropComplete}
                        onCancel={handleCropCancel}
                    />
                )
            }
        </Dialog >
    );
};

interface WelcomeMessageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    username: string;
    userInitial: string;
    userAvatar?: string;
}

const WelcomeMessageModal = ({ open, onOpenChange, username, userInitial, userAvatar }: WelcomeMessageModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-0 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                    {/* User Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-white overflow-hidden">
                            {userAvatar ? (
                                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                userInitial
                            )}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <PartyPopper className="h-6 w-6 text-yellow-500" />
                            <h2 className="text-3xl font-bold text-gray-800">Welcome Aboard!</h2>
                            <Sparkles className="h-6 w-6 text-purple-500" />
                        </div>
                        <p className="text-xl font-semibold text-gray-700">
                            Hi, <span className="text-primary">{username}</span>!
                        </p>
                        <p className="text-gray-600 max-w-md">
                            🎉 Your registration is complete! Get ready to ace your exams with personalized learning paths and expert guidance.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="w-full space-y-3 px-4">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">Personalized Study Plan</p>
                                <p className="text-xs text-gray-600">Tailored to your target exam</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">Daily Practice Tests</p>
                                <p className="text-xs text-gray-600">Stay consistent and track progress</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Award className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">Expert Guidance</p>
                                <p className="text-xs text-gray-600">Learn from the best mentors</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                    >
                        Start Your Journey
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export { CompulsoryFormModal, WelcomeMessageModal };
