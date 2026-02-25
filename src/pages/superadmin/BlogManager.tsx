import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BlogArticle, BlogStatus, BlogCategory } from '@/types/blog';
import { getBlogs, deleteBlog } from '@/data/blogsData';
import { BlogEditor } from '@/components/superadmin/blog/BlogEditor';
import { toast } from 'sonner';

const BlogManager = () => {
    const [blogs, setBlogs] = useState<BlogArticle[]>(getBlogs());
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);

    const categories: (BlogCategory | 'All')[] = [
        'All',
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

    const statuses = ['all', 'draft', 'scheduled', 'published', 'archived'];

    // Filter blogs
    const filteredBlogs = getBlogs({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery,
    });

    const handleCreateNew = () => {
        setEditingBlog(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (blog: BlogArticle) => {
        setEditingBlog(blog);
        setIsEditorOpen(true);
    };

    const handleDelete = (blogId: string) => {
        if (confirm('Are you sure you want to delete this article?')) {
            if (deleteBlog(blogId)) {
                setBlogs(getBlogs());
                toast.success('Article deleted successfully');
            } else {
                toast.error('Failed to delete article');
            }
        }
    };

    const handleSave = () => {
        setBlogs(getBlogs());
        setIsEditorOpen(false);
        setEditingBlog(null);
    };

    const getStatusBadge = (status: BlogStatus) => {
        const variants: Record<BlogStatus, string> = {
            draft: 'bg-gray-500',
            scheduled: 'bg-blue-500',
            published: 'bg-green-500',
            archived: 'bg-orange-500',
        };

        return (
            <Badge className={`${variants[status]} text-white`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (isEditorOpen) {
        return <BlogEditor blog={editingBlog} onClose={() => setIsEditorOpen(false)} onSave={handleSave} />;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Blog Manager</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all blog articles, drafts, and scheduled posts
                    </p>
                </div>
                <Button onClick={handleCreateNew} size="lg" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Article
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Total Articles</div>
                    <div className="text-2xl font-bold mt-1">{blogs.length}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Published</div>
                    <div className="text-2xl font-bold mt-1 text-green-600">
                        {blogs.filter((b) => b.status === 'published').length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Drafts</div>
                    <div className="text-2xl font-bold mt-1 text-gray-600">
                        {blogs.filter((b) => b.status === 'draft').length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Scheduled</div>
                    <div className="text-2xl font-bold mt-1 text-blue-600">
                        {blogs.filter((b) => b.status === 'scheduled').length}
                    </div>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Views</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBlogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No articles found. Create your first article to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBlogs.map((blog) => (
                                <TableRow key={blog.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={blog.featuredImage}
                                                alt={blog.title}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                            <div>
                                                <div className="font-medium line-clamp-1">{blog.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {blog.readTime} min read
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{blog.category}</Badge>
                                    </TableCell>
                                    <TableCell>{blog.author.name}</TableCell>
                                    <TableCell>{getStatusBadge(blog.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(blog.publishedDate || blog.createdAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{blog.views.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(blog)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default BlogManager;
