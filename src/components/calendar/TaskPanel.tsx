import React, { useState } from 'react';
import { 
  Search,
  Plus,
  CheckSquare,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskList } from './TaskList';
import { UpcomingEvents } from './UpcomingEvents';
import { useTaskModal } from '@/hooks/useTaskModal';
import { useTasks } from '@/hooks/useTasks';

export const TaskPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [filterStatus, setFilterStatus] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { openModal } = useTaskModal();
  const { tasks } = useTasks();
  
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  
  const handleNewTask = () => {
    openModal();
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {activeTab === 'tasks' ? (
              <CheckSquare className="h-5 w-5 text-purple-600" />
            ) : (
              <Calendar className="h-5 w-5 text-purple-600" />
            )}
            {activeTab === 'tasks' ? 'Tasks' : 'Upcoming Events'}
          </h2>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
            onClick={handleNewTask}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="events">Upcoming</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <Filter className="h-4 w-4 mr-1" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes('all')}
                onCheckedChange={(checked) => {
                  checked 
                    ? setFilterStatus(['all']) 
                    : setFilterStatus([]);
                }}
              >
                All Tasks
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes('pending')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilterStatus(prev => 
                      prev.includes('all') 
                        ? ['pending'] 
                        : [...prev.filter(p => p !== 'completed'), 'pending']
                    );
                  } else {
                    setFilterStatus(prev => 
                      prev.filter(p => p !== 'pending')
                    );
                  }
                }}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes('completed')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilterStatus(prev => 
                      prev.includes('all') 
                        ? ['completed'] 
                        : [...prev.filter(p => p !== 'pending'), 'completed']
                    );
                  } else {
                    setFilterStatus(prev => 
                      prev.filter(p => p !== 'completed')
                    );
                  }
                }}
              >
                Completed
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="tasks" className="m-0 h-full">
            <div className="pt-2 pb-1 px-2 text-sm text-gray-500 flex justify-between">
              <span>
                {pendingTasks} pending / {totalTasks} total
              </span>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-sm text-purple-600">
                Sort
              </Button>
            </div>
            <TaskList
              searchQuery={searchQuery}
              filterStatus={filterStatus}
            />
          </TabsContent>
          
          <TabsContent value="events" className="m-0 h-full">
            <UpcomingEvents searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
