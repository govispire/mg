import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Landmark, Train, Shield, FileText, Building2, 
  GraduationCap, Plane, Cog, BookOpen, CheckCircle, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExamCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  exams: string[];
  features: string[];
  description: string;
}

const categories: ExamCategory[] = [
  {
    id: 'banking',
    name: 'Banking',
    icon: Landmark,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    exams: ['IBPS PO', 'SBI PO', 'IBPS Clerk', 'SBI Clerk', 'RBI Grade B', 'NABARD'],
    features: ['Sectional tests', 'Full-length mocks', 'Previous year papers', 'Topic-wise practice'],
    description: 'Complete banking exam preparation with expert guidance'
  },
  {
    id: 'ssc',
    name: 'SSC',
    icon: FileText,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    exams: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD', 'SSC CPO', 'SSC Stenographer'],
    features: ['Tier-wise preparation', 'Speed tests', 'Current affairs', 'Interview prep'],
    description: 'Ace SSC exams with comprehensive test series'
  },
  {
    id: 'railway',
    name: 'Railway',
    icon: Train,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    exams: ['RRB NTPC', 'RRB Group D', 'RRB ALP', 'RRB JE', 'RPF Constable'],
    features: ['CBT practice', 'Technical tests', 'Aptitude tests', 'GK updates'],
    description: 'Railway exam preparation with real exam simulation'
  },
  {
    id: 'regulatory',
    name: 'Regulatory',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    exams: ['SEBI Grade A', 'RBI Assistant', 'IRDAI', 'PFRDA', 'NABARD Grade A'],
    features: ['Specialized content', 'Expert mentors', 'Case studies', 'Interview guidance'],
    description: 'Regulatory body exam preparation by industry experts'
  },
  {
    id: 'tnpsc',
    name: 'TNPSC',
    icon: Building2,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    exams: ['Group 1', 'Group 2', 'Group 4', 'VAO', 'SI'],
    features: ['Tamil medium', 'State-focused', 'Current affairs TN', 'Previous papers'],
    description: 'Tamil Nadu PSC exam preparation in Tamil & English'
  },
  {
    id: 'upsc',
    name: 'UPSC',
    icon: GraduationCap,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    exams: ['CSE Prelims', 'CSE Mains', 'CAPF', 'CDS', 'NDA', 'IES'],
    features: ['Comprehensive coverage', 'Answer writing', 'Optional subjects', 'Interview prep'],
    description: 'Civil services preparation with IAS toppers guidance'
  },
  {
    id: 'defence',
    name: 'Defence',
    icon: Plane,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    exams: ['NDA', 'CDS', 'AFCAT', 'Indian Navy', 'Coast Guard'],
    features: ['Physical fitness tips', 'SSB preparation', 'GK for defence', 'Medical guidance'],
    description: 'Defence exam preparation with SSB interview training'
  },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: Cog,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    exams: ['GATE', 'ESE', 'ISRO', 'DRDO', 'BARC'],
    features: ['Technical subjects', 'Previous papers', 'Formula sheets', 'Video solutions'],
    description: 'Engineering services exam preparation'
  },
  {
    id: 'others',
    name: 'Others',
    icon: BookOpen,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    exams: ['Teaching', 'Insurance', 'Law', 'Medical', 'State PCS'],
    features: ['Varied content', 'Expert guidance', 'Flexible learning', 'Custom tests'],
    description: 'Other competitive exam preparation'
  },
];

const ExamCategoryIcons = () => {
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(null);

  return (
    <section id="exams" className="w-full py-12 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <Badge className="bg-primary/10 text-primary mb-4">Choose Your Path</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Exam Categories We Cover
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select your target exam to see specific features and preparation resources
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {categories.map((category, index) => (
            <Dialog key={category.id}>
              <DialogTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50">
                    <CardContent className="p-4 text-center">
                      <div className={`w-14 h-14 mx-auto ${category.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                        <category.icon className={`h-7 w-7 ${category.color}`} />
                      </div>
                      <p className="font-semibold text-sm">{category.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 ${category.bgColor} rounded-xl`}>
                      <category.icon className={`h-8 w-8 ${category.color}`} />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">{category.name} Exams</DialogTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Exams Covered</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.exams.map((exam) => (
                        <Badge key={exam} variant="secondary">{exam}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <ul className="space-y-2">
                      {category.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full">
                    Start Preparation <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExamCategoryIcons;
