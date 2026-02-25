import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sampleMentors, type Mentor } from '@/data/mentorshipData';
import { Star, Clock, Users, MessageSquare, Check, Filter, X } from 'lucide-react';

interface MentorMatchingProps {
    categoryId: string;
    stageId: string;
    mentorshipTypeId: string;
}

const MentorMatching: React.FC<MentorMatchingProps> = ({ categoryId, stageId, mentorshipTypeId }) => {
    const navigate = useNavigate();
    const [matchedMentors, setMatchedMentors] = useState<Mentor[]>([]);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'anytime' | 'scheduled' | 'limited'>('all');

    useEffect(() => {
        // Filter mentors based on selection criteria
        const filtered = sampleMentors.filter(mentor => {
            // Match category
            if (mentor.categoryId !== categoryId) return false;

            // Check if mentor supports the stage
            if (!mentor.supportedStages.includes(stageId)) return false;

            // Check if mentor supports the mentorship type
            if (!mentor.mentorshipTypes.includes(mentorshipTypeId)) return false;

            // Check capacity
            if (mentor.currentStudents >= mentor.maxStudents) return false;

            // Apply availability filter
            if (availabilityFilter !== 'all' && mentor.availabilityType !== availabilityFilter) {
                return false;
            }

            return true;
        });

        setMatchedMentors(filtered);
    }, [categoryId, stageId, mentorshipTypeId, availabilityFilter]);

    const handleSelectMentor = (mentor: Mentor) => {
        setSelectedMentor(mentor);
    };

    const handleConfirmMentor = () => {
        if (selectedMentor) {
            // Store selected mentor
            localStorage.setItem('selectedMentor', JSON.stringify(selectedMentor));

            // Show success message
            alert(`Mentorship request sent to ${selectedMentor.name}! They will review and accept your request within 24 hours.`);

            // Navigate to mentorship dashboard
            navigate('/student/mentorship/dashboard');
        }
    };

    const getAvailabilityBadge = (type: string) => {
        switch (type) {
            case 'anytime':
                return { text: '24×7 Available', color: 'bg-green-100 text-green-700' };
            case 'scheduled':
                return { text: 'Scheduled Slots', color: 'bg-blue-100 text-blue-700' };
            case 'limited':
                return { text: 'Limited Hours', color: 'bg-orange-100 text-orange-700' };
            default:
                return { text: 'Available', color: 'bg-gray-100 text-gray-700' };
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Mentor</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We've matched you with {matchedMentors.length} mentor{matchedMentors.length !== 1 ? 's' : ''} based on your selections
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex items-center gap-4 flex-wrap">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-700">Filter by availability:</span>
                        <div className="flex gap-2 flex-wrap">
                            {(['all', 'anytime', 'scheduled', 'limited'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setAvailabilityFilter(filter)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${availabilityFilter === filter
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {matchedMentors.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <X className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Mentors Available</h3>
                        <p className="text-gray-600 mb-6">
                            Unfortunately, no mentors match your current filters. Try adjusting your availability preferences.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Mentor Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {matchedMentors.map((mentor) => {
                                const availabilityBadge = getAvailabilityBadge(mentor.availabilityType);
                                const isSelected = selectedMentor?.id === mentor.id;
                                const spotsLeft = mentor.maxStudents - mentor.currentStudents;

                                return (
                                    <div
                                        key={mentor.id}
                                        className={`bg-white rounded-xl p-6 border-2 transition-all cursor-pointer ${isSelected
                                            ? 'border-purple-600 shadow-xl scale-105'
                                            : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                                            }`}
                                        onClick={() => handleSelectMentor(mentor)}
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                                                    {mentor.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
                                                    <p className="text-gray-600 text-sm">{mentor.qualification}</p>
                                                    <p className="text-purple-600 text-sm font-semibold">{mentor.experience}</p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Bio */}
                                        <p className="text-gray-700 mb-4 text-sm">{mentor.bio}</p>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-semibold">{mentor.rating}</span>
                                                <span className="text-gray-500 text-sm">({mentor.reviews} reviews)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-gray-700">
                                                    {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex gap-2 flex-wrap mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${availabilityBadge.color}`}>
                                                {availabilityBadge.text}
                                            </span>
                                            {mentor.languages.map((lang) => (
                                                <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Subjects */}
                                        <div className="border-t pt-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Specialization:</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {mentor.subjects.map((subject) => (
                                                    <span key={subject} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs">
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Confirm Button */}
                        {selectedMentor && (
                            <div className="bg-white rounded-xl shadow-xl p-6 sticky bottom-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Selected Mentor:</p>
                                        <p className="text-xl font-bold text-gray-900">{selectedMentor.name}</p>
                                    </div>
                                    <button
                                        onClick={handleConfirmMentor}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Send Mentorship Request
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MentorMatching;
