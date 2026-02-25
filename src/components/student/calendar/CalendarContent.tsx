
import React from 'react';
import { isToday, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from '@/hooks/useCalendarTasks';
import TaskList from './TaskList';
import TimelineView from './TimelineView';

interface CalendarContentProps {
  date?: Date;
  filteredTasks: Task[];
  onCompleteTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  showAddTask: () => void;
}

const CalendarContent: React.FC<CalendarContentProps> = ({
  date,
  filteredTasks,
  onCompleteTask,
  onDeleteTask,
  showAddTask
}) => {
  return (
    <div>
      {/* Selected date and tasks count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="font-medium text-lg">
          {date ? format(date, 'PPPP') : 'No date selected'}
          {date && isToday(date) && <Badge className="ml-2 animate-pulse">Today</Badge>}
        </h2>
        <span className="text-sm text-gray-500">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      
      {/* Tasks list */}
      <div>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="list" className="flex-1 sm:flex-initial">List View</TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 sm:flex-initial">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            {filteredTasks.length > 0 ? (
              <TaskList 
                tasks={filteredTasks}
                onCompleteTask={onCompleteTask}
                onDeleteTask={onDeleteTask}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks scheduled for this date</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 hover:scale-105 transition-transform"
                  onClick={showAddTask}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="timeline">
            {filteredTasks.length > 0 ? (
              <TimelineView tasks={filteredTasks} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks to display in timeline</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Add Button import here to fix the error
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default CalendarContent;
