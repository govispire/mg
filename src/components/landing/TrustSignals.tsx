import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, TrendingUp, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { icon: TrendingUp, value: '98%', label: 'Success Rate', color: 'text-green-500' },
  { icon: Users, value: '50,000+', label: 'Active Students', color: 'text-blue-500' },
  { icon: Award, value: '15+', label: 'Exam Categories', color: 'text-purple-500' },
  { icon: Star, value: '4.9/5', label: 'Student Rating', color: 'text-yellow-500' },
];

const students = [
  { name: 'Priya Sharma', exam: 'IBPS PO', image: 'https://randomuser.me/api/portraits/women/44.jpg', score: '92%' },
  { name: 'Rahul Kumar', exam: 'SSC CGL', image: 'https://randomuser.me/api/portraits/men/32.jpg', score: '88%' },
  { name: 'Anita Patel', exam: 'RRB NTPC', image: 'https://randomuser.me/api/portraits/women/65.jpg', score: '95%' },
  { name: 'Vikram Singh', exam: 'SBI Clerk', image: 'https://randomuser.me/api/portraits/men/75.jpg', score: '91%' },
];

const TrustSignals = () => {
  return (
    <section className="w-full py-8 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Student Faces */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex -space-x-3">
            {students.map((student, index) => (
              <motion.div
                key={student.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="relative"
              >
                <img
                  src={student.image}
                  alt={student.name}
                  className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center md:text-left">
            <p className="font-semibold text-foreground">Join 50,000+ successful students</p>
            <p className="text-sm text-muted-foreground">Who cleared their exams with PrepSmart</p>
          </div>
          <Badge className="bg-green-500 text-white animate-pulse">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified Results
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
