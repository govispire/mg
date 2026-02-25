
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Plus, Image, Eye } from 'lucide-react';

interface DayContextMenuProps {
  children: React.ReactNode;
  onAddTask: () => void;
  onAddImage: () => void;
  onViewDay: () => void;
}

export const DayContextMenu: React.FC<DayContextMenuProps> = ({
  children,
  onAddTask,
  onAddImage,
  onViewDay
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-white shadow-lg">
        <ContextMenuItem onClick={onAddTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </ContextMenuItem>
        <ContextMenuItem onClick={onAddImage} className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Add Image
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onViewDay} className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View Day Details
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
