
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Upload, X, Calendar } from 'lucide-react';
import { CalendarEvent, roleOptions, UserRole, TaskType, Priority } from './types';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  event?: CalendarEvent;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  userRole: UserRole;
  availableCategories: Array<{ value: string; label: string; color: string; roles: UserRole[] | string[] }>;
}

export const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onOpenChange,
  selectedDate,
  event,
  onSave,
  userRole,
  availableCategories
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignedTo, setAssignedTo] = useState<UserRole | ''>('');
  const [images, setImages] = useState<string[]>([]);

  // Reset form when dialog opens/closes or event changes
  useEffect(() => {
    if (open) {
      if (event) {
        setTitle(event.title);
        setDescription(event.description || '');
        setTime(event.time);
        setCategory(event.category);
        setPriority(event.priority);
        setAssignedTo(event.assignedTo || '');
        setImages(event.images || []);
      } else {
        setTitle('');
        setDescription('');
        setTime('09:00');
        setCategory(availableCategories[0]?.value || 'study');
        setPriority('medium');
        setAssignedTo('');
        setImages([]);
      }
    }
  }, [open, event, availableCategories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim() || !selectedDate) return;

    onSave({
      title,
      description,
      date: selectedDate,
      time,
      category,
      priority,
      status: event?.completed ? 'completed' : 'pending',
      taskType: category as TaskType,
      completed: event?.completed || false,
      isAssigned: !!assignedTo,
      assignedTo: assignedTo || undefined,
      assignedBy: userRole,
      images
    });

    onOpenChange(false);
  };

  // Filter role options based on user permissions
  const getAvailableRoles = () => {
    if (userRole === 'admin' || userRole === 'super-admin' || userRole === 'owner') {
      return roleOptions;
    } else if (userRole === 'mentor') {
      return roleOptions.filter(role => role.value === 'student' || role.value === 'mentor');
    } else {
      return [];
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {event ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
          <DialogDescription>
            Create or edit your task details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Date Display - Prominent and Non-editable */}
          {selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Calendar className="h-4 w-4" />
                <div>
                  <div className="text-sm font-medium">Selected Date</div>
                  <div className="text-base font-semibold">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Assignment - only show if user can assign tasks */}
          {availableRoles.length > 0 && (
            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select value={assignedTo} onValueChange={(value: UserRole | '') => setAssignedTo(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Personal Task)</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Images (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-1">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload images</p>
                </div>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-16 object-cover rounded"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {event ? 'Update' : 'Add'} Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
