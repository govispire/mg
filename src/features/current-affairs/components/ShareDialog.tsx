import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Link2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Article } from './types';

interface ShareDialogProps {
  article: Article | null;
  onClose: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ article, onClose }) => {
  if (!article) return null;

  const getShareUrl = (article: Article) => {
    return `${window.location.origin}/current-affairs/${article.id}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareToSocial = (platform: string, article: Article) => {
    const url = getShareUrl(article);
    const text = encodeURIComponent(article.title);
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={!!article} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Article
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{article.title}</p>
          
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 hover:border-blue-500"
              onClick={() => shareToSocial('twitter', article)}
            >
              <Twitter className="h-5 w-5 text-blue-400" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 hover:border-blue-700"
              onClick={() => shareToSocial('facebook', article)}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 hover:border-blue-600"
              onClick={() => shareToSocial('linkedin', article)}
            >
              <Linkedin className="h-5 w-5 text-blue-700" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-green-50 hover:border-green-500"
              onClick={() => shareToSocial('whatsapp', article)}
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate flex-1">{getShareUrl(article)}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => copyToClipboard(getShareUrl(article))}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
