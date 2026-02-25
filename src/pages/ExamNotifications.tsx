import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExamCalendarView from '@/components/exam-notifications/ExamCalendarView';
import {
  Bell,
  Calendar,
  FileText,
  ExternalLink,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Building2,
  GraduationCap,
  Train,
  Shield,
  Landmark,
  BookOpen,
  TrendingUp,
  Users
} from 'lucide-react';

interface ExamNotification {
  id: string;
  examName: string;
  category: string;
  categoryIcon: React.ReactNode;
  applicationStart: string;
  applicationEnd: string;
  examDate: string;
  resultDate?: string;
  admitCardDate?: string;
  status: 'upcoming' | 'ongoing' | 'closed' | 'result-declared';
  vacancies?: number;
  eligibility: string;
  officialLink: string;
  lastUpdated: string;
  isNew: boolean;
  isHot: boolean;
}

const examCategories = [
  { id: 'all', name: 'All Exams', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'banking', name: 'Banking', icon: <Building2 className="h-4 w-4" /> },
  { id: 'ssc', name: 'SSC', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'railway', name: 'Railway', icon: <Train className="h-4 w-4" /> },
  { id: 'upsc', name: 'UPSC', icon: <Landmark className="h-4 w-4" /> },
  { id: 'defence', name: 'Defence', icon: <Shield className="h-4 w-4" /> },
  { id: 'tnpsc', name: 'TNPSC', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'regulatory', name: 'Regulatory', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'mba', name: 'MBA', icon: <Users className="h-4 w-4" /> },
  { id: 'mba', name: 'MBA', icon: <Users className="h-4 w-4" /> },
];

const examLogos: Record<string, string> = {
  'banking': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  'ibps': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
  'sbi': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  'rrb': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  'ssc': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
  'railway': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  'upsc': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
  'rbi': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
  'regulatory': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
  'defence': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
  'tnpsc': 'https://upload.wikimedia.org/wikipedia/commons/8/81/TamilNadu_Logo.svg',
  'mba': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IIM_Bangalore_Logo.png'
};

const getExamLogo = (exam: ExamNotification): string => {
  const examNameLower = exam.examName.toLowerCase();

  if (examNameLower.includes('ibps')) return examLogos['ibps'];
  if (examNameLower.includes('sbi')) return examLogos['sbi'];
  if (examNameLower.includes('rrb') || examNameLower.includes('railway')) return examLogos['railway'];
  if (examNameLower.includes('ssc')) return examLogos['ssc'];
  if (examNameLower.includes('upsc')) return examLogos['upsc'];
  if (examNameLower.includes('rbi')) return examLogos['rbi'];

  if (examLogos[exam.category]) return examLogos[exam.category];
  return examLogos['banking'];
};

const examNotifications: ExamNotification[] = [
  // Banking Exams
  {
    id: 'ibps-po-2025',
    examName: 'IBPS PO 2025',
    category: 'banking',
    categoryIcon: <Building2 className="h-4 w-4" />,
    applicationStart: '01 Jun 2025',
    applicationEnd: '30 Jun 2025',
    examDate: '10 Sep 2025',
    admitCardDate: '25 Aug 2025',
    status: 'upcoming',
    vacancies: 4500,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://www.ibps.in',
    lastUpdated: '2 hours ago',
    isNew: true,
    isHot: true
  },
  {
    id: 'sbi-clerk-2025',
    examName: 'SBI Clerk 2025',
    category: 'banking',
    categoryIcon: <Building2 className="h-4 w-4" />,
    applicationStart: '20 May 2025',
    applicationEnd: '10 Jun 2025',
    examDate: '15 Aug 2025',
    admitCardDate: '01 Aug 2025',
    status: 'ongoing',
    vacancies: 8000,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://sbi.co.in/careers',
    lastUpdated: '5 hours ago',
    isNew: false,
    isHot: true
  },
  {
    id: 'rbi-grade-b-2025',
    examName: 'RBI Grade B 2025',
    category: 'banking',
    categoryIcon: <Building2 className="h-4 w-4" />,
    applicationStart: '15 Jul 2025',
    applicationEnd: '05 Aug 2025',
    examDate: '20 Oct 2025',
    admitCardDate: '05 Oct 2025',
    status: 'upcoming',
    vacancies: 300,
    eligibility: 'Graduate with 60% marks',
    officialLink: 'https://rbi.org.in/careers',
    lastUpdated: '1 day ago',
    isNew: true,
    isHot: false
  },
  {
    id: 'nabard-grade-a-2025',
    examName: 'NABARD Grade A 2025',
    category: 'banking',
    categoryIcon: <Building2 className="h-4 w-4" />,
    applicationStart: '01 Aug 2025',
    applicationEnd: '25 Aug 2025',
    examDate: '15 Nov 2025',
    status: 'upcoming',
    vacancies: 150,
    eligibility: 'Graduate with relevant experience',
    officialLink: 'https://nabard.org/careers',
    lastUpdated: '3 days ago',
    isNew: false,
    isHot: false
  },
  // SSC Exams
  {
    id: 'ssc-cgl-2025',
    examName: 'SSC CGL 2025',
    category: 'ssc',
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    applicationStart: '15 Jun 2025',
    applicationEnd: '15 Jul 2025',
    examDate: '20 Sep 2025',
    admitCardDate: '05 Sep 2025',
    status: 'ongoing',
    vacancies: 12000,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://ssc.nic.in',
    lastUpdated: '4 hours ago',
    isNew: false,
    isHot: true
  },
  {
    id: 'ssc-chsl-2025',
    examName: 'SSC CHSL 2025',
    category: 'ssc',
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    applicationStart: '10 Jul 2025',
    applicationEnd: '10 Aug 2025',
    examDate: '15 Oct 2025',
    status: 'upcoming',
    vacancies: 5000,
    eligibility: '12th Pass',
    officialLink: 'https://ssc.nic.in',
    lastUpdated: '1 day ago',
    isNew: true,
    isHot: false
  },
  {
    id: 'ssc-mts-2025',
    examName: 'SSC MTS 2025',
    category: 'ssc',
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    applicationStart: '01 Aug 2025',
    applicationEnd: '30 Aug 2025',
    examDate: '01 Nov 2025',
    status: 'upcoming',
    vacancies: 8000,
    eligibility: '10th Pass',
    officialLink: 'https://ssc.nic.in',
    lastUpdated: '2 days ago',
    isNew: false,
    isHot: false
  },
  // Railway Exams
  {
    id: 'rrb-ntpc-2025',
    examName: 'RRB NTPC 2025',
    category: 'railway',
    categoryIcon: <Train className="h-4 w-4" />,
    applicationStart: '01 Aug 2025',
    applicationEnd: '30 Aug 2025',
    examDate: '15 Nov 2025',
    status: 'upcoming',
    vacancies: 35000,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://www.rrbcdg.gov.in',
    lastUpdated: '6 hours ago',
    isNew: true,
    isHot: true
  },
  {
    id: 'rrb-group-d-2025',
    examName: 'RRB Group D 2025',
    category: 'railway',
    categoryIcon: <Train className="h-4 w-4" />,
    applicationStart: '15 Aug 2025',
    applicationEnd: '15 Sep 2025',
    examDate: '25 Nov 2025',
    status: 'upcoming',
    vacancies: 100000,
    eligibility: '10th Pass + ITI',
    officialLink: 'https://www.rrbcdg.gov.in',
    lastUpdated: '1 day ago',
    isNew: false,
    isHot: true
  },
  {
    id: 'rrb-alp-2025',
    examName: 'RRB ALP 2025',
    category: 'railway',
    categoryIcon: <Train className="h-4 w-4" />,
    applicationStart: '20 Sep 2025',
    applicationEnd: '20 Oct 2025',
    examDate: '15 Dec 2025',
    status: 'upcoming',
    vacancies: 25000,
    eligibility: '10th Pass + ITI/Diploma',
    officialLink: 'https://www.rrbcdg.gov.in',
    lastUpdated: '3 days ago',
    isNew: false,
    isHot: false
  },
  // UPSC Exams
  {
    id: 'upsc-cse-2025',
    examName: 'UPSC Civil Services 2025',
    category: 'upsc',
    categoryIcon: <Landmark className="h-4 w-4" />,
    applicationStart: '15 Feb 2025',
    applicationEnd: '05 Mar 2025',
    examDate: '25 May 2025',
    resultDate: '15 Jul 2025',
    status: 'result-declared',
    vacancies: 1000,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://upsc.gov.in',
    lastUpdated: '3 hours ago',
    isNew: false,
    isHot: true
  },
  {
    id: 'upsc-cds-2025',
    examName: 'UPSC CDS II 2025',
    category: 'upsc',
    categoryIcon: <Landmark className="h-4 w-4" />,
    applicationStart: '20 Jun 2025',
    applicationEnd: '20 Jul 2025',
    examDate: '10 Sep 2025',
    status: 'ongoing',
    vacancies: 450,
    eligibility: 'Graduate for IMA/OTA',
    officialLink: 'https://upsc.gov.in',
    lastUpdated: '12 hours ago',
    isNew: false,
    isHot: false
  },
  {
    id: 'upsc-nda-2025',
    examName: 'UPSC NDA II 2025',
    category: 'upsc',
    categoryIcon: <Landmark className="h-4 w-4" />,
    applicationStart: '10 Jun 2025',
    applicationEnd: '10 Jul 2025',
    examDate: '05 Sep 2025',
    status: 'ongoing',
    vacancies: 400,
    eligibility: '12th Pass (Science)',
    officialLink: 'https://upsc.gov.in',
    lastUpdated: '1 day ago',
    isNew: false,
    isHot: false
  },
  // Defence Exams
  {
    id: 'afcat-2025',
    examName: 'AFCAT 02/2025',
    category: 'defence',
    categoryIcon: <Shield className="h-4 w-4" />,
    applicationStart: '15 Jun 2025',
    applicationEnd: '15 Jul 2025',
    examDate: '25 Aug 2025',
    status: 'ongoing',
    vacancies: 300,
    eligibility: 'Graduate with 60% marks',
    officialLink: 'https://afcat.cdac.in',
    lastUpdated: '8 hours ago',
    isNew: false,
    isHot: true
  },
  {
    id: 'territorial-army-2025',
    examName: 'Territorial Army Officer 2025',
    category: 'defence',
    categoryIcon: <Shield className="h-4 w-4" />,
    applicationStart: '01 Jul 2025',
    applicationEnd: '31 Jul 2025',
    examDate: '15 Sep 2025',
    status: 'upcoming',
    vacancies: 200,
    eligibility: 'Graduate, age 18-42 years',
    officialLink: 'https://joinindianarmy.nic.in',
    lastUpdated: '2 days ago',
    isNew: true,
    isHot: false
  },
  // TNPSC Exams
  {
    id: 'tnpsc-group-1-2025',
    examName: 'TNPSC Group 1 2025',
    category: 'tnpsc',
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    applicationStart: '01 Jul 2025',
    applicationEnd: '31 Jul 2025',
    examDate: '15 Oct 2025',
    status: 'upcoming',
    vacancies: 500,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://tnpsc.gov.in',
    lastUpdated: '5 hours ago',
    isNew: true,
    isHot: true
  },
  {
    id: 'tnpsc-group-2-2025',
    examName: 'TNPSC Group 2 2025',
    category: 'tnpsc',
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    applicationStart: '15 Aug 2025',
    applicationEnd: '15 Sep 2025',
    examDate: '20 Nov 2025',
    status: 'upcoming',
    vacancies: 2500,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://tnpsc.gov.in',
    lastUpdated: '1 day ago',
    isNew: false,
    isHot: false
  },
  {
    id: 'tnpsc-group-4-2025',
    examName: 'TNPSC Group 4 2025',
    category: 'tnpsc',
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    applicationStart: '01 Sep 2025',
    applicationEnd: '30 Sep 2025',
    examDate: '15 Dec 2025',
    status: 'upcoming',
    vacancies: 6000,
    eligibility: '10th/12th Pass',
    officialLink: 'https://tnpsc.gov.in',
    lastUpdated: '3 days ago',
    isNew: false,
    isHot: false
  },
  // Regulatory Exams
  {
    id: 'sebi-grade-a-2025',
    examName: 'SEBI Grade A 2025',
    category: 'regulatory',
    categoryIcon: <TrendingUp className="h-4 w-4" />,
    applicationStart: '10 Jul 2025',
    applicationEnd: '05 Aug 2025',
    examDate: '20 Sep 2025',
    status: 'upcoming',
    vacancies: 100,
    eligibility: 'Graduate with 60% marks',
    officialLink: 'https://sebi.gov.in',
    lastUpdated: '4 hours ago',
    isNew: true,
    isHot: true
  },
  {
    id: 'irda-ao-2025',
    examName: 'IRDA AO 2025',
    category: 'regulatory',
    categoryIcon: <TrendingUp className="h-4 w-4" />,
    applicationStart: '20 Aug 2025',
    applicationEnd: '15 Sep 2025',
    examDate: '10 Nov 2025',
    status: 'upcoming',
    vacancies: 50,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://irdai.gov.in',
    lastUpdated: '2 days ago',
    isNew: false,
    isHot: false
  },
  // MBA Exams
  {
    id: 'cat-2025',
    examName: 'CAT 2025',
    category: 'mba',
    categoryIcon: <Users className="h-4 w-4" />,
    applicationStart: '01 Aug 2025',
    applicationEnd: '15 Sep 2025',
    examDate: '24 Nov 2025',
    status: 'upcoming',
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://iimcat.ac.in',
    lastUpdated: '6 hours ago',
    isNew: true,
    isHot: true
  },
  {
    id: 'xat-2026',
    examName: 'XAT 2026',
    category: 'mba',
    categoryIcon: <Users className="h-4 w-4" />,
    applicationStart: '15 Aug 2025',
    applicationEnd: '30 Nov 2025',
    examDate: '05 Jan 2026',
    status: 'upcoming',
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://xatonline.in',
    lastUpdated: '1 day ago',
    isNew: false,
    isHot: false
  },
  {
    id: 'mat-2025',
    examName: 'MAT September 2025',
    category: 'mba',
    categoryIcon: <Users className="h-4 w-4" />,
    applicationStart: '01 Jul 2025',
    applicationEnd: '20 Aug 2025',
    examDate: '01 Sep 2025',
    status: 'ongoing',
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://mat.aima.in',
    lastUpdated: '12 hours ago',
    isNew: false,
    isHot: false
  },
  // Additional exams for June-September 2025
  {
    id: 'ibps-clerk-2025',
    examName: 'IBPS Clerk 2025',
    category: 'banking',
    categoryIcon: <Building2 className="h-4 w-4" />,
    applicationStart: '05 Jun 2025',
    applicationEnd: '25 Jun 2025',
    examDate: '10 Aug 2025',
    admitCardDate: '28 Jul 2025',
    status: 'ongoing',
    vacancies: 6000,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://www.ibps.in',
    lastUpdated: '3 hours ago',
    isNew: true,
    isHot: true
  },
  {
    id: 'sbi-po-2025',
    examName: 'SBI PO 2025',
    category: 'banking',
    categoryIcon: <Building2 className="h-4 w-4" />,
    applicationStart: '10 Jun 2025',
    applicationEnd: '30 Jun 2025',
    examDate: '20 Aug 2025',
    admitCardDate: '05 Aug 2025',
    status: 'ongoing',
    vacancies: 2000,
    eligibility: 'Graduate with 60% marks',
    officialLink: 'https://sbi.co.in/careers',
    lastUpdated: '1 hour ago',
    isNew: true,
    isHot: true
  },
  {
    id: 'ssc-je-2025',
    examName: 'SSC JE 2025',
    category: 'ssc',
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    applicationStart: '01 Jul 2025',
    applicationEnd: '25 Jul 2025',
    examDate: '15 Sep 2025',
    admitCardDate: '01 Sep 2025',
    status: 'upcoming',
    vacancies: 1500,
    eligibility: 'Engineering Degree/Diploma',
    officialLink: 'https://ssc.nic.in',
    lastUpdated: '2 days ago',
    isNew: false,
    isHot: true
  },
  {
    id: 'ssc-stenographer-2025',
    examName: 'SSC Stenographer 2025',
    category: 'ssc',
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    applicationStart: '15 Jul 2025',
    applicationEnd: '10 Aug 2025',
    examDate: '25 Sep 2025',
    status: 'upcoming',
    vacancies: 1200,
    eligibility: '12th Pass',
    officialLink: 'https://ssc.nic.in',
    lastUpdated: '1 day ago',
    isNew: true,
    isHot: false
  },
  {
    id: 'rrb-je-2025',
    examName: 'RRB JE 2025',
    category: 'railway',
    categoryIcon: <Train className="h-4 w-4" />,
    applicationStart: '20 Jun 2025',
    applicationEnd: '20 Jul 2025',
    examDate: '05 Sep 2025',
    admitCardDate: '22 Aug 2025',
    status: 'upcoming',
    vacancies: 5000,
    eligibility: 'Engineering Degree/Diploma',
    officialLink: 'https://www.rrbcdg.gov.in',
    lastUpdated: '4 hours ago',
    isNew: true,
    isHot: true
  },
  {
    id: 'upsc-ese-2025',
    examName: 'UPSC ESE 2025',
    category: 'upsc',
    categoryIcon: <Landmark className="h-4 w-4" />,
    applicationStart: '01 Aug 2025',
    applicationEnd: '31 Aug 2025',
    examDate: '15 Oct 2025',
    status: 'upcoming',
    vacancies: 350,
    eligibility: 'Engineering Degree',
    officialLink: 'https://upsc.gov.in',
    lastUpdated: '6 hours ago',
    isNew: true,
    isHot: false
  },
  {
    id: 'upsc-capf-2025',
    examName: 'UPSC CAPF AC 2025',
    category: 'upsc',
    categoryIcon: <Landmark className="h-4 w-4" />,
    applicationStart: '10 Jul 2025',
    applicationEnd: '10 Aug 2025',
    examDate: '20 Sep 2025',
    status: 'upcoming',
    vacancies: 400,
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://upsc.gov.in',
    lastUpdated: '5 hours ago',
    isNew: false,
    isHot: true
  },
  {
    id: 'navy-ssr-2025',
    examName: 'Indian Navy SSR 2025',
    category: 'defence',
    categoryIcon: <Shield className="h-4 w-4" />,
    applicationStart: '25 Jun 2025',
    applicationEnd: '25 Jul 2025',
    examDate: '10 Sep 2025',
    status: 'upcoming',
    vacancies: 3000,
    eligibility: '12th Pass (Science)',
    officialLink: 'https://joinindiannavy.gov.in',
    lastUpdated: '7 hours ago',
    isNew: true,
    isHot: true
  },
  {
    id: 'nda-2-2025',
    examName: 'NDA & NA II 2025',
    category: 'defence',
    categoryIcon: <Shield className="h-4 w-4" />,
    applicationStart: '15 Jun 2025',
    applicationEnd: '15 Jul 2025',
    examDate: '01 Sep 2025',
    admitCardDate: '18 Aug 2025',
    status: 'ongoing',
    vacancies: 400,
    eligibility: '12th Pass',
    officialLink: 'https://upsc.gov.in',
    lastUpdated: '2 hours ago',
    isNew: false,
    isHot: true
  },
  {
    id: 'tnpsc-vao-2025',
    examName: 'TNPSC VAO 2025',
    category: 'tnpsc',
    categoryIcon: <GraduationCap className="h-4 w-4" />,
    applicationStart: '20 Jul 2025',
    applicationEnd: '20 Aug 2025',
    examDate: '25 Sep 2025',
    status: 'upcoming',
    vacancies: 1500,
    eligibility: '10th Pass',
    officialLink: 'https://tnpsc.gov.in',
    lastUpdated: '1 day ago',
    isNew: true,
    isHot: false
  },
  {
    id: 'fci-manager-2025',
    examName: 'FCI Manager 2025',
    category: 'regulatory',
    categoryIcon: <TrendingUp className="h-4 w-4" />,
    applicationStart: '01 Aug 2025',
    applicationEnd: '25 Aug 2025',
    examDate: '15 Oct 2025',
    status: 'upcoming',
    vacancies: 300,
    eligibility: 'Graduate in relevant field',
    officialLink: 'https://fci.gov.in',
    lastUpdated: '3 days ago',
    isNew: false,
    isHot: false
  },
  {
    id: 'snap-2025',
    examName: 'SNAP 2025',
    category: 'mba',
    categoryIcon: <Users className="h-4 w-4" />,
    applicationStart: '10 Jul 2025',
    applicationEnd: '20 Sep 2025',
    examDate: '15 Dec 2025',
    status: 'upcoming',
    eligibility: 'Graduate in any discipline',
    officialLink: 'https://snaptest.org',
    lastUpdated: '8 hours ago',
    isNew: true,
    isHot: false
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'upcoming':
      return <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 gap-1"><Clock className="h-3 w-3" />Upcoming</Badge>;
    case 'ongoing':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Applications Open</Badge>;
    case 'closed':
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Closed</Badge>;
    case 'result-declared':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1"><CheckCircle className="h-3 w-3" />Result Declared</Badge>;
    default:
      return null;
  }
};

const ExamNotifications = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const filteredNotifications = examNotifications.filter(exam => {
    const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
    const matchesSearch = exam.examName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'ongoing' && exam.status === 'ongoing') ||
      (selectedStatus === 'upcoming' && exam.status === 'upcoming') ||
      (selectedStatus === 'results' && exam.status === 'result-declared') ||
      (selectedStatus === 'admitcard' && exam.admitCardDate);
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const stats = {
    total: examNotifications.length,
    ongoing: examNotifications.filter(e => e.status === 'ongoing').length,
    upcoming: examNotifications.filter(e => e.status === 'upcoming').length,
    results: examNotifications.filter(e => e.status === 'result-declared').length,
    admitCards: examNotifications.filter(e => e.admitCardDate).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative pt-2 pb-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                  <div className="relative p-2 bg-primary/20 rounded-2xl">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1 text-xs gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Updates
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 tracking-tight">
                Exam <span className="text-primary">Notifications</span> & Alerts
              </h1>
              <p className="text-sm text-muted-foreground mb-3 max-w-2xl mx-auto">
                Stay updated with real-time exam dates, admit cards, results, and important deadlines
                for all major government and competitive exams.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
                <Card
                  className={`cursor-pointer transition-all duration-200 ${selectedStatus === 'all'
                    ? 'bg-primary/20 border-primary/50 ring-2 ring-primary'
                    : 'bg-card/60 backdrop-blur border-border/50 hover:border-primary/30'
                    }`}
                  onClick={() => setSelectedStatus('all')}
                >
                  <CardContent className="p-2 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="h-4 w-4 text-primary mr-1.5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-xl font-bold text-foreground mb-0.5">{stats.total}</div>
                    <div className="text-[10px] text-muted-foreground">Total Exams</div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all duration-200 ${selectedStatus === 'ongoing'
                    ? 'bg-emerald-500/30 border-emerald-500/60 ring-2 ring-emerald-500'
                    : 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur border-emerald-500/30 hover:border-emerald-400/50'
                    }`}
                  onClick={() => setSelectedStatus('ongoing')}
                >
                  <CardContent className="p-2 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-1.5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-xl font-bold text-emerald-400 mb-0.5">{stats.ongoing}</div>
                    <div className="text-[10px] text-muted-foreground">Applications Open</div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all duration-200 ${selectedStatus === 'upcoming'
                    ? 'bg-sky-500/30 border-sky-500/60 ring-2 ring-sky-500'
                    : 'bg-gradient-to-br from-sky-500/10 to-sky-600/5 backdrop-blur border-sky-500/30 hover:border-sky-400/50'
                    }`}
                  onClick={() => setSelectedStatus('upcoming')}
                >
                  <CardContent className="p-2 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 text-sky-400 mr-1.5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-xl font-bold text-sky-400 mb-0.5">{stats.upcoming}</div>
                    <div className="text-[10px] text-muted-foreground">Upcoming</div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all duration-200 ${selectedStatus === 'results'
                    ? 'bg-amber-500/30 border-amber-500/60 ring-2 ring-amber-500'
                    : 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur border-amber-500/30 hover:border-amber-400/50'
                    }`}
                  onClick={() => setSelectedStatus('results')}
                >
                  <CardContent className="p-2 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-4 w-4 text-amber-400 mr-1.5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-xl font-bold text-amber-400 mb-0.5">{stats.results}</div>
                    <div className="text-[10px] text-muted-foreground">Results Out</div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all duration-200 ${selectedStatus === 'admitcard'
                    ? 'bg-violet-500/30 border-violet-500/60 ring-2 ring-violet-500'
                    : 'bg-gradient-to-br from-violet-500/10 to-violet-600/5 backdrop-blur border-violet-500/30 hover:border-violet-400/50'
                    }`}
                  onClick={() => setSelectedStatus('admitcard')}
                >
                  <CardContent className="p-2 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Download className="h-4 w-4 text-violet-400 mr-1.5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-xl font-bold text-violet-400 mb-0.5">{stats.admitCards}</div>
                    <div className="text-[10px] text-muted-foreground">Admit Cards</div>
                  </CardContent>
                </Card>
              </div>

              {/* Last Update Indicator */}
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full mb-4">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>

              {/* Search Box */}
              <div className="relative w-full max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-sm bg-background"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-2 border-b border-border/50 bg-card/30">
          <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {examCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-1.5 h-8 text-xs"
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* View Toggle & Content */}
        <section className="py-6">
          <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8">
            <Tabs
              defaultValue="list"
              className="w-full"
              onValueChange={(value) => {
                // Sync stats card selection when tab changes
                if (value === 'admitcard') {
                  setSelectedStatus('admitcard');
                } else if (value === 'list' || value === 'calendar') {
                  // Reset to 'all' when switching to list or calendar view
                  // unless already filtered
                }
              }}
            >
              <div className="flex justify-center mb-4">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="list" className="gap-2">
                    <FileText className="h-4 w-4" />
                    List View
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar View
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="list">
                <div className="grid gap-6">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((exam) => (
                      <Card
                        key={exam.id}
                        className="bg-card hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Left Section - Exam Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/50 p-1">
                                  <img
                                    src={getExamLogo(exam)}
                                    alt={exam.examName}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp';
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-semibold text-foreground leading-tight">{exam.examName}</h3>
                                    {exam.isNew && (
                                      <Badge className="bg-red-500 text-white text-[10px] h-4 py-0">NEW</Badge>
                                    )}
                                    {exam.isHot && (
                                      <Badge className="bg-orange-500 text-white text-[10px] h-4 py-0">HOT</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground capitalize">{exam.category} Exam</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                {getStatusBadge(exam.status)}
                                {exam.vacancies && (
                                  <Badge variant="outline" className="text-[10px] py-0 h-4 text-indigo-600 dark:text-indigo-400 border-indigo-200 bg-indigo-50/30">
                                    <span className="font-bold text-indigo-700 dark:text-indigo-300 mr-1">{exam.vacancies.toLocaleString()}</span> Vacancies
                                  </Badge>
                                )}
                              </div>

                              <div className="p-2 rounded-md bg-muted/30 border border-border/50 mb-2">
                                <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider mb-1">Education/Eligibility</p>
                                <p className="text-xs font-semibold text-foreground leading-tight">{exam.eligibility}</p>
                              </div>
                            </div>

                            {/* Middle Section - Conditional Layout */}
                            {selectedStatus === 'admitcard' ? (
                              <div className="text-center p-4 rounded-lg bg-violet-100/80 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
                                <FileText className="h-6 w-6 mx-auto mb-2 text-violet-600 dark:text-violet-400" />
                                <div className="text-xs text-muted-foreground mb-1">Admit Card Available</div>
                                <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{exam.admitCardDate}</div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                                <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/10">
                                  <Calendar className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                                  <div className="text-[10px] text-muted-foreground mb-0.5">Apply Start</div>
                                  <div className="text-xs font-medium text-foreground">{exam.applicationStart}</div>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/10">
                                  <AlertCircle className="h-3.5 w-3.5 mx-auto mb-1 text-red-400" />
                                  <div className="text-[10px] text-muted-foreground mb-0.5">Apply End</div>
                                  <div className="text-xs font-medium text-foreground">{exam.applicationEnd}</div>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/10">
                                  <FileText className="h-3.5 w-3.5 mx-auto mb-1 text-blue-400" />
                                  <div className="text-[10px] text-muted-foreground mb-0.5">Exam Date</div>
                                  <div className="text-xs font-medium text-foreground">{exam.examDate}</div>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/10">
                                  <CheckCircle className="h-3.5 w-3.5 mx-auto mb-1 text-green-400" />
                                  <div className="text-[10px] text-muted-foreground mb-0.5">
                                    {exam.resultDate ? 'Result' : exam.admitCardDate ? 'Admit Card' : 'Status'}
                                  </div>
                                  <div className="text-xs font-medium text-foreground">
                                    {exam.resultDate || exam.admitCardDate || 'TBA'}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Right Section - Actions */}
                            <div className="flex flex-col gap-2 lg:min-w-[140px]">
                              {selectedStatus === 'admitcard' ? (
                                <Button className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25" asChild>
                                  <a href={exam.officialLink} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                    Download
                                  </a>
                                </Button>
                              ) : exam.status === 'result-declared' ? (
                                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25" asChild>
                                  <a href={exam.officialLink} target="_blank" rel="noopener noreferrer">
                                    <CheckCircle className="h-4 w-4" />
                                    View Result
                                  </a>
                                </Button>
                              ) : exam.status === 'ongoing' ? (
                                <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25" asChild>
                                  <a href={exam.officialLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                    Apply Now
                                  </a>
                                </Button>
                              ) : (
                                <Button className="gap-2" variant="outline" asChild>
                                  <a href={exam.officialLink} target="_blank" rel="noopener noreferrer">
                                    <Bell className="h-4 w-4" />
                                    Set Reminder
                                  </a>
                                </Button>
                              )}
                              {selectedStatus !== 'admitcard' && (
                                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 border-0" size="sm">
                                  <Download className="h-4 w-4" />
                                  Notification
                                </Button>
                              )}
                              <div className="text-xs text-center text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {exam.lastUpdated}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No notifications found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="calendar">
                <ExamCalendarView notifications={filteredNotifications} />
              </TabsContent>

            </Tabs>
          </div>
        </section>

        {/* Important Deadlines Section */}
        <section className="py-16 bg-gradient-to-br from-red-500/10 via-background to-orange-500/10">
          <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">⚠️ Upcoming Deadlines</h2>
              <p className="text-muted-foreground">Don't miss these important application deadlines</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examNotifications
                .filter(e => e.status === 'ongoing')
                .slice(0, 6)
                .map((exam) => (
                  <Card key={exam.id} className="bg-card border-red-500/30 hover:border-red-500/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-red-500/20">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{exam.examName}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{exam.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Last Date to Apply</div>
                          <div className="text-lg font-bold text-red-400">{exam.applicationEnd}</div>
                        </div>
                        <Button size="sm" variant="destructive" asChild>
                          <a href={exam.officialLink} target="_blank" rel="noopener noreferrer">
                            Apply Now
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>

        {/* Subscribe Section */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Never Miss an Update
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get instant notifications for new exam announcements, application deadlines,
                  admit cards, and results directly in your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Input
                    placeholder="Enter your email"
                    className="max-w-xs bg-background"
                  />
                  <Button className="gap-2">
                    <Bell className="h-4 w-4" />
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ExamNotifications;
