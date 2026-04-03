import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockTestData = [
  { id: 1, name: 'SBI Clerk Prelims Mock 4', score: 82, total: 100, accuracy: '78.5%', date: '12 Mar 2026', rank: '#124' },
  { id: 2, name: 'IBPS PO Prelims Mock 7', score: 76, total: 100, accuracy: '72.1%', date: '10 Mar 2026', rank: '#287' },
  { id: 3, name: 'SBI Clerk Mains Mock 2', score: 118, total: 190, accuracy: '68.4%', date: '8 Mar 2026', rank: '#456' },
  { id: 4, name: 'IBPS RRB PO Mock 3', score: 88, total: 100, accuracy: '81.2%', date: '5 Mar 2026', rank: '#98' },
];

const RecentMockTestPerformance: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col overflow-hidden bg-white border border-slate-200 shadow-md rounded-2xl w-full">
      {/* Header */}
      <div className="flex justify-between items-center p-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-sky-600 rounded-full" />
          <BarChart3 className="h-5 w-5 text-sky-600" />
          <h3 className="font-semibold text-base text-slate-800">Recent Mock Test Performance</h3>
        </div>
        <Button 
            variant="ghost" 
            className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 text-sm font-medium pr-0 pt-0 pb-0 h-auto" 
            onClick={() => navigate('/student/tests')}
        >
          View All <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 uppercase text-[11px] font-extrabold text-[#112233] tracking-widest bg-white">
              <th className="py-4 px-6">Test</th>
              <th className="py-4 px-6 text-center">Score</th>
              <th className="py-4 px-6 text-center">Accuracy</th>
              <th className="py-4 px-6 text-center">Date</th>
              <th className="py-4 px-6 text-center">Rank</th>
            </tr>
          </thead>
          <tbody>
            {mockTestData.map((test) => (
              <tr 
                key={test.id} 
                className="border-b border-slate-50 last:border-0 hover:bg-[#e2e8f0] bg-white transition-colors cursor-pointer group"
              >
                <td className="py-4 px-6 font-medium text-slate-700">{test.name}</td>
                <td className="py-4 px-6 text-center">
                  <span className="font-bold text-emerald-600">{test.score}</span>
                  <span className="text-slate-500 font-medium">/{test.total}</span>
                </td>
                <td className="py-4 px-6 text-center font-medium text-slate-700">{test.accuracy}</td>
                <td className="py-4 px-6 text-center text-slate-600">{test.date}</td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-[11px] font-bold">
                    {test.rank}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-5 pt-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[13px]">
          <TrendingUp className="h-4 w-4" />
          <span>↑ +7 marks improvement over last 3 tests</span>
        </div>
      </div>
    </Card>
  );
};

export default RecentMockTestPerformance;
