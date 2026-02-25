import { GeneratedBlog, BlogInput, PlagiarismResult } from '@/types/blog';

/**
 * AI Content Generation Utilities
 * In production, this would call actual AI APIs (OpenAI, Gemini, etc.)
 */

/**
 * Generate blog content from input
 */
export const generateBlogContent = async (input: BlogInput): Promise<GeneratedBlog> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock generation based on input type
    const { type, content, metadata } = input;

    // Generate title based on input
    const title = generateTitle(content, metadata.category);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Generate content paragraphs
    const generatedContent = generateContent(content, metadata);

    // Generate excerpt
    const excerpt = generatedContent.substring(0, 200).replace(/<[^>]*>/g, '') + '...';

    // Generate tags
    const tags = generateTags(metadata.category);

    // Suggest images
    const images = suggestImages(metadata.category);

    // Suggest tables
    const tables = suggestTables(metadata.category);

    // Mock sources
    const sources = generateSources(metadata.category);

    return {
        title,
        slug,
        content: generatedContent,
        excerpt,
        category: metadata.category,
        tags,
        images,
        tables,
        sources,
        plagiarismScore: 0, // Will be set by plagiarism checker
        plagiarismSources: [],
    };
};

/**
 * Check content for plagiarism
 */
export const checkPlagiarism = async (content: string): Promise<PlagiarismResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock plagiarism check - in production, use real API
    const textContent = content.replace(/<[^>]*>/g, '');
    const paragraphs = textContent.split('\n\n').filter(p => p.trim().length > 0);

    const results = paragraphs.map(para => ({
        text: para,
        matches: [],
        score: Math.random() * 5, // Random score 0-5%
    }));

    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
        score: Math.round(overallScore * 10) / 10,
        paragraphs: results,
        passed: overallScore < 10,
    };
};

/**
 * Fetch content from URL
 */
export const fetchURLContent = async (url: string): Promise<string> => {
    // In production, use a proper web scraping service
    await new Promise(resolve => setTimeout(resolve, 1500));

    return `Content fetched from ${url}. This would contain the actual article content in production.`;
};

/**
 * Extract text from image using OCR
 */
export const extractTextFromImage = async (imageFile: File): Promise<string> => {
    // In production, use OCR service like Google Vision API, Tesseract.js
    await new Promise(resolve => setTimeout(resolve, 2000));

    return `Extracted text from image: ${imageFile.name}. This would contain actual OCR text in production.`;
};

// Helper functions for mock generation

function generateTitle(content: string, category: string): string {
    const templates = [
        `Complete Guide to ${category}: Everything You Need to Know`,
        `${category} 2025: Preparation Strategy and Expert Tips`,
        `Mastering ${category}: A Comprehensive Guide for Aspirants`,
        `${category} Success: Proven Strategies and Study Plans`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

function generateContent(input: string, metadata: any): string {
    const { category, audience, tone, length } = metadata;

    const wordCount = length === 'short' ? 600 : length === 'medium' ? 1200 : 2000;

    // Generate HTML content
    let content = `<h1>Introduction to ${category}</h1>\n`;
    content += `<p>Welcome to this comprehensive guide on ${category}. This article is designed for ${audience.toLowerCase()} level aspirants looking to excel in their preparation.</p>\n`;

    content += `<h2>Key Topics Covered</h2>\n`;
    content += `<p>In this guide, we'll explore the essential aspects of ${category} preparation, including:</p>\n`;
    content += `<ul>
    <li>Understanding the exam pattern and syllabus</li>
    <li>Creating an effective study plan</li>
    <li>Important topics and their weightage</li>
    <li>Time management strategies</li>
    <li>Recommended resources and books</li>
  </ul>\n`;

    content += `<h2>Exam Pattern Overview</h2>\n`;
    content += `<p>The ${category} follows a structured pattern that tests candidates on various subjects. Understanding this pattern is crucial for effective preparation.</p>\n`;

    content += `<h2>Preparation Strategy</h2>\n`;
    content += `<p>A well-planned strategy is the foundation of success. Here's a step-by-step approach:</p>\n`;
    content += `<ol>
    <li><strong>Understand the Syllabus:</strong> Thoroughly go through the official syllabus and identify important topics.</li>
    <li><strong>Create a Timeline:</strong> Divide your preparation into phases - foundation, practice, and revision.</li>
    <li><strong>Practice Regularly:</strong> Solve previous year papers and take mock tests to track progress.</li>
    <li><strong>Stay Updated:</strong> Keep up with current affairs and latest exam notifications.</li>
  </ol>\n`;

    content += `<h2>Important Tips from Toppers</h2>\n`;
    content += `<p>Here are some proven tips from successful candidates who have cracked ${category} exams:</p>\n`;
    content += `<ul>
    <li>Maintain consistency in your study routine</li>
    <li>Focus on understanding concepts rather than rote learning</li>
    <li>Regular revision is key to retention</li>
    <li>Take care of your health and manage stress effectively</li>
  </ul>\n`;

    content += `<h2>Conclusion</h2>\n`;
    content += `<p>Success in ${category} requires dedication, smart work, and the right strategy. Follow this guide, stay focused, and you'll be well on your way to achieving your goals. All the best!</p>\n`;

    return content;
}

function generateTags(category: string): string[] {
    const baseTags = [category, 'Exam Preparation', 'Study Tips'];
    const extraTags = ['Strategy', 'Syllabus', '2025', 'Guide', 'Mock Tests'];
    return [...baseTags, ...extraTags.slice(0, 3)];
}

function suggestImages(category: string) {
    return [
        {
            url: `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop`,
            caption: 'Students preparing for competitive exams',
            alt: 'Exam preparation study setup',
            position: 1,
        },
        {
            url: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop`,
            caption: 'Time management and planning',
            alt: 'Study planning and organization',
            position: 3,
        },
    ];
}

function suggestTables(category: string) {
    return [
        {
            title: 'Exam Pattern Overview',
            headers: ['Section', 'Questions', 'Marks', 'Duration'],
            rows: [
                ['Reasoning Ability', '35', '35', '20 min'],
                ['Quantitative Aptitude', '35', '35', '20 min'],
                ['English Language', '30', '30', '20 min'],
                ['Total', '100', '100', '60 min'],
            ],
            position: 2,
        },
    ];
}

function generateSources(category: string) {
    return [
        {
            title: 'Official Website',
            url: 'https://example.com/official',
            credibility: 95,
            factsCited: ['Exam pattern', 'Syllabus details'],
        },
        {
            title: 'Previous Year Analysis',
            url: 'https://example.com/analysis',
            credibility: 85,
            factsCited: ['Cutoff trends', 'Topic wise distribution'],
        },
    ];
}
