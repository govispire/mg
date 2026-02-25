import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, FileText, Calendar, ChevronRight, Home, Search, Filter,
  BookOpen, Landmark, Train, Target, Shield, GraduationCap, Scale, Folder,
  Globe, Play, Clock, CheckCircle, Mail, Bell, Zap, Trophy, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Downloads = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Banking');
  const [activeBankingTab, setActiveBankingTab] = useState('previous-year');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const { toast } = useToast();

  const categories = [
    { id: 'Banking', name: 'Banking Exams', icon: Landmark, count: 125 },
    { id: 'SSC', name: 'SSC Exams', icon: Target, count: 38 },
    { id: 'Railway', name: 'Railway Exams', icon: Train, count: 25 },
    { id: 'UPSC', name: 'UPSC', icon: BookOpen, count: 30 },
    { id: 'TNPSC', name: 'TNPSC', icon: FileText, count: 18 },
    { id: 'Defence', name: 'Defence Exams', icon: Shield, count: 22 },
  ];

  const exams = [
    { id: 'ibps-po-pre', name: 'IBPS PO Prelims' },
    { id: 'ibps-po-main', name: 'IBPS PO Mains' },
    { id: 'sbi-po-pre', name: 'SBI PO Prelims' },
    { id: 'sbi-po-main', name: 'SBI PO Mains' },
    { id: 'rbi-grade-b', name: 'RBI Grade B' },
  ];

  const years = ['2025', '2024', '2023', '2022', '2021'];

  const bankingSyllabusPdfs = [
    { title: 'English Language PDF', icon: BookOpen },
    { title: 'Quantitative Aptitude PDF', icon: FileText },
    { title: 'Reasoning PDF', icon: Target },
    { title: 'Computer Awareness', icon: FileText },
    { title: 'Banking Awareness', icon: Landmark },
    { title: 'Descriptive Writing', icon: FileText },
    { title: 'Professional Knowledge', icon: Target },
    { title: 'JAIIB Free PDF', icon: Shield },
    { title: 'Hindi Language PDF', icon: BookOpen },
    { title: 'Free Bundle PDF', icon: Folder },
    { title: 'Prelims Exam Questions PDF', icon: FileText },
    { title: 'Bank Mains Exam Questions PDF', icon: FileText },
    { title: 'Interview Capsule', icon: GraduationCap },
    { title: 'General Awareness', icon: Globe },
    { title: 'Memory Based Question PDF', icon: FileText },
    { title: 'Static GK', icon: Globe },
    { title: 'Free Mock Test PDF', icon: Target },
  ];

  const bankingResources = {
    'previous-year': exams.map(exam => ({
      ...exam,
      years: years.map(year => ({
        year,
        pdfs: [
          { title: `${exam.name} ${year} - Question Paper`, size: '2.4 MB' },
          { title: `${exam.name} ${year} - Solutions`, size: '1.8 MB' }
        ]
      }))
    })),
    'syllabus': bankingSyllabusPdfs,
    'current-affairs': [
      { title: 'Monthly CA Magazine - Jan 2026', type: 'Premium' },
      { title: 'Weekly CA Snippets', type: 'Free' },
      { title: 'Daily News Capsule', type: 'Free' },
    ],
    'speed-improvement': [
      { title: 'Calculation Tricks for Quant', type: 'Free' },
      { title: 'Reading Comprehension Speed Guide', type: 'Free' },
      { title: 'Quick Reasoning Puzzles', type: 'Free' },
    ],
    'score-booster': [
      { title: 'Last Mile Revision Capsule', type: 'Free' },
      { title: 'High Frequency Topics Guide', type: 'Free' },
      { title: 'Error Spotting Masterclass PDF', type: 'Free' },
    ],
    'exam-wise': [
      { title: 'SBI PO 2025 Success Roadmap', type: 'Free' },
      { title: 'IBPS PO Mains Special Packet', type: 'Free' },
      { title: 'RRB Clerk Quick Revision', type: 'Free' },
    ]
  };

  const currentAffairsMagazines = [
    {
      id: 1,
      title: 'Current Affairs Monthly Magazine',
      month: 'January 2026',
      category: 'Banking',
      pages: 85,
      size: '12.5 MB',
      downloads: 15420,
      topics: ['Economy', 'Banking', 'Fintech', 'International'],
      new: true,
    },
    {
      id: 2,
      title: 'Banking awareness Capsule',
      month: 'Special 2025',
      category: 'Banking',
      pages: 120,
      size: '14.2 MB',
      downloads: 45620,
      topics: ['RBI Policies', 'Monetary Policy', 'Banking History'],
      new: true,
    }
  ];

  const previousYearPapers = [
    { id: 1, examName: 'SSC CGL Tier-1', year: '2024', category: 'SSC', papers: 3, withSolutions: true, downloads: 45620 },
    { id: 2, examName: 'RRB NTPC CBT-1', year: '2024', category: 'Railway', papers: 5, withSolutions: true, downloads: 48920 },
    { id: 3, examName: 'UPSC Prelims', year: '2024', category: 'UPSC', papers: 2, withSolutions: true, downloads: 85620 },
    { id: 4, examName: 'NDA', year: '2024', category: 'Defence', papers: 2, withSolutions: true, downloads: 38920 },
  ];

  const studyMaterials = [
    {
      id: 1,
      title: 'Quantitative Aptitude Formula Book',
      category: 'Banking',
      pages: 120,
      size: '8.5 MB',
      downloads: 125680,
      description: 'Complete formula book covering all topics for banking exams.',
    },
    {
      id: 2,
      title: 'Reasoning Shortcuts & Tricks',
      category: 'Banking',
      pages: 95,
      size: '7.2 MB',
      downloads: 98450,
      description: 'Time-saving shortcuts for puzzles and seating arrangements.',
    }
  ];

  const handleDownload = (title: string) => {
    toast({
      title: 'Download Started',
      description: `${title} is being downloaded...`,
    });
  };

  const filteredMagazines = currentAffairsMagazines.filter(mag =>
    selectedCategory === 'All' || mag.category === selectedCategory
  );

  const filteredMaterials = studyMaterials.filter(mat =>
    selectedCategory === 'All' || mat.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px] animate-bounce-slow" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <LandingHeader />

      <main className="max-w-[1600px] w-full mx-auto px-4 md:px-8 pt-2 pb-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            PrepSmart Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Downloads</span>
        </nav>

        {/* Header Section with Glassmorphism */}
        <header className="relative mb-6 p-8 rounded-[2rem] border border-white/20 bg-white/5 backdrop-blur-xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-xl shadow-primary/20">
                  <Download className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-0.5 rounded-full text-[10px] tracking-widest uppercase font-bold">
                    Resource Hub • Free
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Free <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">Downloads</span>
                  </h1>
                </div>
              </div>
              <p className="text-lg text-muted-foreground/80 max-w-2xl leading-relaxed">
                Access over 500+ curated PDFs including Previous Year Papers, specialized Syllabus guides, and Expert Capsules for Banking & Govt. Exams.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative group/search max-w-sm w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within/search:text-primary" />
                <Input
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/10 border-white/20 backdrop-blur-md rounded-xl focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
            {[
              { label: 'Total Downloads', value: '2.5M+', icon: Download },
              { label: 'PDF Resources', value: '500+', icon: FileText },
              { label: 'Exam Categories', value: '8', icon: Folder },
              { label: 'Updated Monthly', value: '50+', icon: Calendar },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 group/stat">
                <div className="p-2 bg-white/5 rounded-lg group-hover/stat:bg-primary/10 transition-colors">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* Enhanced Category Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-xl">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="gap-2 px-6 h-11 rounded-xl transition-all"
              >
                <cat.icon className="h-4 w-4" />
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {selectedCategory === 'Banking' ? (
          <Tabs value={activeBankingTab} onValueChange={setActiveBankingTab} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl backdrop-blur-md h-auto flex-wrap">
                <TabsTrigger value="previous-year" className="h-10">Previous Year Papers</TabsTrigger>
                <TabsTrigger value="syllabus" className="h-10">Syllabus</TabsTrigger>
                <TabsTrigger value="current-affairs" className="h-10">Current Affairs</TabsTrigger>
                <TabsTrigger value="speed-improvement" className="h-10">Speed Improvement</TabsTrigger>
                <TabsTrigger value="score-booster" className="h-10">Score Booster</TabsTrigger>
                <TabsTrigger value="exam-wise" className="h-10">Exam wise PDF</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="previous-year" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Select Exam</h3>
                  {exams.map(exam => (
                    <Button
                      key={exam.id}
                      variant={selectedExam === exam.id ? "default" : "outline"}
                      className="w-full justify-between"
                      onClick={() => setSelectedExam(exam.id)}
                    >
                      {exam.name}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ))}
                </div>

                <div className="lg:col-span-3">
                  {selectedExam ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                          <Folder className="h-5 w-5 text-primary" />
                          {exams.find(e => e.id === selectedExam)?.name} - Yearly Archives
                        </h3>
                        <Badge>{years.length} Years Available</Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {years.map(year => (
                          <Card key={year} className="hover:shadow-md transition-all border-white/10 group">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className="text-2xl font-bold text-primary">{year}</div>
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg group/item">
                                  <span className="text-sm font-medium">Prelims Question Paper</span>
                                  <Button size="sm" variant="ghost" onClick={() => handleDownload(`${year} Prelims Paper`)}><Download className="h-4 w-4" /></Button>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                  <span className="text-sm font-medium">Mains Question Paper</span>
                                  <Button size="sm" variant="ghost" onClick={() => handleDownload(`${year} Mains Paper`)}><Download className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                      <Target className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-xl font-bold">Select an Exam</h3>
                      <p className="text-muted-foreground">Choose an exam from the list to view year-wise question papers</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="syllabus" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bankingSyllabusPdfs.map((pdf, i) => (
                  <Card key={i} className="hover:shadow-xl transition-all border-white/10 group hover:-translate-y-1">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                        <pdf.icon className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-sm mb-4">{pdf.title}</h4>
                      <Button size="sm" className="w-full" variant="outline" onClick={() => handleDownload(pdf.title)}>
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="current-affairs" className="grid md:grid-cols-3 gap-6">
              {bankingResources['current-affairs'].map((item, i) => (
                <Card key={i} className="border-white/10 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="p-3 bg-red-500/10 rounded-xl w-fit mb-4">
                      <FileText className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <Badge className="mb-4">{item.type}</Badge>
                    <Button className="w-full mt-4" onClick={() => handleDownload(item.title)}>Download PDF</Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="speed-improvement" className="grid md:grid-cols-3 gap-6">
              {bankingResources['speed-improvement'].map((item, i) => (
                <Card key={i} className="border-white/10 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <Badge variant="outline" className="mb-4">{item.type}</Badge>
                    <Button className="w-full mt-4" onClick={() => handleDownload(item.title)}>Download Now</Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="score-booster" className="grid md:grid-cols-3 gap-6">
              {bankingResources['score-booster'].map((item, i) => (
                <Card key={i} className="border-white/10 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="p-3 bg-indigo-500/10 rounded-xl w-fit mb-4">
                      <Trophy className="h-6 w-6 text-indigo-500" />
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <Badge variant="outline" className="mb-4">{item.type}</Badge>
                    <Button className="w-full mt-4" onClick={() => handleDownload(item.title)}>Download Now</Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="exam-wise" className="grid md:grid-cols-3 gap-6">
              {bankingResources['exam-wise'].map((item, i) => (
                <Card key={i} className="border-white/10 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4">
                      <Layers className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <Badge variant="outline" className="mb-4">{item.type}</Badge>
                    <Button className="w-full mt-4" onClick={() => handleDownload(item.title)}>Download Now</Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-12">
            <Tabs defaultValue="magazines" className="space-y-8">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="magazines">Magazines</TabsTrigger>
                <TabsTrigger value="papers">Papers</TabsTrigger>
                <TabsTrigger value="materials">Study Materials</TabsTrigger>
              </TabsList>

              <TabsContent value="magazines" className="grid md:grid-cols-3 gap-6">
                {filteredMagazines.map((magazine, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 text-center">
                      <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg mt-3">{magazine.title}</CardTitle>
                      <p className="text-primary font-medium">{magazine.month}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {magazine.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{magazine.downloads.toLocaleString()} dl</span>
                        <Button size="sm" onClick={() => handleDownload(magazine.title)}>Download</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="papers" className="grid md:grid-cols-4 gap-4">
                {previousYearPapers.filter(p => p.category === selectedCategory).map((paper, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-sm mb-1">{paper.examName}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{paper.year}</p>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => handleDownload(paper.examName)}>Download</Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="materials" className="grid md:grid-cols-3 gap-6">
                {filteredMaterials.map((material, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{material.title}</h3>
                          <Badge variant="secondary" className="text-xs">{material.category}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{material.description}</p>
                      <Button className="w-full" onClick={() => handleDownload(material.title)}>Download</Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* CTA Section */}
        <section className="mt-16 p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -ml-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Want More Premium Resources?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg leading-relaxed">
              Upgrade to our premium plans to access exclusive study materials, video courses,
              and personalized preparation strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button size="lg" className="h-14 px-10 rounded-2xl shadow-xl shadow-primary/20">View Premium Plans</Button>
              </Link>
              <Link to="/blog">
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-white/20 bg-white/5 hover:bg-white/10">Read Our Blog</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Downloads;
