import React, { useState } from 'react';
import { Sparkles, Upload, Link as LinkIcon, FileText, Wand2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { InputType, BlogCategory, AudienceLevel, ToneType, LengthType, GeneratedBlog } from '@/types/blog';
import { generateBlogContent, checkPlagiarism, fetchURLContent, extractTextFromImage } from '@/utils/aiContentGenerator';
import { createBlog } from '@/data/blogsData';
import { toast } from 'sonner';

const AIBlogCreator = () => {
    const [inputType, setInputType] = useState<InputType>('agenda');
    const [inputContent, setInputContent] = useState('');
    const [url, setUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Metadata
    const [category, setCategory] = useState<BlogCategory>('Study Tips');
    const [audience, setAudience] = useState<AudienceLevel>('Beginner');
    const [tone, setTone] = useState<ToneType>('Conversational');
    const [length, setLength] = useState<LengthType>('medium');

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);

    // Plagiarism checking state
    const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
    const [plagiarismChecked, setPlagiarismChecked] = useState(false);

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

    const handleFetchURL = async () => {
        if (!url.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        try {
            toast.loading('Fetching content from URL...');
            const content = await fetchURLContent(url);
            setInputContent(content);
            setInputType('text');
            toast.success('Content fetched successfully');
        } catch (error) {
            toast.error('Failed to fetch URL content');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        setImageFile(file);

        try {
            toast.loading('Extracting text from image...');
            const extractedText = await extractTextFromImage(file);
            setInputContent(extractedText);
            setInputType('text');
            toast.success('Text extracted successfully');
        } catch (error) {
            toast.error('Failed to extract text from image');
        }
    };

    const handleGenerate = async () => {
        if (!inputContent.trim()) {
            toast.error('Please provide content or agenda');
            return;
        }

        setIsGenerating(true);
        setPlagiarismChecked(false);

        try {
            toast.loading('Generating blog content with AI...');

            const result = await generateBlogContent({
                type: inputType,
                content: inputContent,
                metadata: {
                    category,
                    audience,
                    tone,
                    length,
                },
            });

            setGeneratedBlog(result);
            toast.success('Blog content generated successfully!');

            // Auto-check plagiarism
            setTimeout(() => handleCheckPlagiarism(result), 1000);
        } catch (error) {
            toast.error('Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCheckPlagiarism = async (blog: GeneratedBlog = generatedBlog!) => {
        if (!blog) return;

        setIsCheckingPlagiarism(true);

        try {
            const result = await checkPlagiarism(blog.content);

            setGeneratedBlog({
                ...blog,
                plagiarismScore: result.score,
                plagiarismSources: result.paragraphs.flatMap(p => p.matches),
            });

            setPlagiarismChecked(true);

            if (result.passed) {
                toast.success(`Plagiarism check passed! Score: ${result.score}%`);
            } else {
                toast.warning(`Plagiarism too high: ${result.score}%. Please regenerate.`);
            }
        } catch (error) {
            toast.error('Failed to check plagiarism');
        } finally {
            setIsCheckingPlagiarism(false);
        }
    };

    const handleSaveToDrafts = () => {
        if (!generatedBlog) return;

        if (!plagiarismChecked) {
            toast.error('Please run plagiarism check first');
            return;
        }

        if (generatedBlog.plagiarismScore > 10) {
            toast.error('Plagiarism score too high. Please regenerate content.');
            return;
        }

        // Insert tables and images into content
        let finalContent = generatedBlog.content;

        // Insert tables
        generatedBlog.tables.forEach(table => {
            const tableHTML = `
        <h3>${table.title}</h3>
        <table border="1" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <thead>
            <tr>${table.headers.map(h => `<th style="padding: 8px; background: #f0f0f0;">${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${table.rows.map(row => `<tr>${row.map(cell => `<td style="padding: 8px;">${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      `;
            // Insert at position (simplified - just append for now)
            finalContent += tableHTML;
        });

        // Insert images
        generatedBlog.images.forEach(img => {
            const imageHTML = `
        <figure style="margin: 20px 0;">
          <img src="${img.url}" alt="${img.alt}" style="max-width: 100%; height: auto;" />
          <figcaption style="font-size: 0.9em; color: #666; margin-top: 8px;">${img.caption}</figcaption>
        </figure>
      `;
            finalContent += imageHTML;
        });

        createBlog({
            title: generatedBlog.title,
            slug: generatedBlog.slug,
            content: finalContent,
            excerpt: generatedBlog.excerpt,
            category: generatedBlog.category,
            tags: generatedBlog.tags,
            author: {
                id: 'ai',
                name: 'AI Content Writer',
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop',
            },
            featuredImage: generatedBlog.images[0]?.url || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
            images: [],
            videos: [],
            status: 'draft',
            readTime: Math.ceil(finalContent.split(' ').length / 200),
            seoMeta: {
                metaTitle: generatedBlog.title,
                metaDescription: generatedBlog.excerpt,
                keywords: generatedBlog.tags,
            },
            aiGenerated: true,
            plagiarismScore: generatedBlog.plagiarismScore,
            sources: generatedBlog.sources,
        });

        toast.success('Blog saved to drafts! Check Blog Manager to publish.');

        // Reset form
        setInputContent('');
        setGeneratedBlog(null);
        setPlagiarismChecked(false);
    };

    const getPlagiarismColor = (score: number) => {
        if (score < 5) return 'text-green-600';
        if (score < 10) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">AI Blog Creator</h1>
                    <p className="text-muted-foreground">
                        Generate high-quality blog content using AI
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Panel */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Input</CardTitle>
                            <CardDescription>
                                Choose how you want to provide the content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={inputType} onValueChange={(val) => setInputType(val as InputType)}>
                                <TabsList className="grid grid-cols-4">
                                    <TabsTrigger value="url">
                                        <LinkIcon className="h-4 w-4" />
                                    </TabsTrigger>
                                    <TabsTrigger value="text">
                                        <FileText className="h-4 w-4" />
                                    </TabsTrigger>
                                    <TabsTrigger value="image">
                                        <Upload className="h-4 w-4" />
                                    </TabsTrigger>
                                    <TabsTrigger value="agenda">
                                        <Wand2 className="h-4 w-4" />
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="url" className="space-y-3">
                                    <Label>Article URL</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="https://example.com/article"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                        />
                                        <Button onClick={handleFetchURL}>Fetch</Button>
                                    </div>
                                    {inputContent && (
                                        <Alert>
                                            <CheckCircle className="h-4 w-4" />
                                            <AlertDescription>Content loaded successfully</AlertDescription>
                                        </Alert>
                                    )}
                                </TabsContent>

                                <TabsContent value="text" className="space-y-3">
                                    <Label>Paste Article Content</Label>
                                    <Textarea
                                        placeholder="Paste your article or long text here..."
                                        value={inputContent}
                                        onChange={(e) => setInputContent(e.target.value)}
                                        rows={10}
                                    />
                                </TabsContent>

                                <TabsContent value="image" className="space-y-3">
                                    <Label>Upload Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    {imageFile && (
                                        <p className="text-sm text-muted-foreground">
                                            Selected: {imageFile.name}
                                        </p>
                                    )}
                                    {inputContent && (
                                        <Alert>
                                            <CheckCircle className="h-4 w-4" />
                                            <AlertDescription>Text extracted from image</AlertDescription>
                                        </Alert>
                                    )}
                                </TabsContent>

                                <TabsContent value="agenda" className="space-y-3">
                                    <Label>Content Agenda</Label>
                                    <Textarea
                                        placeholder="Enter bullet points or brief agenda:&#10;• Topic overview&#10;• Key points to cover&#10;• Important  sections"
                                        value={inputContent}
                                        onChange={(e) => setInputContent(e.target.value)}
                                        rows={10}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Generation Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Generation Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Category</Label>
                                <Select value={category} onValueChange={(val) => setCategory(val as BlogCategory)}>
                                    <SelectTrigger className="mt-1">
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
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm">Audience</Label>
                                    <Select value={audience} onValueChange={(val) => setAudience(val as AudienceLevel)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm">Tone</Label>
                                    <Select value={tone} onValueChange={(val) => setTone(val as ToneType)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Formal">Formal</SelectItem>
                                            <SelectItem value="Conversational">Conversational</SelectItem>
                                            <SelectItem value="Motivational">Motivational</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm">Length</Label>
                                    <Select value={length} onValueChange={(val) => setLength(val as LengthType)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="short">Short</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="long">Long</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !inputContent.trim()}
                                className="w-full"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="h-4 w-4 mr-2" />
                                        Generate Blog Content
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Panel */}
                <div className="space-y-4">
                    {generatedBlog ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Generated Content</CardTitle>
                                    <CardDescription>
                                        AI-generated blog article preview
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold">{generatedBlog.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Slug: /{generatedBlog.slug}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge>{generatedBlog.category}</Badge>
                                        {generatedBlog.tags.map(tag => (
                                            <Badge key={tag} variant="outline">{tag}</Badge>
                                        ))}
                                    </div>

                                    <Separator />

                                    <div className="prose max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: generatedBlog.content }} />
                                    </div>

                                    {generatedBlog.tables.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Suggested Tables ({generatedBlog.tables.length})</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Tables will be automatically inserted into content
                                            </p>
                                        </div>
                                    )}

                                    {generatedBlog.images.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Suggested Images ({generatedBlog.images.length})</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {generatedBlog.images.map((img, idx) => (
                                                    <div key={idx}>
                                                        <img src={img.url} alt={img.alt} className="rounded w-full h-24 object-cover" />
                                                        <p className="text-xs text-muted-foreground mt-1">{img.caption}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Plagiarism Check */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plagiarism Check</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isCheckingPlagiarism ? (
                                        <div className="text-center py-4">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Checking for plagiarism...</p>
                                        </div>
                                    ) : plagiarismChecked ? (
                                        <>
                                            <div className="text-center">
                                                <div className={`text-4xl font-bold ${getPlagiarismColor(generatedBlog.plagiarismScore)}`}>
                                                    {generatedBlog.plagiarismScore}%
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Plagiarism Score
                                                </p>
                                            </div>

                                            <Progress
                                                value={generatedBlog.plagiarismScore}
                                                className="h-2"
                                            />

                                            {generatedBlog.plagiarismScore < 10 ? (
                                                <Alert className="border-green-500 bg-green-50">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <AlertDescription className="text-green-800">
                                                        Content passes plagiarism check! Safe to publish.
                                                    </AlertDescription>
                                                </Alert>
                                            ) : (
                                                <Alert className="border-red-500 bg-red-50">
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                    <AlertDescription className="text-red-800">
                                                        Plagiarism score too high. Please regenerate content or edit manually.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm">Verified Sources</h4>
                                                {generatedBlog.sources.map((source, idx) => (
                                                    <div key={idx} className="text-sm p-2 bg-muted rounded">
                                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                            {source.title}
                                                        </a>
                                                        <p className="text-xs text-muted-foreground">Credibility: {source.credibility}%</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <Button onClick={() => handleCheckPlagiarism()} className="w-full">
                                            Run Plagiarism Check
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSaveToDrafts}
                                    disabled={!plagiarismChecked || generatedBlog.plagiarismScore > 10}
                                    className="flex-1"
                                >
                                    Save to Drafts
                                </Button>
                                <Button
                                    onClick={handleGenerate}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Regenerate
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    Provide content and click "Generate" to create your blog article
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

// Alert component helper (if not exists)
const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-3 rounded-lg border ${className}`}>
        <div className="flex items-start gap-2">
            {children}
        </div>
    </div>
);

const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <p className={`text-sm ${className}`}>{children}</p>
);

export default AIBlogCreator;
