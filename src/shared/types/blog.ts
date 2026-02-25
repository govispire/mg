/**
 * Type definitions for blog articles and related entities
 */

export type BlogStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type BlogCategory = 'Banking Exams' | 'SSC Exams' | 'Railway Exams' | 'UPSC' | 'TNPSC' | 'Defence Exams' | 'MBA Entrance' | 'Regulatory Exams' | 'Study Tips';
export type MediaType = 'image' | 'video';
export type InputType = 'url' | 'text' | 'image' | 'agenda';
export type AudienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ToneType = 'Formal' | 'Conversational' | 'Motivational';
export type LengthType = 'short' | 'medium' | 'long';

export interface Author {
    id: string;
    name: string;
    image: string;
    bio?: string;
}

export interface MediaFile {
    id: string;
    type: MediaType;
    url: string;
    localPath?: string;
    thumbnail?: string;
    caption?: string;
    alt?: string;
    uploadedAt: Date;
}

export interface Source {
    title: string;
    url: string;
    credibility: number; // 0-100
    factsCited: string[];
}

export interface PlagiarismMatch {
    text: string;
    source: string;
    similarity: number; // 0-100
    url?: string;
}

export interface PlagiarismResult {
    score: number; // Overall plagiarism percentage
    paragraphs: {
        text: string;
        matches: PlagiarismMatch[];
        score: number;
    }[];
    passed: boolean; // true if score < 10%
}

export interface GeneratedImage {
    url: string;
    caption: string;
    alt: string;
    position: number; // Paragraph index where to insert
}

export interface GeneratedTable {
    title: string;
    headers: string[];
    rows: string[][];
    position: number; // Paragraph index where to insert
}

export interface SEOMeta {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
}

export interface BlogArticle {
    id: string;
    title: string;
    slug: string;
    content: string; // HTML content
    excerpt: string;
    category: BlogCategory;
    tags: string[];
    author: Author;
    featuredImage: string;
    images: MediaFile[];
    videos: MediaFile[];
    status: BlogStatus;
    scheduledDate?: Date;
    publishedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    views: number;
    readTime: number; // minutes
    seoMeta: SEOMeta;
    aiGenerated: boolean;
    plagiarismScore?: number;
    sources?: Source[];
}

export interface BlogInput {
    type: InputType;
    content: string;
    metadata: {
        category: BlogCategory;
        audience: AudienceLevel;
        tone: ToneType;
        length: LengthType;
    };
}

export interface GeneratedBlog {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: BlogCategory;
    tags: string[];
    images: GeneratedImage[];
    tables: GeneratedTable[];
    sources: Source[];
    plagiarismScore: number;
    plagiarismSources: PlagiarismMatch[];
}

export interface BlogFilters {
    search: string;
    category: BlogCategory | 'All';
    status: BlogStatus | 'all';
    author?: string;
    dateFrom?: Date;
    dateTo?: Date;
}
