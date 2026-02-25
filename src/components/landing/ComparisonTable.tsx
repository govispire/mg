import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComparisonItem {
  feature: string;
  prepsmart: string | boolean;
  traditional: string | boolean;
  highlight?: boolean;
}

const comparisons: ComparisonItem[] = [
  { feature: 'Monthly Cost', prepsmart: '₹499/month', traditional: '₹5,000-15,000/month', highlight: true },
  { feature: 'Learn Anytime, Anywhere', prepsmart: true, traditional: false },
  { feature: 'Personalized Study Plan', prepsmart: true, traditional: false },
  { feature: 'AI-Powered Analytics', prepsmart: true, traditional: false },
  { feature: '1-on-1 Mentorship', prepsmart: true, traditional: 'Limited' },
  { feature: 'Real Exam Simulation', prepsmart: true, traditional: false },
  { feature: 'Daily Quizzes & Streaks', prepsmart: true, traditional: false },
  { feature: 'Current Affairs Updates', prepsmart: 'Daily', traditional: 'Weekly' },
  { feature: 'Doubt Resolution', prepsmart: '24/7 AI + Experts', traditional: 'Class hours only' },
  { feature: 'Progress Tracking', prepsmart: 'Real-time', traditional: 'Monthly tests' },
  { feature: 'Flexibility', prepsmart: 'Complete control', traditional: 'Fixed schedule' },
  { feature: 'Travel Time', prepsmart: 'Zero', traditional: '2-4 hours/day' },
];

const ComparisonTable = () => {
  return (
    <section className="w-full py-16 bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary mb-4">Why Choose Us</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            PrepSmart vs Traditional Coaching
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See why thousands of students are switching to smart, digital-first preparation
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="overflow-hidden border-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 text-left font-semibold">Feature</th>
                    <th className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <Badge className="bg-primary text-primary-foreground mb-1">
                          <Star className="h-3 w-3 mr-1" />
                          PrepSmart
                        </Badge>
                      </div>
                    </th>
                    <th className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <Badge variant="secondary">Traditional Coaching</Badge>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((item, index) => (
                    <motion.tr
                      key={item.feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-t ${item.highlight ? 'bg-primary/5' : ''}`}
                    >
                      <td className="p-4">
                        <span className={item.highlight ? 'font-semibold' : ''}>{item.feature}</span>
                      </td>
                      <td className="p-4 text-center">
                        {typeof item.prepsmart === 'boolean' ? (
                          item.prepsmart ? (
                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                          )
                        ) : (
                          <span className="font-semibold text-primary">{item.prepsmart}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof item.traditional === 'boolean' ? (
                          item.traditional ? (
                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                          )
                        ) : (
                          <span className="text-muted-foreground">{item.traditional}</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Savings Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Save up to ₹1,50,000 per year
              </h3>
              <p className="text-green-100 mb-4">
                Plus save 2-4 hours of travel time daily. Study smarter, not harder.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="bg-white/20 text-white border-0 py-2 px-4">
                  💰 90% Cost Savings
                </Badge>
                <Badge className="bg-white/20 text-white border-0 py-2 px-4">
                  ⏰ 4 Hours Saved Daily
                </Badge>
                <Badge className="bg-white/20 text-white border-0 py-2 px-4">
                  📈 Better Results
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
