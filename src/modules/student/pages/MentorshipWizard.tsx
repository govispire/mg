import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    mentorshipCategories,
    examStages,
    durationOptions,
    mentorshipTypes,
    pricingConfig,
    type MentorshipCategory,
    type ExamStage,
    type DurationOption,
    type MentorshipType
} from '@/data/mentorshipData';
import { Check, ArrowRight, ArrowLeft, Sparkles, Clock, Calendar, Users } from 'lucide-react';
import MentorMatching from '@/components/student/mentorship/MentorMatching';

interface MentorshipSelection {
    category?: MentorshipCategory;
    stage?: ExamStage;
    duration?: DurationOption;
    type?: MentorshipType;
}

const MentorshipWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selection, setSelection] = useState<MentorshipSelection>({});

    // Calculate price based on current selections
    const calculatePrice = (): number => {
        if (!selection.category || !selection.stage || !selection.duration || !selection.type) {
            return 0;
        }

        const examMultiplier = pricingConfig.examMultipliers[selection.category.id] || 1.0;
        const totalPrice =
            pricingConfig.basePrice *
            examMultiplier *
            selection.stage.priceMultiplier *
            selection.duration.priceMultiplier *
            selection.type.priceMultiplier;

        return Math.round(totalPrice);
    };

    const handleCategorySelect = (category: MentorshipCategory) => {
        setSelection({ category });
        setStep(2);
    };

    const handleStageSelect = (stage: ExamStage) => {
        setSelection({ ...selection, stage });
        setStep(3);
    };

    const handleDurationSelect = (duration: DurationOption) => {
        setSelection({ ...selection, duration });
        setStep(4);
    };

    const handleTypeSelect = (type: MentorshipType) => {
        setSelection({ ...selection, type });
        setStep(5);
    };

    const handleProceedToMentors = () => {
        // Store selection in localStorage
        localStorage.setItem('mentorshipSelection', JSON.stringify(selection));
        setStep(6); // Go to mentor matching
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                        Find Your Perfect Mentorship
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Answer a few questions to get personalized mentorship recommendations
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex items-center justify-between max-w-3xl mx-auto">
                        {[1, 2, 3, 4, 5, 6].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${s < step ? 'bg-green-500 text-white' :
                                    s === step ? 'bg-purple-600 text-white ring-4 ring-purple-200' :
                                        'bg-gray-200 text-gray-500'
                                    }`}>
                                    {s < step ? <Check className="w-5 h-5" /> : s}
                                </div>
                                {s < 6 && (
                                    <div className={`w-16 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between max-w-3xl mx-auto mt-3 text-xs text-gray-600">
                        <span>Category</span>
                        <span>Stage</span>
                        <span>Duration</span>
                        <span>Type</span>
                        <span>Summary</span>
                        <span>Mentor</span>
                    </div>
                </div>

                {/* Step 1: Category Selection */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-center mb-8">Select Your Exam Category</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mentorshipCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategorySelect(category)}
                                    className={`p-6 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-xl ${category.colorClass} text-left`}
                                >
                                    <img src={category.logo} alt={category.name} className="w-16 h-16 mb-4 rounded-lg" />
                                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {category.studentsEnrolled.toLocaleString()} students
                                        </span>
                                        <span className="text-purple-600 font-semibold">
                                            {category.mentorsAvailable} mentors
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Stage Selection */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-center mb-4">Select Exam Stage</h2>
                        <p className="text-center text-gray-600 mb-8">
                            Preparing for <span className="font-semibold text-purple-600">{selection.category?.name}</span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {examStages.map((stage) => (
                                <button
                                    key={stage.id}
                                    onClick={() => handleStageSelect(stage)}
                                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 bg-white hover:shadow-xl transition-all hover:scale-105 text-left"
                                >
                                    <h3 className="text-lg font-bold mb-2">{stage.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{stage.description}</p>
                                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                        {stage.priceMultiplier === 1.0 ? 'Best Value' : `${Math.round(stage.priceMultiplier * 100)}% of full`}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="text-center mt-6">
                            <button onClick={() => setStep(1)} className="text-purple-600 hover:underline flex items-center gap-2 mx-auto">
                                <ArrowLeft className="w-4 h-4" /> Back to Categories
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Duration Selection */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-center mb-4">Choose Your Duration</h2>
                        <p className="text-center text-gray-600 mb-8">
                            {selection.category?.name} • {selection.stage?.name}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
                            {durationOptions.map((duration) => (
                                <button
                                    key={duration.id}
                                    onClick={() => handleDurationSelect(duration)}
                                    className={`p-6 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-xl text-center relative ${duration.popular
                                        ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50'
                                        : 'border-gray-200 bg-white hover:border-purple-300'
                                        }`}
                                >
                                    {duration.popular && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                            Popular
                                        </span>
                                    )}
                                    <Calendar className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                                    <h3 className="text-xl font-bold mb-2">{duration.name}</h3>
                                    {duration.months > 0 && (
                                        <p className="text-gray-500 text-sm">{duration.months} months</p>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="text-center mt-6">
                            <button onClick={() => setStep(2)} className="text-purple-600 hover:underline flex items-center gap-2 mx-auto">
                                <ArrowLeft className="w-4 h-4" /> Back to Stages
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Mentorship Type Selection */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-center mb-4">Select Mentorship Type</h2>
                        <p className="text-center text-gray-600 mb-8">
                            {selection.category?.name} • {selection.stage?.name} • {selection.duration?.name}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {mentorshipTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => handleTypeSelect(type)}
                                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 bg-white hover:shadow-xl transition-all hover:scale-105 text-left"
                                >
                                    <Clock className="w-8 h-8 mb-3 text-purple-600" />
                                    <h3 className="text-lg font-bold mb-2">{type.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                                    <div className="flex gap-2">
                                        {type.sessionsPerWeek && (
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                                                {type.sessionsPerWeek} sessions/week
                                            </span>
                                        )}
                                        {type.responseTime && (
                                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
                                                {type.responseTime} response
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="text-center mt-6">
                            <button onClick={() => setStep(3)} className="text-purple-600 hover:underline flex items-center gap-2 mx-auto">
                                <ArrowLeft className="w-4 h-4" /> Back to Duration
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Summary & Pricing */}
                {step === 5 && (
                    <div className="animate-fade-in max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8">Your Mentorship Plan</h2>

                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Exam Category</h3>
                                    <p className="text-lg font-bold">{selection.category?.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Stage</h3>
                                    <p className="text-lg font-bold">{selection.stage?.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Duration</h3>
                                    <p className="text-lg font-bold">{selection.duration?.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Mentorship Type</h3>
                                    <p className="text-lg font-bold">{selection.type?.name}</p>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Base Price</span>
                                    <span className="font-semibold">₹{pricingConfig.basePrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Category Adjustment</span>
                                    <span className="font-semibold">×{pricingConfig.examMultipliers[selection.category?.id || '']}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Stage Multiplier</span>
                                    <span className="font-semibold">×{selection.stage?.priceMultiplier}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Duration Multiplier</span>
                                    <span className="font-semibold">×{selection.duration?.priceMultiplier}</span>
                                </div>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-600">Type Multiplier</span>
                                    <span className="font-semibold">×{selection.type?.priceMultiplier}</span>
                                </div>

                                <div className="border-t-2 pt-4 flex justify-between items-center">
                                    <span className="text-2xl font-bold">Total Price</span>
                                    <span className="text-3xl font-bold text-purple-600">₹{calculatePrice().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setStep(4)}
                                className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all flex items-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" /> Modify Selection
                            </button>
                            <button
                                onClick={handleProceedToMentors}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                Proceed to Mentor Selection <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 6: Mentor Matching */}
                {step === 6 && selection.category && selection.stage && selection.type && (
                    <div className="animate-fade-in">
                        <MentorMatching
                            categoryId={selection.category.id}
                            stageId={selection.stage.id}
                            mentorshipTypeId={selection.type.id}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorshipWizard;
