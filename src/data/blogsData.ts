import { BlogArticle } from '@/types/blog';

/**
 * Mock blog data storage
 * In production, this would be replaced with API calls
 */

export const mockBlogs: BlogArticle[] = [
    {
        id: '1',
        title: 'Complete Guide to Crack IBPS PO 2025: Strategy, Syllabus & Expert Tips',
        slug: 'complete-guide-ibps-po-2025',
        content: '<p>Master the IBPS PO exam with our comprehensive preparation strategy...</p>',
        excerpt: 'Master the IBPS PO exam with our comprehensive preparation strategy covering all sections, time management tips, previous year analysis, and expert recommendations from toppers.',
        category: 'Banking Exams',
        tags: ['IBPS', 'PO', 'Banking', 'Strategy'],
        author: {
            id: 'author-1',
            name: 'Priya Sharma',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        },
        featuredImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
        images: [],
        videos: [],
        status: 'published',
        publishedDate: new Date('2025-01-15'),
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-15'),
        views: 1234,
        readTime: 12,
        seoMeta: {
            metaTitle: 'IBPS PO 2025 Preparation Guide - Complete Strategy',
            metaDescription: 'Complete guide to crack IBPS PO 2025 with expert tips and strategies',
            keywords: ['IBPS PO', 'Banking Exam', 'Preparation Strategy'],
        },
        aiGenerated: false,
    },
];

/**
 * Get all blogs with optional filters
 */
export const getBlogs = (filters?: {
    status?: string;
    category?: string;
    search?: string;
}): BlogArticle[] => {
    let filtered = [...mockBlogs];

    if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter(blog => blog.status === filters.status);
    }

    if (filters?.category && filters.category !== 'All') {
        filtered = filtered.filter(blog => blog.category === filters.category);
    }

    if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(blog =>
            blog.title.toLowerCase().includes(search) ||
            blog.excerpt.toLowerCase().includes(search) ||
            blog.content.toLowerCase().includes(search)
        );
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

/**
 * Get blog by ID
 */
export const getBlogById = (id: string): BlogArticle | undefined => {
    return mockBlogs.find(blog => blog.id === id);
};

/**
 * Get blog by slug
 */
export const getBlogBySlug = (slug: string): BlogArticle | undefined => {
    return mockBlogs.find(blog => blog.slug === slug);
};

/**
 * Create new blog
 */
export const createBlog = (blog: Omit<BlogArticle, 'id' | 'createdAt' | 'updatedAt' | 'views'>): BlogArticle => {
    const newBlog: BlogArticle = {
        ...blog,
        id: `blog-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
    };

    mockBlogs.push(newBlog);
    return newBlog;
};

/**
 * Update existing blog
 */
export const updateBlog = (id: string, updates: Partial<BlogArticle>): BlogArticle | null => {
    const index = mockBlogs.findIndex(blog => blog.id === id);
    if (index === -1) return null;

    mockBlogs[index] = {
        ...mockBlogs[index],
        ...updates,
        updatedAt: new Date(),
    };

    return mockBlogs[index];
};

/**
 * Delete blog
 */
export const deleteBlog = (id: string): boolean => {
    const index = mockBlogs.findIndex(blog => blog.id === id);
    if (index === -1) return false;

    mockBlogs.splice(index, 1);
    return true;
};

/**
 * Generate slug from title
 */
export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Calculate reading time based on content
 */
export const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML
    const words = textContent.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};
