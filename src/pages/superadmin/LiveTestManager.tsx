import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Calendar, Clock, Save, Trash2, Edit,
  Radio, FileText, Users, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LiveTestData {
  id: number;
  title: string;
  description: string;
  questions: number;
  duration: number;
  marks: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  examDateTime: Date;
  endDateTime: Date;
  totalSeats: number;
  status: 'draft' | 'scheduled' | 'live' | 'ended';
}

// ── Main Component ───────────────────────────────────────────────────────────
const LiveTestManager: React.FC = () => {
  const [liveTests, setLiveTests] = useState<LiveTestData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<LiveTestData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: 100,
    duration: 60,
    marks: 100,
    startDate: '',
    startTime: '10:00',
    endDate: '',
    endTime: '12:00',
    totalSeats: 15000,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      questions: 100,
      duration: 60,
      marks: 100,
      startDate: '',
      startTime: '10:00',
      endDate: '',
      endTime: '12:00',
      totalSeats: 15000,
    });
    setEditingTest(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (editingTest) {
      // Update existing test
      setLiveTests(prev =>
        prev.map(test =>
          test.id === editingTest.id
            ? {
                ...test,
                ...formData,
                examDateTime: startDateTime,
                endDateTime: endDateTime,
              }
            : test
        )
      );
      toast.success('✅ Live test updated successfully');
    } else {
      // Create new test
      const newTest: LiveTestData = {
        id: Date.now(),
        ...formData,
        examDateTime: startDateTime,
        endDateTime: endDateTime,
        status: 'scheduled',
      };
      setLiveTests(prev => [...prev, newTest]);
      toast.success('✅ Live test created successfully');
    }

    resetForm();
  };

  const handleEdit = (test: LiveTestData) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description,
      questions: test.questions,
      duration: test.duration,
      marks: test.marks,
      startDate: test.startDate,
      startTime: test.startTime,
      endDate: test.endDate,
      endTime: test.endTime,
      totalSeats: test.totalSeats,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this live test?')) {
      setLiveTests(prev => prev.filter(t => t.id !== id));
      toast.success('🗑️ Live test deleted');
    }
  };

  const handleStatusChange = (id: number, status: LiveTestData['status']) => {
    setLiveTests(prev =>
      prev.map(test =>
        test.id === id ? { ...test, status } : test
      )
    );
    toast.success(`Status changed to ${status}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Radio className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            Live Test Manager
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Create and manage live tests for students
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2 bg-slate-800 hover:bg-slate-900"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" />
          Create Live Test
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-600">Total Tests</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{liveTests.length}</div>
        </Card>
        <Card className="p-4 border-2 border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-600">Scheduled</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {liveTests.filter(t => t.status === 'scheduled').length}
          </div>
        </Card>
        <Card className="p-4 border-2 border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Radio className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-slate-600">Live Now</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {liveTests.filter(t => t.status === 'live').length}
          </div>
        </Card>
        <Card className="p-4 border-2 border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-600">Completed</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {liveTests.filter(t => t.status === 'ended').length}
          </div>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {editingTest ? 'Edit Live Test' : 'Create New Live Test'}
            </h2>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold mb-2 block">
                Test Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., All India IBPS PO Live Mock"
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label className="text-sm font-semibold mb-2 block">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the test..."
                rows={3}
              />
            </div>

            {/* Questions */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Total Questions</Label>
              <Input
                type="number"
                value={formData.questions}
                onChange={(e) => setFormData({ ...formData, questions: parseInt(e.target.value) })}
                className="h-10"
              />
            </div>

            {/* Duration */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Duration (Minutes)</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="h-10"
              />
            </div>

            {/* Marks */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Total Marks</Label>
              <Input
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                className="h-10"
              />
            </div>

            {/* Total Seats */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Total Seats</Label>
              <Input
                type="number"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                className="h-10"
              />
            </div>

            {/* Start Date & Time */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="h-10"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Start Time</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="h-10"
              />
            </div>

            {/* End Date & Time */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="h-10"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">End Time</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="h-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-slate-800 hover:bg-slate-900">
              <Save className="h-4 w-4 mr-1.5" />
              {editingTest ? 'Update Test' : 'Create Test'}
            </Button>
          </div>
        </Card>
      )}

      {/* Live Tests List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">All Live Tests</h2>
        
        {liveTests.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-slate-300">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-semibold text-slate-600 mb-2">No live tests created yet</p>
            <p className="text-sm text-slate-500">Click "Create Live Test" to get started</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {liveTests.map((test) => (
              <Card key={test.id} className="p-4 border-2 border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-bold text-slate-900">{test.title}</h3>
                      <Badge className={
                        test.status === 'live' ? 'bg-red-500 text-white' :
                        test.status === 'scheduled' ? 'bg-blue-500 text-white' :
                        test.status === 'ended' ? 'bg-slate-500 text-white' :
                        'bg-amber-500 text-white'
                      }>
                        {test.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="h-4 w-4" />
                        <span>{test.questions} Questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>{test.duration} Minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(test.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{test.totalSeats.toLocaleString()} Seats</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      <strong>Start:</strong> {formatDate(test.startDate)} at {test.startTime} • 
                      <strong className="ml-2">End:</strong> {formatDate(test.endDate)} at {test.endTime}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Controls */}
                    {test.status === 'scheduled' && (
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => handleStatusChange(test.id, 'live')}
                      >
                        <Radio className="h-4 w-4 mr-1" />
                        Make Live
                      </Button>
                    )}
                    {test.status === 'live' && (
                      <Button
                        size="sm"
                        className="bg-slate-600 hover:bg-slate-700 text-white"
                        onClick={() => handleStatusChange(test.id, 'ended')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        End Test
                      </Button>
                    )}

                    {/* Edit & Delete */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(test)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(test.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTestManager;
