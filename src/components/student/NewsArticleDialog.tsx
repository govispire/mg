import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface NewsArticle {
  title: string;
  category: string;
  image: string;
  date: string;
  content: string;
}

interface NewsArticleDialogProps {
  article: NewsArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsArticleDialog: React.FC<NewsArticleDialogProps> = ({ article, open, onOpenChange }) => {
  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {article.category}
            </Badge>
            <span className="text-xs text-muted-foreground">{article.date}</span>
          </div>
          <DialogTitle className="text-xl">{article.title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="space-y-4">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.content}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewsArticleDialog;
