import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Phone,
  MessageCircle,
  Mail,
  UserCheck,
  Headphones,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface SupportTeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  subject?: string;
  phone: string;
  whatsapp: string;
  email: string;
  isPersonalMentor?: boolean;
  tier: 'support' | 'lead' | 'personal';
}

const TEAM_MEMBERS: SupportTeamMember[] = [
  {
    id: 'm1',
    name: 'Mr. Gokul Kannan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    role: 'Technical Team',
    phone: '+919876543210',
    whatsapp: '919876543210',
    email: 'support@examerit.com',
    tier: 'support'
  },
  {
    id: 'm2',
    name: 'Mr. Jagathishan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'Mentorship Head',
    phone: '+919876543211',
    whatsapp: '919876543211',
    email: 'head.mentorship@examerit.com',
    tier: 'support'
  },
  {
    id: 'm3',
    name: 'Sakthi Prakash',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'Lead Mentor',
    subject: 'Quantitative Aptitude',
    phone: '+919876543212',
    whatsapp: '919876543212',
    email: 'sakthi.quant@examerit.com',
    tier: 'lead'
  },
  {
    id: 'm4',
    name: 'Sivakumar A',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'Dedicated Mentor',
    subject: 'Reasoning & Overall Prep',
    phone: '+919876543213',
    whatsapp: '919876543213',
    email: 'sivakumar.mentor@examerit.com',
    isPersonalMentor: true,
    tier: 'personal'
  }
];

const YourMentorsPage: React.FC = () => {
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsapp = (number: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, I am a student on Examerit and need guidance regarding my mentorship plan.`);
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  const handleEmail = (email: string, name: string) => {
    window.open(`mailto:${email}?subject=Mentorship Guidance Request - Examerit&body=Hi ${name},`, '_blank');
  };

  const MentorSupportCard: React.FC<{ member: SupportTeamMember }> = ({ member }) => {
    return (
      <div className="relative pt-7 w-full">
        <Card className={`relative bg-white rounded-2xl border-t-4 shadow-sm hover:shadow-md transition-all duration-300 ${
          member.isPersonalMentor 
            ? 'border-t-blue-600 border-x-blue-100 border-b-blue-100 ring-2 ring-blue-500/20' 
            : member.tier === 'lead' 
            ? 'border-t-purple-600 border-slate-200' 
            : 'border-t-indigo-500 border-slate-200'
        }`}>
          {/* Overlapping Top Circular Avatar */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
            <div className={`relative rounded-full p-1 bg-white shadow-md ${
              member.isPersonalMentor ? 'ring-4 ring-emerald-500' : 'ring-2 ring-slate-200'
            }`}>
              <img
                src={member.avatar}
                alt={member.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              {member.isPersonalMentor && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                </div>
              )}
            </div>
          </div>

          <CardContent className="pt-9 pb-5 px-4 sm:px-6 text-center flex flex-col items-center space-y-3">
            {/* Name & Role */}
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                {member.name}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {member.role}
              </p>
              {member.subject && (
                <p className="text-xs font-bold text-purple-700 mt-1">
                  Subject: <span className="text-purple-600">{member.subject}</span>
                </p>
              )}
            </div>

            {/* Quick Contact Action Pills Row */}
            <div className="flex items-center justify-center gap-2 pt-1 w-full max-w-sm">
              {/* Call Pill */}
              <button
                onClick={() => handleCall(member.phone)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200/60 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 shrink-0"
                title={`Call ${member.name}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </button>

              {/* Whatsapp Pill */}
              <button
                onClick={() => handleWhatsapp(member.whatsapp, member.name)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 shrink-0"
                title={`WhatsApp ${member.name}`}
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>Whatsapp</span>
              </button>

              {/* Email Pill */}
              <button
                onClick={() => handleEmail(member.email, member.name)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/60 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 shrink-0"
                title={`Email ${member.name}`}
              >
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                <span>Email</span>
              </button>
            </div>

            {/* Special Highlight Badge (For Assigned Personal Mentor) */}
            {member.isPersonalMentor && (
              <div className="pt-2 w-full">
                <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-extrabold text-xs px-4 py-1.5 rounded-full shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your personal mentor
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-blue-100 mb-2">
            <UserCheck className="w-3.5 h-3.5" /> Direct Mentor Support Team
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Your Mentorship Support Network</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Reach out directly to your assigned personal mentor, subject lead, or technical support team anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
          <Headphones className="w-8 h-8 text-amber-300 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-black text-amber-300">Fast Response</span>
            <p className="text-xs font-bold text-white">24/7 Dedicated Assistance</p>
          </div>
        </div>
      </div>

      {/* Support Hierarchy Layout */}
      <div className="space-y-10">
        {/* Tier 1: Technical & Head Operations */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Platform & Technical Support Leadership
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {TEAM_MEMBERS.filter(m => m.tier === 'support').map(member => (
              <MentorSupportCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Tier 2: Subject Lead Mentor */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Subject Lead Mentor
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.filter(m => m.tier === 'lead').map(member => (
              <MentorSupportCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Tier 3: Assigned Personal Mentor */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Your Dedicated 1-on-1 Mentor
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.filter(m => m.tier === 'personal').map(member => (
              <MentorSupportCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourMentorsPage;
