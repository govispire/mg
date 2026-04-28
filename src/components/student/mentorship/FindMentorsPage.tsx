import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search, Star, Heart, Calendar, Users, Eye,
  MapPin, Clock, Languages, Filter, ChevronDown, Zap, Shield
} from 'lucide-react';
import { Mentor } from '@/data/mentorshipData';
import { useCategoryFilteredMentors } from '@/hooks/useCategoryFilteredContent';
import { useIsMobile } from '@/hooks/use-mobile';
import MentorDetailsModal from './MentorDetailsModal';

type SortOption = 'rating' | 'reviews' | 'experience';

/* ─── avatar colour palette (no photos needed) ─── */
const AVATAR_PALETTES = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-600',
];
const getPalette = (id: number) => AVATAR_PALETTES[id % AVATAR_PALETTES.length];

const CATEGORY_TABS = [
  { id: 'banking-insurance', label: 'Banking' },
  { id: 'ssc', label: 'SSC' },
  { id: 'railway', label: 'Railway' },
  { id: 'upsc', label: 'UPSC' },
  { id: 'cat', label: 'CAT/MBA' },
];

/* ─── availability simulation ─── */
const getAvailability = (id: number): 'online' | 'busy' | 'offline' =>
  id % 3 === 0 ? 'online' : id % 3 === 1 ? 'busy' : 'offline';

const AVAILABILITY_LABEL: Record<string, string> = {
  online: 'Available now',
  busy: 'In session',
  offline: 'Offline',
};
const AVAILABILITY_COLOR: Record<string, string> = {
  online: 'bg-emerald-500',
  busy: 'bg-amber-500',
  offline: 'bg-gray-400',
};

/* ─── mock price per session ─── */
const getPricePerSession = (id: number) => [499, 599, 699, 799, 999][id % 5];

/* ─── speciality badges (derived from subjects) ─── */
const SPECIALITY_COLORS: Record<string, string> = {
  'Quantitative': 'bg-blue-50 text-blue-700 border-blue-200',
  'Reasoning': 'bg-violet-50 text-violet-700 border-violet-200',
  'English': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'General Awareness': 'bg-amber-50 text-amber-700 border-amber-200',
  'Current Affairs': 'bg-rose-50 text-rose-700 border-rose-200',
};
const getSubjectColor = (subject: string) =>
  SPECIALITY_COLORS[subject] || 'bg-gray-50 text-gray-700 border-gray-200';

/* ══════════════ MENTOR CARD ══════════════ */
const MentorCard = ({
  mentor,
  wishlisted,
  onWishlist,
  onView,
  isMobile,
}: {
  mentor: Mentor;
  wishlisted: boolean;
  onWishlist: () => void;
  onView: () => void;
  isMobile: boolean;
}) => {
  const availability = getAvailability(mentor.id);
  const pricePerSession = getPricePerSession(mentor.id);
  const initials = mentor.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${getPalette(mentor.id)}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getPalette(mentor.id)} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
              {initials}
            </div>
            {/* Online dot */}
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${AVAILABILITY_COLOR[availability]}`} />
          </div>

          {/* Name + qualification */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-[15px] leading-snug truncate group-hover:text-primary transition-colors">
              {mentor.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{mentor.qualification}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${AVAILABILITY_COLOR[availability]} text-white`}>
                {AVAILABILITY_LABEL[availability]}
              </span>
            </div>
          </div>

          {/* Wishlist */}
          <button onClick={onWishlist} className="p-1.5 rounded-xl hover:bg-red-50 transition-colors flex-shrink-0">
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
          </button>
        </div>

        {/* Rating + experience */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400" />
            <span className="text-sm font-bold text-gray-800">{mentor.rating}</span>
            <span className="text-xs text-gray-400">({mentor.reviews})</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{mentor.experience}</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="h-3 w-3" />
            <span>{200 + mentor.id * 7}+</span>
          </div>
        </div>

        {/* Subject tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {mentor.subjects.slice(0, 3).map(s => (
            <span key={s} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSubjectColor(s)}`}>
              {s}
            </span>
          ))}
          {mentor.subjects.length > 3 && (
            <span className="text-[10px] text-gray-400 px-2 py-0.5">+{mentor.subjects.length - 3}</span>
          )}
        </div>

        {/* Languages */}
        <div className="flex items-center gap-1.5 mb-4">
          <Languages className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <span className="text-[11px] text-gray-500">{mentor.languages.slice(0, 2).join(', ')}{mentor.languages.length > 2 ? ` +${mentor.languages.length - 2}` : ''}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="border-t border-gray-100 pt-4 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-black text-gray-900">₹{pricePerSession}</span>
              <span className="text-xs text-gray-400"> /session</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Shield className="h-2.5 w-2.5" /> Free Intro
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onView}
              className="flex-1 py-2 text-xs font-semibold border-2 border-gray-200 rounded-xl text-gray-700 hover:border-primary hover:text-primary transition-colors"
            >
              <Eye className="h-3.5 w-3.5 inline mr-1" />
              View Profile
            </button>
            <button
              onClick={onView}
              className="flex-1 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
            >
              <Calendar className="h-3.5 w-3.5" />
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════ MAIN PAGE ══════════════ */
const FindMentorsPage = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('banking-insurance');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlisted, setWishlisted] = useState<Set<number>>(new Set());

  const { getMentorsForCategory } = useCategoryFilteredMentors();

  const baseMentors = useMemo(
    () => getMentorsForCategory(activeCategory, 50),
    [activeCategory, getMentorsForCategory],
  );

  const mentors = useMemo(() => {
    let list = baseMentors.filter(m => {
      const q = searchQuery.toLowerCase();
      return (
        (m.name.toLowerCase().includes(q) ||
          m.qualification.toLowerCase().includes(q) ||
          m.subjects.some(s => s.toLowerCase().includes(q))) &&
        m.rating >= minRating
      );
    });

    list.sort((a, b) =>
      sortBy === 'rating' ? b.rating - a.rating :
      sortBy === 'reviews' ? b.reviews - a.reviews : 0,
    );

    return list;
  }, [baseMentors, searchQuery, minRating, sortBy]);

  const toggleWishlist = (id: number) =>
    setWishlisted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-5">
      {/* ── Search + filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, subject, or exam…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 text-sm h-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
          >
            <Filter className="h-4 w-4" />
            {!isMobile && 'Filters'}
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORY_TABS.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory === cat.id ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Min Rating</p>
              <div className="flex gap-1">
                {[0, 4, 4.5, 4.8].map(r => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${minRating === r ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}
                  >
                    {r === 0 ? 'All' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Sort by</p>
              <div className="flex gap-1">
                {[['rating', 'Rating'], ['reviews', 'Reviews']] .map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setSortBy(v as SortOption)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${sortBy === v ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Result count ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-800">{mentors.length}</span> mentors found
        </p>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          <Zap className="h-3 w-3" />
          Free intro session available
        </div>
      </div>

      {/* ── Grid ── */}
      {mentors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700 mb-1">No mentors found</h3>
          <p className="text-sm text-gray-400">Try a different search or category</p>
          <button
            onClick={() => { setSearchQuery(''); setMinRating(0); }}
            className="mt-4 text-xs font-semibold text-primary hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {mentors.map(mentor => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              wishlisted={wishlisted.has(mentor.id)}
              onWishlist={() => toggleWishlist(mentor.id)}
              onView={() => setSelectedMentor(mentor)}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      <MentorDetailsModal
        mentor={selectedMentor}
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
      />
    </div>
  );
};

export default FindMentorsPage;
