import jsPDF from 'jspdf';
import { Article } from '@/components/current-affairs/types';

export const generateArticlesPDF = (articles: Article[], title: string) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title || 'Current Affairs Compilation', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Total Articles: ${articles ? articles.length : 0}`, 20, 36);
  
  let yPos = 50;
  const pageHeight = 280;
  const margin = 20;
  const lineHeight = 6;
  
  (articles || []).forEach((article, index) => {
    if (!article) return;

    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    // Article number and title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const titleText = `${index + 1}. ${article.title || 'Untitled Article'}`;
    const titleLines = doc.splitTextToSize(titleText, 170);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * lineHeight + 2;
    
    // Importance and date
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const imp = (article.importance || 'normal').toUpperCase();
    const dt = article.date || '';
    const rt = article.readTime || '5 min';
    doc.text(`Priority: ${imp} | Date: ${dt} | Read Time: ${rt}`, margin, yPos);
    yPos += lineHeight + 2;
    
    // Excerpt
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const excerptText = article.excerpt || article.summary || '';
    if (excerptText) {
      const excerptLines = doc.splitTextToSize(excerptText, 170);
      doc.text(excerptLines, margin, yPos);
      yPos += excerptLines.length * lineHeight + 2;
    }
    
    // Content (if available)
    if (article.content) {
      const contentLines = doc.splitTextToSize(article.content.replace(/\*\*/g, ''), 170);
      contentLines.forEach((line: string) => {
        if (yPos > pageHeight - 10) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });
    }
    
    // Tags
    if (article.tags && article.tags.length > 0) {
      yPos += 2;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text(`Tags: ${article.tags.join(', ')}`, margin, yPos);
      yPos += lineHeight;
    }
    
    // Divider
    yPos += 6;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, yPos, 190, yPos);
    yPos += 8;
  });
  
  // Save the PDF
  const filename = `${(title || 'Compilation').toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export const generateDailyNewsPDF = (articles: Article[], date: string) => {
  return generateArticlesPDF(articles, `Daily News Digest - ${date}`);
};

export const generateTopicPDF = (articles: Article[], topic: string) => {
  return generateArticlesPDF(articles, `${topic} Topic Compilation`);
};
