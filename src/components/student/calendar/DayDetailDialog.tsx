
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Plus, Image as ImageIcon, Download, ZoomIn, Clock, AlertCircle, Edit, Trash2, X } from 'lucide-react';
import { CalendarEvent, eventCategories } from './types';

interface DayDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  events: CalendarEvent[];
  onAddTask: () => void;
  onAddImage: () => void;
  onToggleTask: (eventId: string) => void;
  onEditTask: (event: CalendarEvent) => void;
  onDeleteTask: (eventId: string) => void;
}

export const DayDetailDialog: React.FC<DayDetailDialogProps> = ({
  open,
  onOpenChange,
  date,
  events,
  onAddTask,
  onAddImage,
  onToggleTask,
  onEditTask,
  onDeleteTask
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const tasks = events.filter(event => !event.isAssigned);
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const allImages = events.flatMap(event => event.images || []);

  const getCategoryColor = (category: string): string => {
    const categoryDef = eventCategories.find(cat => cat.value === category);
    if (categoryDef) {
      return categoryDef.color;
    }
    
    // Enhanced fallback colors
    const fallbackColors: Record<string, string> = {
      study: 'bg-blue-500',
      test: 'bg-emerald-500',
      discussion: 'bg-purple-500',
      homework: 'bg-orange-500',
      preparation: 'bg-pink-500',
      assignment: 'bg-yellow-500',
      'test-prep': 'bg-red-500',
      practice: 'bg-green-500',
      meeting: 'bg-violet-500',
      deadline: 'bg-rose-500',
      announcement: 'bg-amber-500',
      reminder: 'bg-lime-500'
    };
    
    return fallbackColors[category] || 'bg-gray-500';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `calendar-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative">
            {/* Enhanced Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <DialogTitle className="text-lg flex items-center justify-between pr-8">
              <span>{date && format(date, 'EEEE, MMMM d, yyyy')}</span>
              {tasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {completionRate}% complete
                  </span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Manage your tasks and activities for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quick Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={onAddTask} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
              <Button onClick={onAddImage} variant="outline" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Add Image
              </Button>
            </div>

            {/* Progress Summary */}
            {tasks.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Daily Progress</span>
                  <span className="text-sm text-gray-600">{completedTasks.length}/{tasks.length} completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tasks Section */}
            <div>
              <h3 className="font-medium mb-3 text-gray-900 flex items-center justify-between">
                <span>Tasks ({tasks.length})</span>
                {tasks.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {pendingTasks.length} pending • {completedTasks.length} completed
                  </div>
                )}
              </h3>
              
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {/* Pending Tasks First */}
                  {pendingTasks.map((task) => (
                    <div key={`pending-${task.id}`} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors group">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => onToggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-gray-900">
                            {task.title}
                          </div>
                          {getPriorityIcon(task.priority)}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-600 mb-2">{task.description}</div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getCategoryColor(task.category)}`} />
                            {eventCategories.find(cat => cat.value === task.category)?.label || task.category}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${
                            task.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                            task.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${getCategoryColor(task.category)} flex-shrink-0`} />
                      
                      {/* Task Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTask(task)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTask(task.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Completed Tasks */}
                  {completedTasks.length > 0 && (
                    <>
                      {pendingTasks.length > 0 && <div className="border-t my-3" />}
                      <div className="text-sm text-gray-500 mb-2">Completed Tasks</div>
                      {completedTasks.map((task) => (
                        <div key={`completed-${task.id}`} className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 opacity-75 group">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => onToggleTask(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium line-through text-gray-500">
                                {task.title}
                              </div>
                              {getPriorityIcon(task.priority)}
                            </div>
                            {task.description && (
                              <div className="text-sm text-gray-500 mb-2 line-through">{task.description}</div>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getCategoryColor(task.category)} opacity-50`} />
                                {eventCategories.find(cat => cat.value === task.category)?.label || task.category}
                              </div>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full ${getCategoryColor(task.category)} flex-shrink-0 opacity-50`} />
                          
                          {/* Task Actions for Completed */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditTask(task)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteTask(task.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Plus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No tasks for this day</p>
                  <Button onClick={onAddTask} variant="outline" size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                    Add your first task
                  </Button>
                </div>
              )}
            </div>

            {/* Images Section */}
            <div>
              <h3 className="font-medium mb-3 text-gray-900">Images ({allImages.length})</h3>
              {allImages.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {allImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Calendar image ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg cursor-pointer border border-gray-200"
                        onClick={() => setSelectedImage(image)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No images for this day</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/90">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Full size"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => downloadImage(selectedImage)}
                  className="bg-white/90 hover:bg-white text-gray-900"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedImage(null)}
                  className="bg-white/90 hover:bg-white text-gray-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
