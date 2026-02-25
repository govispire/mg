import jsPDF from 'jspdf';
import { Article } from '@/components/current-affairs/types';

export const generateArticlesPDF = (articles: Article[], title: string) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Total Articles: ${articles.length}`, 20, 36);
  
  let yPos = 50;
  const pageHeight = 280;
  const margin = 20;
  const lineHeight = 6;
  
  articles.forEach((article, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    // Article number and title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const titleText = `${index + 1}. ${article.title}`;
    const titleLines = doc.splitTextToSize(titleText, 170);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * lineHeight + 2;
    
    // Importance and date
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Priority: ${article.importance.toUpperCase()} | Date: ${article.date} | Read Time: ${article.readTime}`, margin, yPos);
    yPos += lineHeight + 2;
    
    // Excerpt
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const excerptLines = doc.splitTextToSize(article.excerpt, 170);
    doc.text(excerptLines, margin, yPos);
    yPos += excerptLines.length * lineHeight + 2;
    
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
    if (article.tags.length > 0) {
      yPos += 2;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text(`Tags: ${article.tags.join(', ')}`, margin, yPos);
      yPos += lineHeight;
    }
    
    // Separator
    yPos += 8;
    if (yPos < pageHeight - 10) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, 190, yPos);
      yPos += 10;
    }
  });
  
  // Save the PDF
  const fileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateTopicPDF = (articles: Article[], topic: string) => {
  generateArticlesPDF(articles, `${topic} - Current Affairs`);
};

export const generateDailyNewsPDF = (articles: Article[], date: string) => {
  generateArticlesPDF(articles, `Daily News - ${date}`);
};
