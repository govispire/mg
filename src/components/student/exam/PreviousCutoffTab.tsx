import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PreviousCutoffTabProps {
  examId: string;
  examName: string;
}

export const PreviousCutoffTab: React.FC<PreviousCutoffTabProps> = ({ examId, examName }) => {
  const prelimsCutoff = [
    { year: '2023', general: 88.00, obc: 81.64, sc: 77.34, st: 74.66, trend: 'up' },
    { year: '2022', general: 87.50, obc: 80.83, sc: 76.58, st: 73.33, trend: 'down' },
    { year: '2021', general: 87.86, obc: 81.64, sc: 77.34, st: 74.66, trend: 'up' },
    { year: '2020', general: 87.00, obc: 80.00, sc: 75.00, st: 72.00, trend: 'same' },
  ];

  const mainsCutoff = [
    { year: '2023', general: 930, obc: 890, sc: 860, st: 840, trend: 'up' },
    { year: '2022', general: 920, obc: 880, sc: 850, st: 830, trend: 'down' },
    { year: '2021', general: 925, obc: 885, sc: 855, st: 835, trend: 'up' },
    { year: '2020', general: 915, obc: 875, sc: 845, st: 825, trend: 'same' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <h2 className="text-2xl font-bold mb-2">{examName} Previous Year Cutoffs</h2>
        <p className="text-muted-foreground">
          Analyze previous years' cutoff marks to understand the competition level
        </p>
      </Card>

      {/* Prelims Cutoff */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Badge variant="default">Prelims</Badge>
          Cutoff Marks (Out of 200)
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>General</TableHead>
                <TableHead>OBC</TableHead>
                <TableHead>SC</TableHead>
                <TableHead>ST</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prelimsCutoff.map((row) => (
                <TableRow key={row.year}>
                  <TableCell className="font-semibold">{row.year}</TableCell>
                  <TableCell>{row.general}</TableCell>
                  <TableCell>{row.obc}</TableCell>
                  <TableCell>{row.sc}</TableCell>
                  <TableCell>{row.st}</TableCell>
                  <TableCell>{getTrendIcon(row.trend)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mains Cutoff */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Badge variant="secondary">Mains</Badge>
          Cutoff Marks (Out of 1750)
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>General</TableHead>
                <TableHead>OBC</TableHead>
                <TableHead>SC</TableHead>
                <TableHead>ST</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mainsCutoff.map((row) => (
                <TableRow key={row.year}>
                  <TableCell className="font-semibold">{row.year}</TableCell>
                  <TableCell>{row.general}</TableCell>
                  <TableCell>{row.obc}</TableCell>
                  <TableCell>{row.sc}</TableCell>
                  <TableCell>{row.st}</TableCell>
                  <TableCell>{getTrendIcon(row.trend)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-bold mb-3">Key Insights</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Prelims cutoff has shown an upward trend in recent years</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Aim for 10-15 marks above the previous year's cutoff for safety</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Category-wise cutoff varies significantly - plan accordingly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Mains cutoff is more stable compared to prelims</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
