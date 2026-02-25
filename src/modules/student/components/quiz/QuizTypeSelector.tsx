import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar, Zap, Rocket, BookOpen, Target, Award, Trophy,
    Clock, FileQuestion
} from 'lucide-react';
import { QuizType, QUIZ_PATTERNS } from '@/types/quizTypes';

interface QuizTypeStats {
    total: number;
    completed: number;
    averageScore: number;
}

interface QuizTypeSelectorProps {
    selectedType: QuizType | 'all';
    onTypeSelect: (type: QuizType | 'all') => void;
    stats: Record<QuizType | 'all', QuizTypeStats>;
}

const TYPE_ICONS: Record<QuizType, React.ElementType> = {
    'daily': Calendar,
    'rapid-fire': Zap,
    'speed-challenge': Rocket,
    'mini-test': BookOpen,
    'sectional': Target,
    'full-prelims': Award,
    'full-mains': Trophy,
};

const TYPE_GRADIENTS: Record<QuizType | 'all', string> = {
    'all': 'from-gray-500 to-gray-600',
    'daily': 'from-blue-500 to-blue-600',
    'rapid-fire': 'from-orange-500 to-orange-600',
    'speed-challenge': 'from-red-500 to-red-600',
    'mini-test': 'from-green-500 to-green-600',
    'sectional': 'from-purple-500 to-purple-600',
    'full-prelims': 'from-yellow-500 to-yellow-600',
    'full-mains': 'from-indigo-500 to-indigo-600',
};

const QuizTypeSelector: React.FC<QuizTypeSelectorProps> = ({
    selectedType,
    onTypeSelect,
    stats
}) => {
    const types: Array<QuizType | 'all'> = [
        'all',
        'daily',
        'rapid-fire',
        'speed-challenge',
        'mini-test',
        'sectional',
        'full-prelims',
        'full-mains'
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {types.map(type => {
                const isSelected = selectedType === type;
                const typeStats = stats[type] || { total: 0, completed: 0, averageScore: 0 };
                const Icon = type === 'all' ? FileQuestion : TYPE_ICONS[type as QuizType];
                const pattern = type === 'all'
                    ? { title: 'All Quizzes', description: 'View all quiz types', duration: 0, totalQuestions: 0 }
                    : QUIZ_PATTERNS[type as QuizType];

                return (
                    <Card
                        key={type}
                        onClick={() => onTypeSelect(type)}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isSelected
                                ? 'ring-2 ring-primary shadow-md'
                                : 'hover:border-primary/50'
                            }`}
                    >
                        <CardContent className="p-4">
                            {/* Icon and Badge */}
                            <div className="flex items-start justify-between mb-3">
                                <div
                                    className={`p-2.5 rounded-xl bg-gradient-to-br ${TYPE_GRADIENTS[type]} text-white`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                {typeStats.total > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-bold"
                                    >
                                        {typeStats.completed}/{typeStats.total}
                                    </Badge>
                                )}
                            </div>

                            {/* Title */}
                            <h4 className="font-bold text-sm mb-1 line-clamp-1">
                                {pattern.title}
                            </h4>

                            {/* Meta Info */}
                            {type !== 'all' && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <span className="flex items-center gap-1">
                                        <FileQuestion className="h-3 w-3" />
                                        {pattern.totalQuestions}Q
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {pattern.duration}m
                                    </span>
                                </div>
                            )}

                            {/* Stats */}
                            {typeStats.completed > 0 && (
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Avg Score</span>
                                        <span className="font-bold text-primary">
                                            {Math.round(typeStats.averageScore)}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default QuizTypeSelector;
