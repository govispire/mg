
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText, Search, Eye, Filter } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useGlobalContentFilter } from '@/hooks/useGlobalContentFilter';

import { pdfCategories, pdfData, PDFItem } from '@/data/pdfData';

const PDFCourses = () => {
  const [activeTab, setActiveTab] = useState('english');
  const [searchQuery, setSearchQuery] = useState('');
  const { filterContent, hasActiveFilters } = useGlobalContentFilter();

  // Filter categories based on selected exam categories
  const filteredCategories = useMemo(() => {
    if (!hasActiveFilters) return pdfCategories;

    return pdfCategories.filter(category =>
      category.categories.some(cat =>
        filterContent([{ id: cat, categories: [cat] }]).length > 0
      )
    );
  }, [pdfCategories, filterContent, hasActiveFilters]);

  // Get PDFs for the active tab with filtering applied
  const allPDFs = useMemo(() => {
    const pdfs = pdfData[activeTab as keyof typeof pdfData] as PDFItem[] || [];
    return filterContent(pdfs);
  }, [activeTab, filterContent]);

  // Apply search filtering
  const filteredPDFs = useMemo(() => {
    return allPDFs.filter(pdf =>
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.examType?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPDFs, searchQuery]);

  // Get statistics for filtered content
  const originalPDFs = pdfData[activeTab as keyof typeof pdfData] as PDFItem[] || [];
  const stats = {
    total: originalPDFs.length,
    filtered: filteredPDFs.length,
    hidden: originalPDFs.length - filteredPDFs.length
  };

  const handleDownload = (pdfTitle: string) => {
    toast({
      title: "Download started",
      description: `${pdfTitle} is being downloaded.`,
    });
  };

  const handleView = (pdfTitle: string) => {
    toast({
      title: "Viewing PDF",
      description: `Opening ${pdfTitle} for preview.`,
    });
  };

  // Update active tab if current tab is not available in filtered categories
  React.useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find(cat => cat.id === activeTab)) {
      setActiveTab(filteredCategories[0].id);
    }
  }, [filteredCategories, activeTab]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">PDF Courses & Materials</h1>
          <p className="text-gray-500">Download study materials and reference guides</p>
          {hasActiveFilters && (
            <p className="text-sm text-blue-600 mt-1">
              Content filtered by your selected exam categories
            </p>
          )}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search PDF materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>



      {/* No categories available message */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No PDF Materials Available</h2>
          <p className="text-gray-600 mb-4">
            No PDF materials are available for your selected exam categories.
          </p>
          <p className="text-sm text-gray-500">
            Try selecting different exam categories or clear your current selection.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="english" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex overflow-x-auto pb-2 w-full justify-start">
            {filteredCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="px-4 relative">
                {category.name}
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {(pdfData[category.id as keyof typeof pdfData] as PDFItem[])?.filter(pdf =>
                      filterContent([pdf]).length > 0
                    ).length || 0}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {filteredCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              {filteredPDFs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPDFs.map((pdf) => (
                    <Card key={pdf.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                      <div className={`${pdf.color} p-0 relative overflow-hidden`}>
                        <AspectRatio ratio={4 / 3} className="bg-muted">
                          <img
                            src={pdf.image}
                            alt={pdf.title}
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{pdf.title}</h3>

                        {/* Exam Type Badge */}
                        {pdf.examType && (
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs">
                              {pdf.examType}
                            </Badge>
                          </div>
                        )}

                        <div className="flex justify-between mb-3 text-sm text-gray-500">
                          <div>{pdf.size}</div>
                          <div>Added: {pdf.date}</div>
                        </div>
                        <div className="text-xs text-gray-400 mb-4">{pdf.downloads} downloads</div>
                        <div className="flex gap-2">
                          <Button className="flex-1" onClick={() => handleDownload(pdf.title)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => handleView(pdf.title)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery
                      ? "No PDF materials found for this search"
                      : hasActiveFilters
                        ? "No PDF materials available for your selected exam categories"
                        : "No PDF materials found for this category"
                    }
                  </p>
                  {searchQuery && (
                    <p className="text-sm text-gray-400 mt-2">
                      Try adjusting your search query or browse another category
                    </p>
                  )}
                  {hasActiveFilters && !searchQuery && (
                    <p className="text-sm text-gray-400 mt-2">
                      Materials will appear here when you select relevant exam categories
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default PDFCourses;
