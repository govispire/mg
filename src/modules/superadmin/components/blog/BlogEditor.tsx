import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Eye, Upload, Link as LinkIcon, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogArticle, BlogCategory, BlogStatus } from '@/types/blog';
import { createBlog, updateBlog, generateSlug, calculateReadingTime } from '@/data/blogsData';
import { toast } from 'sonner';

interface BlogEditorProps {
    blog: BlogArticle | null;
    onClose: () => void;
    onSave: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ blog, onClose, onSave }) => {
    const [title, setTitle] = useState(blog?.title || '');
    const [slug, setSlug] = useState(blog?.slug || '');
    const [content, setContent] = useState(blog?.content || '');
    const [excerpt, setExcerpt] = useState(blog?.excerpt || '');
    const [category, setCategory] = useState<BlogCategory>(blog?.category || 'Study Tips');
    const [tags, setTags] = useState<string[]>(blog?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [featuredImage, setFeaturedImage] = useState(blog?.featuredImage || '');
    const [status, setStatus] = useState<BlogStatus>(blog?.status || 'draft');
    const [scheduledDate, setScheduledDate] = useState(
        blog?.scheduledDate ? new Date(blog.scheduledDate).toISOString().slice(0, 16) : ''
    );
    const [metaDescription, setMetaDescription] = useState(blog?.seoMeta.metaDescription || '');

    const categories: BlogCategory[] = [
        'Banking Exams',
        'SSC Exams',
        'Railway Exams',
        'UPSC',
        'TNPSC',
        'Defence Exams',
        'MBA Entrance',
        'Regulatory Exams',
        'Study Tips',
    ];

    // Auto-generate slug from title
    useEffect(() => {
        if (!blog && title) {
            setSlug(generateSlug(title));
        }
    }, [title, blog]);

    // Auto-generate excerpt from content if not set
    useEffect(() => {
        if (!excerpt && content) {
            const textContent = content.replace(/<[^>]*>/g, '').substring(0, 200);
            setExcerpt(textContent + '...');
        }
    }, [content, excerpt]);

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleSave = (saveStatus: BlogStatus = 'draft') => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (!content.trim()) {
            toast.error('Please enter content');
            return;
        }

        const readTime = calculateReadingTime(content);

        const blogData = {
            title: title.trim(),
            slug: slug.trim() || generateSlug(title),
            content: content.trim(),
            excerpt: excerpt.trim() || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
            category,
            tags,
            author: {
                id: 'super-admin',
                name: 'Admin',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
            },
            featuredImage: featuredImage || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
            images: [],
            videos: [],
            status: saveStatus,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            publishedDate: saveStatus === 'published' ? new Date() : undefined,
            readTime,
            seoMeta: {
                metaTitle: title,
                metaDescription: metaDescription || excerpt,
                keywords: tags,
            },
            aiGenerated: false,
        };

        if (blog) {
            // Update existing blog
            updateBlog(blog.id, blogData);
            toast.success('Article updated successfully');
        } else {
            // Create new blog
            createBlog(blogData);
            toast.success('Article created successfully');
        }

        onSave();
    };

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

        setContent(newText);

        // Set cursor position
        setTimeout(() => {
            textarea.focus();
            if (selectedText) {
                textarea.setSelectionRange(start + before.length, end + before.length);
            } else {
                textarea.setSelectionRange(start + before.length, start + before.length);
            }
        }, 0);
    };

    return (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4 mr-2" />
                            Close
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <h2 className="text-xl font-semibold">
                            {blog ? 'Edit Article' : 'Create New Article'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => handleSave('draft')}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button onClick={() => handleSave('published')}>
                            Publish Now
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Editor */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Title */}
                        <div>
                            <Input
                                placeholder="Article Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-2xl font-bold border-0 focus-visible:ring-0 px-0"
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <Label className="text-sm text-muted-foreground">
                                URL Slug: /{slug || 'article-slug'}
                            </Label>
                            <Input
                                placeholder="article-slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        {/* Editor Toolbar */}
                        <Card className="p-2">
                            <div className="flex flex-wrap gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => insertMarkdown('<h1>', '</h1>')}
                                    title="Heading 1"
                                >
                                    H1
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => insertMarkdown('<h2>', '</h2>')}
                                    title="Heading 2"
                                >
                                    H2
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => insertMarkdown('<strong>', '</strong>')}
                                    title="Bold"
                                >
                                    <strong>B</strong>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => insertMarkdown('<em>', '</em>')}
                                    title="Italic"
                                >
                                    <em>I</em>
                                </Button>
                                <Separator orientation="vertical" className="h-6 my-auto" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => insertMarkdown('<ul>\n<li>', '</li>\n</ul>')}
                                    title="Bullet List"
                                >
                                    • List
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => insertMarkdown('<ol>\n<li>', '</li>\n</ol>')}
                                    title="Numbered List"
                                >
                                    1. List
                                </Button>
                                <Separator orientation="vertical" className="h-6 my-auto" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => insertMarkdown('<a href="">', '</a>')}
                                    title="Link"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => insertMarkdown('<img src="" alt="" />')}
                                    title="Image"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>

                        {/* Content Editor */}
                        <Tabs defaultValue="edit">
                            <TabsList>
                                <TabsTrigger value="edit">Edit</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                            </TabsList>

                            <TabsContent value="edit" className="mt-2">
                                <Textarea
                                    id="content-editor"
                                    placeholder="Write your article content here... (HTML supported)"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[500px] font-mono text-sm"
                                />
                            </TabsContent>

                            <TabsContent value="preview" className="mt-2">
                                <Card className="p-6 min-h-[500px] prose max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: content || '<p>No content yet...</p>' }} />
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Excerpt */}
                        <div>
                            <Label>Excerpt</Label>
                            <Textarea
                                placeholder="Short description of the article..."
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Featured Image */}
                        <Card className="p-4">
                            <Label className="text-sm font-semibold">Featured Image</Label>
                            <div className="mt-2">
                                {featuredImage && (
                                    <img
                                        src={featuredImage}
                                        alt="Featured"
                                        className="w-full h-32 object-cover rounded mb-2"
                                    />
                                )}
                                <Input
                                    placeholder="Image URL"
                                    value={featuredImage}
                                    onChange={(e) => setFeaturedImage(e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                        </Card>

                        {/* Category */}
                        <Card className="p-4">
                            <Label className="text-sm font-semibold">Category</Label>
                            <Select value={category} onValueChange={(val) => setCategory(val as BlogCategory)}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Card>

                        {/* Tags */}
                        <Card className="p-4">
                            <Label className="text-sm font-semibold">Tags</Label>
                            <div className="mt-2 space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add tag..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    />
                                    <Button onClick={handleAddTag} size="sm">
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                                            {tag} <X className="h-3 w-3 ml-1" />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Status & Scheduling */}
                        <Card className="p-4">
                            <Label className="text-sm font-semibold">Publishing</Label>
                            <div className="mt-2 space-y-3">
                                <Select value={status} onValueChange={(val) => setStatus(val as BlogStatus)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>

                                {status === 'scheduled' && (
                                    <div>
                                        <Label className="text-xs">Schedule Date</Label>
                                        <Input
                                            type="datetime-local"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* SEO */}
                        <Card className="p-4">
                            <Label className="text-sm font-semibold">SEO Meta Description</Label>
                            <Textarea
                                placeholder="SEO description..."
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                className="mt-2"
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {metaDescription.length}/160 characters
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
