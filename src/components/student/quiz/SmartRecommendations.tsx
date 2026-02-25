import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, AlertTriangle, TrendingUp, Target, BarChart3, ChevronRight
} from 'lucide-react';
import { WeakArea } from '@/utils/quizAnalytics';

interface SmartRecommendationsProps {
    weakAreas: WeakArea[];
    onViewFullAnalysis?: () => void;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
    weakAreas,
    onViewFullAnalysis
}) => {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
            case 'Medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
            case 'Low': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
            default: return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
        }
    };

    const getSubjectColor = (subject: string) => {
        const colors: Record<string, string> = {
            'Quantitative Aptitude': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'Reasoning': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
            'English': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            'General Awareness': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
            'Current Affairs': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return colors[subject] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Smart Recommendations
                    </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                    Based on your performance & exam patterns
                </p>
            </CardHeader>

            <CardContent className="space-y-3">
                {weakAreas.length > 0 ? (
                    <>
                        {weakAreas.slice(0, 3).map((area, index) => (
                            <Card
                                key={index}
                                className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all duration-300 cursor-pointer group border-muted"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Topic and Priority */}
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <h5 className="font-semibold text-sm">{area.topic}</h5>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] font-bold ${getPriorityColor(area.priority)}`}
                                            >
                                                {area.priority} Priority
                                            </Badge>
                                        </div>

                                        {/* Subject */}
                                        <div className="mb-2">
                                            <Badge className={`text-xs ${getSubjectColor(area.subject)}`}>
                                                {area.subject}
                                            </Badge>
                                        </div>

                                        {/* Reason */}
                                        <div className="flex items-start gap-1.5 mb-3">
                                            <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${area.priority === 'High' ? 'text-red-500' : area.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`} />
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {area.reason}
                                            </p>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-background/60 rounded-lg p-2 text-center">
                                                <p className={`text-sm font-bold ${area.accuracy < 50 ? 'text-red-500' : area.accuracy < 65 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {area.accuracy}%
                                                </p>
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
                                                    Accuracy
                                                </p>
                                            </div>
                                            <div className="bg-background/60 rounded-lg p-2 text-center">
                                                <p className="text-sm font-bold text-primary">
                                                    {area.suggestedQuizzes}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
                                                    Quizzes
                                                </p>
                                            </div>
                                            <div className="bg-background/60 rounded-lg p-2 text-center">
                                                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                                    {area.examRelevance}%
                                                </p>
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
                                                    Exam Rel.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrow Icon */}
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                                </div>
                            </Card>
                        ))}

                        {/* View Full Analysis Button */}
                        <Button
                            variant="outline"
                            className="w-full mt-2"
                            size="sm"
                            onClick={onViewFullAnalysis}
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Full Analysis
                        </Button>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <h4 className="font-semibold text-sm mb-1">No Weak Areas Found</h4>
                        <p className="text-xs text-muted-foreground">
                            Complete more quizzes to get personalized recommendations
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SmartRecommendations;
