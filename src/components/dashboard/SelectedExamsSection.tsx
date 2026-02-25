import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, Tag, Clock, TrendingUp } from 'lucide-react';
import { useSelectedExams } from '@/hooks/useSelectedExams';
import { Link } from 'react-router-dom';

const examOffers = [
  {
    title: "Early Bird Offer",
    discount: "40% OFF",
    code: "EARLY2025",
    validUntil: "March 31, 2025",
    color: "bg-gradient-to-r from-blue-500 to-blue-600"
  },
  {
    title: "Flash Sale",
    discount: "50% OFF",
    code: "FLASH50",
    validUntil: "Limited Time",
    color: "bg-gradient-to-r from-red-500 to-pink-600"
  },
  {
    title: "Premium Pack",
    discount: "30% OFF",
    code: "PREMIUM30",
    validUntil: "April 15, 2025",
    color: "bg-gradient-to-r from-purple-500 to-purple-600"
  },
  {
    title: "Combo Deal",
    discount: "45% OFF",
    code: "COMBO45",
    validUntil: "March 20, 2025",
    color: "bg-gradient-to-r from-green-500 to-emerald-600"
  }
];

export const SelectedExamsSection = () => {
  const { selectedExams, removeExam } = useSelectedExams();

  if (selectedExams.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Selected Exams</h2>
        <Badge variant="secondary" className="text-sm">
          {selectedExams.length} {selectedExams.length === 1 ? 'Exam' : 'Exams'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedExams.map((exam, index) => {
          const offer = examOffers[index % examOffers.length];
          
          return (
            <Card key={exam.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Offer Banner */}
              <div className={`${offer.color} text-white p-3 relative`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-white hover:bg-white/20"
                  onClick={() => removeExam(exam.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <div className="text-2xl font-bold">{offer.discount}</div>
                    <div className="text-xs opacity-90">{offer.title}</div>
                  </div>
                  <Tag className="h-5 w-5 mt-1" />
                </div>
              </div>

              {/* Exam Info */}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={exam.logo} 
                    alt={exam.name}
                    className="w-10 h-10 object-contain"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{exam.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {exam.category.replace('-', ' & ')}
                    </p>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Coupon Code</p>
                      <p className="font-mono font-bold text-sm">{offer.code}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(offer.code);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Validity */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3 w-3" />
                  <span>Valid until {offer.validUntil}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link to={`/student/tests/${exam.category}/${exam.id}`} className="flex-1">
                    <Button size="sm" className="w-full text-xs">
                      View Details
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
