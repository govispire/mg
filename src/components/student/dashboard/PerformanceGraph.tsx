import React from 'react';
import { Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ReferenceLine } from 'recharts';

interface PerformanceGraphProps {
    data: Array<{ week: string; tests: number; quizzes: number }>;
}

export const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ data }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 h-full min-h-[350px]">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-sm">
                    <Target className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-[13px] text-slate-800">Performance Graph</h3>
                    <p className="text-[10px] text-slate-400">Weekly average scores</p>
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
        </div>
    );
};
