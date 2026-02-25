import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Target, Heart, TrendingUp, BookOpen, Sparkles } from 'lucide-react';
import { ExamStage } from '@/hooks/useSelfCareExams';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StageResultDialogProps {
    open: boolean;
    onClose: () => void;
    examName: string;
    stageName: string;
    stageStatus: 'cleared' | 'not-cleared' | 'selected' | 'not-selected';
    isFinalStage: boolean;
    score?: string;
    studentName?: string;
    studentPhoto?: string;
}

export const StageResultDialog: React.FC<StageResultDialogProps> = ({
    open,
    onClose,
    examName,
    stageName,
    stageStatus,
    isFinalStage,
    score,
    studentName = "Aspirant",
    studentPhoto
}) => {
    const isSuccess = stageStatus === 'cleared' || stageStatus === 'selected';
    const isFailure = stageStatus === 'not-cleared' || stageStatus === 'not-selected';

    // Success Messages for Different Stages
    const getSuccessMessage = () => {
        if (isFinalStage && stageStatus === 'selected') {
            return {
                title: `🎉 Congratulations Officer ${studentName}!`,
                subtitle: `You have been SELECTED for ${examName}!`,
                message: `Your hard work, dedication, and perseverance have finally paid off! You've cleared all stages including ${stageName} and achieved what many only dream of. This is not just your success - it's a testament to your commitment to serve the nation. Welcome to the prestigious service!`,
                icon: <Trophy className="w-24 h-24 text-yellow-500" />,
                badge: "SELECTED",
                celebrationLevel: "ultimate",
                nextSteps: [
                    "Congratulations on your incredible achievement!",
                    "Your journey of preparation has reached its goal",
                    "Now begins your journey of service to the nation",
                    "Family, friends, and mentors - celebrate with them!",
                    "Share your success story to inspire others"
                ]
            };
        }

        if (isFinalStage) {
            return {
                title: `🎊 Outstanding Achievement!`,
                subtitle: `You cleared ${stageName} of ${examName}!`,
                message: `Congratulations on clearing the final stage! This is a remarkable achievement that showcases your exceptional abilities. Your journey reaches its best for now, and you should be immensely proud of how far you've come!`,
                icon: <Award className="w-20 h-20 text-purple-500" />,
                badge: "FINAL STAGE CLEARED",
                celebrationLevel: "high",
                nextSteps: [
                    "Celebrate this significant milestone!",
                    "Wait for official results and further communications",
                    "Prepare for any additional formalities if required",
                    "Stay positive and hopeful for the final selection"
                ]
            };
        }

        // Intermediate stage success (Prelims, Mains, etc.)
        const stageMessages: Record<string, any> = {
            prelims: {
                title: `🎯 Congratulations on Clearing ${stageName}!`,
                subtitle: `${examName} - Next Stop: Mains!`,
                message: `Excellent work! You've successfully cleared the ${stageName}. This is the foundation of your success. The preliminary stage filters thousands, and you've made it through! Now it's time to gear up for the Mains examination.`,
                nextStage: "Mains",
                icon: <Target className="w-20 h-20 text-green-500" />,
                nextSteps: [
                    "Start preparing for Mains with renewed energy",
                    "Focus on answer writing and descriptive papers",
                    "Analyze your Prelims performance to identify strengths",
                    "Join test series for Mains if not already enrolled",
                    "Maintain your momentum - you're halfway there!"
                ]
            },
            mains: {
                title: `🌟 Brilliant! ${stageName} Cleared!`,
                subtitle: `${examName} - Welcome to the Interview Stage!`,
                message: `Spectacular achievement! Clearing ${stageName} is a major milestone that only the best achieve. Your written skills, knowledge depth, and analytical abilities have been proven. Now prepare to showcase your personality in the Interview!`,
                nextStage: "Interview",
                icon: <Sparkles className="w-20 h-20 text-blue-500" />,
                nextSteps: [
                    "Schedule a mock interview with experts",
                    "Work on your communication and confidence",
                    "Prepare your DAF (Detailed Application Form) thoroughly",
                    "Read current affairs and updates daily",
                    "Stay calm and confident - you've already proven your excellence"
                ]
            },
            interview: {
                title: `👏 Interview Cleared Successfully!`,
                subtitle: `${examName} - Awaiting Final Results!`,
                message: `Fantastic performance! Clearing the interview stage means you've demonstrated not just knowledge, but also the personality, ethics, and leadership qualities required for the service. You're now in the final selection process!`,
                nextStage: "Final Selection",
                icon: <Award className="w-20 h-20 text-orange-500" />,
                nextSteps: [
                    "Wait patiently for the final merit list",
                    "Keep checking official websites for updates",
                    "Prepare documents for verification if required",
                    "Stay positive and hopeful",
                    "You're so close to your dream - believe in yourself!"
                ]
            }
        };

        // Find matching stage message
        const stageKey = Object.keys(stageMessages).find(key =>
            stageName.toLowerCase().includes(key)
        );

        if (stageKey && stageMessages[stageKey]) {
            return {
                ...stageMessages[stageKey],
                badge: "STAGE CLEARED",
                celebrationLevel: "medium"
            };
        }

        // Default success message
        return {
            title: `✅ ${stageName} Cleared Successfully!`,
            subtitle: `Great Progress in ${examName}!`,
            message: `Congratulations! You've successfully cleared ${stageName}. This is an important step forward in your journey. Keep up the excellent work and maintain your preparation intensity!`,
            icon: <Target className="w-20 h-20 text-green-500" />,
            badge: "CLEARED",
            celebrationLevel: "medium",
            nextSteps: [
                "Continue your preparation with dedication",
                "Analyze what worked well for you",
                "Prepare thoroughly for the next stage",
                "Stay focused and motivated",
                "You're making great progress!"
            ]
        };
    };

    // Motivational Messages for Failures
    const getMotivationalMessage = () => {
        if (isFinalStage && stageStatus === 'not-selected') {
            return {
                title: `Your Journey Continues 💪`,
                subtitle: `${examName} - ${stageName}`,
                message: `We know this isn't the result you hoped for, but remember: success is not final, failure is not fatal. You've come so far, clearing multiple stages that thousands couldn't. This experience has made you stronger, wiser, and more prepared. Many toppers succeeded only after multiple attempts. Your dream is still achievable!`,
                icon: <Heart className="w-20 h-20 text-red-400" />,
                advice: [
                    {
                        title: "Don't Give Up - Success Comes to Those Who Persist",
                        points: [
                            "Many IAS toppers succeeded in their 3rd or 4th attempt",
                            "Each attempt makes you stronger and more experienced",
                            "You've already proven your capabilities by reaching this far",
                            "Your dream is worth fighting for - keep going!"
                        ]
                    },
                    {
                        title: "Learn and Improve",
                        points: [
                            "Analyze what could have been better",
                            "Seek mentor guidance for improvement areas",
                            "Work on interview skills and personality development",
                            "Every failure teaches invaluable lessons"
                        ]
                    },
                    {
                        title: "Prepare Smartly for Next Attempt",
                        points: [
                            "Take a short break to recharge mentally",
                            "Create a comprehensive study plan",
                            "Join quality coaching or guidance programs",
                            "Practice more mock tests and interviews",
                            "Build a strong support system"
                        ]
                    }
                ],
                quotes: [
                    "I count your failures, don't worry. One day your hard work will pay off.",
                    "Winners always lose first - it's about getting back up stronger.",
                    "\"Success is not final, failure is not fatal: it is the courage to continue that counts.\" - Winston Churchill",
                    "Har koshish ko kamyabi milegi, thodi late zaroor milegi - Your efforts will succeed, just be patient."
                ]
            };
        }

        // Intermediate stage failure
        const stageAdvice: Record<string, any> = {
            prelims: {
                title: `Prelims - A Learning Experience 📚`,
                subtitle: `${examName} - Time to Analyze and Improve`,
                message: `You couldn't clear ${stageName} this time, but this is not the end - it's a new beginning. Prelims is challenging, and many toppers failed it initially too. Use this experience to come back stronger. Remember, the difference between those who succeed and those who don't is simple: persistence!`,
                icon: <BookOpen className="w-20 h-20 text-blue-400" />,
                advice: [
                    {
                        title: "Strengthen Your Foundation",
                        points: [
                            "Revise NCERT books thoroughly (Class 6-12)",
                            "Focus on basic concepts before advanced topics",
                            "Create concise notes for quick revision",
                            "Understand the exam pattern and question trends"
                        ]
                    },
                    {
                        title: "Improve Your Strategy",
                        points: [
                            "Analyze previous year papers systematically",
                            "Practice at least 50-100 mock tests",
                            "Work on time management and accuracy",
                            "Identify your strong and weak subjects",
                            "Focus on high-weightage topics first"
                        ]
                    },
                    {
                        title: "Stay Consistent",
                        points: [
                            "Create a realistic daily study schedule",
                            "Study for 6-8 hours consistently",
                            "Take regular breaks to avoid burnout",
                            "Join a test series for regular evaluation",
                            "Stay updated with current affairs daily"
                        ]
                    }
                ],
                quotes: [
                    "All is well... Your dreams are valid, keep fighting for them!",
                    "Failure is the stepping stone to success - don't count your failures, make them count!",
                    "The only way to do great work is to love what you do and persist through challenges.",
                    "Every topper you see today failed multiple times - Your turn is coming!"
                ]
            },
            mains: {
                title: `Mains - Room for Growth 📈`,
                subtitle: `${examName} - Transforming Setback into Comeback`,
                message: `${stageName} didn't go as planned, but remember - Mains is one of the toughest exams in the country. The fact that you reached here shows your potential. Many successful candidates failed Mains before succeeding. Use this experience to refine your writing, deepen your knowledge, and return stronger!`,
                icon: <TrendingUp className="w-20 h-20 text-purple-400" />,
                advice: [
                    {
                        title: "Master Answer Writing",
                        points: [
                            "Practice writing answers daily (at least 5-7 answers)",
                            "Get your answers evaluated by mentors/experts",
                            "Learn from toppers' answer sheets",
                            "Focus on structure, keywords, and clarity",
                            "Use diagrams, flowcharts for better presentation"
                        ]
                    },
                    {
                        title: "Deepen Your Knowledge",
                        points: [
                            "Read standard reference books thoroughly",
                            "Make comprehensive notes for each subject",
                            "Understand concepts deeply, not just superficially",
                            "Connect current affairs with static topics",
                            "Develop your own perspective on issues"
                        ]
                    },
                    {
                        title: "Improve Presentation",
                        points: [
                            "Work on your handwriting for better readability",
                            "Structure answers with introduction, body, conclusion",
                            "Use underlining and highlighting effectively",
                            "Practice completing papers within time limits",
                            "Write multiple mock Mains exams"
                        ]
                    }
                ],
                quotes: [
                    "Winners don't quit. Losers do. Which one are you?",
                    "Koshish karne walon ki haar nahi hoti - Those who try never lose!",
                    "\"Don't watch the clock; do what it does. Keep going.\" - Sam Levenson",
                    "I count your failures, each one is making you stronger!"
                ]
            },
            interview: {
                title: `Interview - Refine Your Personality 🎯`,
                subtitle: `${examName} - Building Confidence for Next Time`,
                message: `The interview stage couldn't be cleared this time, but don't let this discourage you. The interview evaluates personality traits that can be developed and improved. Many successful officers failed interviews before cracking them. Use this feedback to work on your communication, confidence, and awareness!`,
                icon: <Target className="w-20 h-20 text-orange-400" />,
                advice: [
                    {
                        title: "Enhance Communication Skills",
                        points: [
                            "Practice speaking English fluently every day",
                            "Read newspapers and magazines aloud",
                            "Join a public speaking club or group",
                            "Record yourself and analyze your speech",
                            "Work with a mentor on communication"
                        ]
                    },
                    {
                        title: "Build Confidence",
                        points: [
                            "Practice with multiple mock interview panels",
                            "Work on body language and eye contact",
                            "Improve your general awareness significantly",
                            "Be honest and authentic in your responses",
                            "Stay calm and composed under pressure"
                        ]
                    },
                    {
                        title: "Prepare Thoroughly",
                        points: [
                            "Know your DAF inside out",
                            "Study your optional subject from interview perspective",
                            "Be aware of current affairs comprehensively",
                            "Prepare opinions on contemporary issues",
                            "Understand your strengths and motivations clearly"
                        ]
                    }
                ],
                quotes: [
                    "Picture abhi baaki hai mere dost - The story isn't over yet, my friend!",
                    "Your hard work will pay off. Keep believing, keep working!",
                    "Confidence comes not from always being right but from not fearing to be wrong.",
                    "Champions are made from something they have deep inside them - a desire that's unstoppable!"
                ]
            }
        };

        // Find matching stage advice
        const stageKey = Object.keys(stageAdvice).find(key =>
            stageName.toLowerCase().includes(key)
        );

        if (stageKey && stageAdvice[stageKey]) {
            return stageAdvice[stageKey];
        }

        // Default motivational message
        return {
            title: `A Temporary Setback 💪`,
            subtitle: `${examName} - ${stageName}`,
            message: `You couldn't clear ${stageName} this time, but remember - this is just one chapter, not the whole story. Every successful person has faced setbacks. What matters is how you respond to them. Use this experience as fuel for your comeback!`,
            icon: <Heart className="w-20 h-20 text-red-400" />,
            advice: [
                {
                    title: "Reflect and Learn",
                    points: [
                        "Identify specific areas that need improvement",
                        "Seek feedback from mentors and peers",
                        "Analyze what went wrong objectively",
                        "Create an action plan for improvement"
                    ]
                },
                {
                    title: "Stay Motivated",
                    points: [
                        "Remember why you started this journey",
                        "Connect with successful aspirants for inspiration",
                        "Take care of your mental and physical health",
                        "Celebrate small wins and progress",
                        "Believe in yourself - you can do this!"
                    ]
                }
            ],
            quotes: [
                "All is well! Believe in yourself and keep moving forward.",
                "I count your failures - each one teaches you something valuable!",
                "\"Fall seven times, stand up eight.\" - Japanese Proverb",
                "Your hard work will pay off - trust the process!"
            ]
        };
    };

    const content = isSuccess ? getSuccessMessage() : getMotivationalMessage();

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${isSuccess ? 'border-t-4 border-t-green-500' : 'border-t-4 border-t-blue-500'
                    }`}>
                    <div className="space-y-6">
                        {/* Student Photo Banner for Final Selection */}
                        {isFinalStage && stageStatus === 'selected' && studentPhoto && (
                            <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 p-8">
                                {/* Decorative Elements */}
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                                {/* Content */}
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    {/* Student Photo */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full blur-xl opacity-60"></div>
                                        <Avatar className="h-32 w-32 border-4 border-white shadow-2xl relative">
                                            <AvatarImage src={studentPhoto} className="object-cover" />
                                            <AvatarFallback className="text-4xl font-bold bg-white text-amber-600">
                                                {studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    {/* Officer Badge */}
                                    <div className="bg-white text-amber-600 px-6 py-2 rounded-full shadow-lg border-2 border-amber-200">
                                        <p className="font-black text-lg uppercase tracking-wider">Officer {studentName}</p>
                                    </div>

                                    {/* Success Badge */}
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full shadow-xl">
                                        <p className="font-black text-xl flex items-center gap-2">
                                            <Trophy className="w-6 h-6" />
                                            SELECTED
                                            <Trophy className="w-6 h-6" />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Header Section */}
                        <div className={`text-center p-6 rounded-xl ${isSuccess
                            ? 'bg-gradient-to-br from-green-50 to-emerald-100'
                            : 'bg-gradient-to-br from-blue-50 to-indigo-100'
                            }`}>
                            <div className="flex justify-center mb-4">
                                {content.icon}
                            </div>
                            <h2 className="text-2xl font-black mb-2">{content.title}</h2>
                            <p className="text-lg font-semibold text-gray-700">{content.subtitle}</p>
                            {content.badge && (
                                <div className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-bold ${isSuccess
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white'
                                    }`}>
                                    {content.badge}
                                </div>
                            )}
                            {score && (
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600">Your Score</p>
                                    <p className="text-3xl font-black text-primary">{score}</p>
                                </div>
                            )}
                        </div>

                        {/* Message Section */}
                        <div className="px-6">
                            <p className="text-base leading-relaxed text-gray-700">
                                {content.message}
                            </p>
                        </div>

                        {/* Success Next Steps */}
                        {isSuccess && 'nextSteps' in content && content.nextSteps && (
                            <div className="px-6">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-yellow-500" />
                                    {content.nextStage ? `Next: ${content.nextStage}` : 'What\'s Next?'}
                                </h3>
                                <ul className="space-y-2">
                                    {content.nextSteps.map((step: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                {index + 1}
                                            </div>
                                            <p className="text-sm text-gray-700">{step}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Motivational Advice for Failures */}
                        {isFailure && 'advice' in content && content.advice && (
                            <div className="px-6 space-y-4">
                                {content.advice.map((section: any, index: number) => (
                                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                                        <h3 className="font-bold text-base mb-3 text-blue-900">
                                            {section.title}
                                        </h3>
                                        <ul className="space-y-2">
                                            {section.points.map((point: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="text-blue-600 mt-1">•</span>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Inspirational Quotes */}
                        {'quotes' in content && content.quotes && (
                            <div className="px-6 space-y-2">
                                {content.quotes.map((quote: string, index: number) => (
                                    <div key={index} className={`p-4 rounded-lg italic text-sm border-l-4 ${isSuccess
                                        ? 'bg-green-50 border-green-500 text-green-900'
                                        : 'bg-blue-50 border-blue-500 text-blue-900'
                                        }`}>
                                        {quote}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="px-6 pb-6">
                            <Button
                                onClick={onClose}
                                className={`w-full ${isSuccess
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                    }`}
                            >
                                {isSuccess ? '🎉 Continue Your Journey' : '💪 I Will Come Back Stronger!'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
