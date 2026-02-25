import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Grid,
  List,
  Search,
  Star,
  Heart,
  MessageSquare,
  Calendar,
  Filter,
  SortDesc,
  Users,
  BookOpen,
  Eye
} from 'lucide-react';
import { Mentor } from '@/data/mentorshipData';
import { useCategoryFilteredMentors } from '@/hooks/useCategoryFilteredContent';
import { useIsMobile } from '@/hooks/use-mobile';
import { CategorySelector } from '@/components/global/CategorySelector';
import MentorDetailsModal from './MentorDetailsModal';

type ViewMode = 'grid' | 'list';
type SortOption = 'rating' | 'experience' | 'reviews';

const FindMentorsPage = () => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecificCategory, setSelectedSpecificCategory] = useState<string>('banking-insurance');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedMentors, setWishlistedMentors] = useState<Set<number>>(new Set());

  const { mentors: globalFilteredMentors, getMentorsForCategory, selectedCategories, hasFilters } = useCategoryFilteredMentors();

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'upsc', name: 'UPSC' },
    { id: 'banking-insurance', name: 'Banking & Insurance' },
    { id: 'ssc', name: 'SSC' },
    { id: 'railway', name: 'Railway' },
    { id: 'cat', name: 'CAT/MBA' }
  ];

  // Get base mentors - either from global filter or specific category
  const baseMentors = useMemo(() => {
    if (selectedSpecificCategory === 'all') {
      // Show globally filtered mentors, limit to 10 per category for performance
      return hasFilters ? globalFilteredMentors : getMentorsForCategory('upsc', 10)
        .concat(getMentorsForCategory('banking-insurance', 10))
        .concat(getMentorsForCategory('ssc', 10))
        .concat(getMentorsForCategory('railway', 10))
        .concat(getMentorsForCategory('cat', 10));
    } else {
      // Show exactly 50 mentors for the selected specific category
      return getMentorsForCategory(selectedSpecificCategory, 50);
    }
  }, [selectedSpecificCategory, globalFilteredMentors, hasFilters, getMentorsForCategory]);

  // Filter and sort mentors
  const filteredAndSortedMentors = useMemo(() => {
    let filtered = baseMentors.filter(mentor => {
      // Search filter
      const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));

      // Rating filter
      const matchesRating = mentor.rating >= minRating;

      return matchesSearch && matchesRating;
    });

    // Sort mentors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

    return filtered;
    return filtered;
  }, [baseMentors, searchQuery, minRating, sortBy]);

  const handleWishlistToggle = (mentorId: number) => {
    setWishlistedMentors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mentorId)) {
        newSet.delete(mentorId);
      } else {
        newSet.add(mentorId);
      }
      return newSet;
    });
  };

  const MentorGridCard = ({ mentor }: { mentor: Mentor }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors truncate">
                {mentor.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-1">{mentor.qualification}</p>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium ml-1">{mentor.rating}</span>
                <span className="text-xs text-gray-500 ml-1">({mentor.reviews})</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleWishlistToggle(mentor.id);
            }}
            className="p-1 touch-target"
          >
            <Heart className={`h-4 w-4 ${wishlistedMentors.has(mentor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Experience</span>
            <span className="font-medium">{mentor.experience}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Subjects:</p>
          <div className="flex flex-wrap gap-1">
            {mentor.subjects.slice(0, 3).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
            {mentor.subjects.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.subjects.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Languages:</p>
          <div className="flex flex-wrap gap-1">
            {mentor.languages.slice(0, 2).map((language) => (
              <Badge key={language} variant="outline" className="text-xs">
                {language}
              </Badge>
            ))}
            {mentor.languages.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.languages.length - 2}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 touch-button ${isMobile ? 'h-10' : ''}`}
            onClick={() => setSelectedMentor(mentor)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Profile
          </Button>
          <Button
            size="sm"
            className={`flex-1 touch-button ${isMobile ? 'h-10' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const MentorListCard = ({ mentor }: { mentor: Mentor }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className={`${isMobile ? 'w-12 h-12 text-sm' : 'w-16 h-16 text-lg'} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold`}>
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold group-hover:text-blue-600 transition-colors truncate ${isMobile ? 'text-base' : 'text-lg'}`}>
                  {mentor.name}
                </h3>
                <p className={`text-gray-600 truncate ${isMobile ? 'text-sm' : ''}`}>{mentor.qualification}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="flex items-center mb-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium ml-1 text-sm">{mentor.rating}</span>
                  <span className="text-xs text-gray-500 ml-1">({mentor.reviews})</span>
                </div>
              </div>
            </div>

            <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-2 gap-4'} mb-3`}>
              <div>
                <p className="text-sm text-gray-600">Experience: <span className="font-medium">{mentor.experience}</span></p>
                <p className="text-sm text-gray-600">Languages: {mentor.languages.slice(0, 2).join(', ')}{mentor.languages.length > 2 ? '...' : ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Subjects:</p>
                <div className="flex flex-wrap gap-1">
                  {mentor.subjects.slice(0, isMobile ? 2 : 4).map((subject) => (
                    <Badge key={subject} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                  {mentor.subjects.length > (isMobile ? 2 : 4) && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.subjects.length - (isMobile ? 2 : 4)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${isMobile ? 'touch-button flex-1' : ''}`}
                  onClick={() => setSelectedMentor(mentor)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {isMobile ? 'Profile' : 'View Profile'}
                </Button>
                <Button
                  size="sm"
                  className={`${isMobile ? 'touch-button flex-1' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Book
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlistToggle(mentor.id);
                }}
                className="ml-2 touch-target"
              >
                <Heart className={`h-4 w-4 ${wishlistedMentors.has(mentor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Minimalistic Design - Removed Headers and Filters */}

      {/* Mentors Grid/List */}
      {filteredAndSortedMentors.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>No mentors found</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Try adjusting your search criteria or filters to find more mentors.
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedSpecificCategory('all');
              setPriceRange([0, 5000]);
              setMinRating(0);
            }} className="touch-button">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          (viewMode === 'grid' && !isMobile)
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredAndSortedMentors.map((mentor) =>
            (viewMode === 'grid' && !isMobile) ? (
              <MentorGridCard key={mentor.id} mentor={mentor} />
            ) : (
              <MentorListCard key={mentor.id} mentor={mentor} />
            )
          )}
        </div>
      )}

      {/* Mentor Details Modal */}
      <MentorDetailsModal
        mentor={selectedMentor}
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
      />
    </div>
  );
};

export default FindMentorsPage;
