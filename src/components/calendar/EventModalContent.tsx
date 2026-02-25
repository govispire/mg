
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTasks } from '@/hooks/useTasks';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';

interface EventModalContentProps {
  event?: any;
  dateRange?: any;
  onClose: () => void;
}

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().default('study'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

export const EventModalContent: React.FC<EventModalContentProps> = ({ 
  event, 
  dateRange, 
  onClose 
}) => {
  const { addTask, updateTask, deleteTask } = useTasks();
  
  const isEditMode = !!event;
  const startDate = event?.start || dateRange?.start || new Date();
  const endDate = event?.end || dateRange?.end || new Date();
  
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      category: event?.category || 'study',
      priority: event?.priority || 'medium',
      startTime: startDate ? format(new Date(startDate), "HH:mm") : undefined,
      endTime: endDate ? format(new Date(endDate), "HH:mm") : undefined,
    }
  });
  
  const onSubmit = (data: z.infer<typeof eventSchema>) => {
    const formattedStart = new Date(startDate);
    const formattedEnd = new Date(endDate);
    
    // If time is provided, update the hours and minutes
    if (data.startTime) {
      const [hours, minutes] = data.startTime.split(':').map(Number);
      formattedStart.setHours(hours, minutes);
    }
    
    if (data.endTime) {
      const [hours, minutes] = data.endTime.split(':').map(Number);
      formattedEnd.setHours(hours, minutes);
    }
    
    const taskData = {
      title: data.title,
      description: data.description || '',
      category: data.category,
      priority: data.priority,
      dueDate: formattedStart.toISOString(),
      endDate: formattedEnd.toISOString(),
    };
    
    if (isEditMode) {
      updateTask(Number(event.id), taskData);
    } else {
      addTask(taskData);
    }
    
    onClose();
  };
  
  const handleDelete = () => {
    if (isEditMode && event?.id) {
      deleteTask(Number(event.id));
      onClose();
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {isEditMode ? 'Edit Event' : 'Add New Event'}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="Add title" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="revision">Revision</SelectItem>
                    <SelectItem value="exams">Exams</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <label htmlFor="low" className="text-sm">Low</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <label htmlFor="medium" className="text-sm">Medium</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <label htmlFor="high" className="text-sm">High</label>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add description" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2 pt-2">
            {isEditMode && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
