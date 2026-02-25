import React from 'react';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ReferenceLine } from 'recharts';

interface PerformanceGraphProps {
    data: Array<{ week: string; tests: number; quizzes: number }>;
}

export const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ data }) => {
    return (
        <Card className="p-4 bg-card flex-1 shadow-sm h-full min-h-[350px]">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Performance Graph</h3>
                        <p className="text-xs text-muted-foreground">Weekly average scores</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">Tests</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-400"></div>
                        <span className="text-muted-foreground">Quizzes</span>
                    </div>
                </div>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradTests" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradQuizzes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="week"
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                            domain={[0, 100]}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v: number) => `${v}%`}
                        >
                            <Label
                                value="Average Accuracy Score"
                                angle={-90}
                                position="insideLeft"
                                style={{ textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                            />
                        </YAxis>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                fontSize: '12px',
                                padding: '10px 14px',
                            }}
                            formatter={(value: number) => [`${value}%`, undefined]}
                            labelStyle={{ fontWeight: 600, marginBottom: '4px', fontSize: '12px' }}
                            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />

                        {/* Goal Line */}
                        <ReferenceLine
                            y={85}
                            label={{ position: 'right', value: 'Target Goal (85%)', fill: 'hsl(var(--primary))', fontSize: 10 }}
                            stroke="hsl(var(--primary))"
                            strokeDasharray="3 3"
                            opacity={0.5}
                        />

                        <Area
                            type="monotone"
                            dataKey="tests"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            fill="url(#gradTests)"
                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                            name="Tests"
                        />
                        <Area
                            type="monotone"
                            dataKey="quizzes"
                            stroke="#8b5cf6"
                            strokeWidth={2.5}
                            fill="url(#gradQuizzes)"
                            dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                            name="Quizzes"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
