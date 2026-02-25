import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bookmark, FileText, ArrowRight, Trash2 } from 'lucide-react';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { allArticles } from '@/components/current-affairs/articlesData';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const SavedArticlesButton = () => {
    const { savedArticleIds, toggleSave } = useSavedArticles();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const savedArticles = allArticles.filter(article => savedArticleIds.includes(article.id));

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    <span className="hidden sm:inline">Saved Articles</span>
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 justify-center">
                        {savedArticleIds.length}
                    </Badge>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Bookmark className="h-5 w-5 text-primary" />
                        Saved Articles
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    {savedArticles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12 text-muted-foreground">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <Bookmark className="h-8 w-8 opacity-50" />
                            </div>
                            <p className="font-medium mb-1">No saved articles</p>
                            <p className="text-sm">Bookmark articles to read them later</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {savedArticles.map(article => (
                                <Card key={article.id} className="overflow-hidden group hover:shadow-md transition-all">
                                    <CardContent className="p-0">
                                        <div className="p-4 cursor-pointer" onClick={() => { setIsOpen(false); navigate(`/current-affairs/${article.id}`); }}>
                                            <div className="flex justify-between items-start gap-3 mb-2">
                                                <Badge variant="outline" className="text-xs">{article.category}</Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive -mt-1 -mr-1"
                                                    onClick={(e) => { e.stopPropagation(); toggleSave(article.id); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <h4 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {article.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{article.date}</span>
                                                <span>•</span>
                                                <span>{article.readTime}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
