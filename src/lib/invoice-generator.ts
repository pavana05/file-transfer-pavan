import jsPDF from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  purchaseDate: string;
  planName: string;
  amount: number;
  userName: string;
  userEmail: string;
  paymentId: string;
  orderId: string;
}

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF();
  
  // Navy Blue Professional Color Palette
  const primaryColor = [25, 83, 159]; // Navy Blue
  const primaryLight = [41, 121, 208]; // Lighter Navy
  const accentColor = [52, 152, 219]; // Accent Blue
  const darkText = [20, 30, 45];
  const mutedText = [100, 116, 139];
  const lightBg = [248, 250, 252];
  
  // Page dimensions
  const pageWidth = 210;
  const margin = 20;
  
  // Header gradient background (simulated with rectangle)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 65, 'F');
  
  // Decorative accent line
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 65, pageWidth, 4, 'F');
  
  // Company Logo Area (circle)
  doc.setFillColor(255, 255, 255);
  doc.circle(35, 32, 15, 'F');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FS', 35, 36, { align: 'center' });
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('FileShare Pro', 58, 30);
  
  // Tagline
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255, 0.85);
  doc.text('Professional File Sharing Platform', 58, 40);
  
  // Invoice label with badge style
  doc.setFillColor(255, 255, 255, 0.2);
  doc.roundedRect(150, 18, 40, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 170, 26, { align: 'center' });
  
  // Invoice number and date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${data.invoiceNumber}`, 190, 42, { align: 'right' });
  doc.text(data.purchaseDate, 190, 50, { align: 'right' });
  
  // Main content area with subtle background
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(0, 69, pageWidth, 221, 'F');
  
  // Bill To Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 80, 80, 45, 4, 4, 'F');
  doc.setDrawColor(230, 235, 240);
  doc.roundedRect(margin, 80, 80, 45, 4, 4, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO', margin + 8, 92);
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(data.userName || 'Customer', margin + 8, 104);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text(data.userEmail, margin + 8, 114);
  
  // Payment Details Card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(110, 80, 80, 45, 4, 4, 'F');
  doc.setDrawColor(230, 235, 240);
  doc.roundedRect(110, 80, 80, 45, 4, 4, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFO', 118, 92);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment ID:`, 118, 103);
  doc.text(`Order ID:`, 118, 113);
  doc.text(`Status:`, 118, 123);
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(data.paymentId.slice(0, 18), 145, 103);
  doc.text(data.orderId.slice(0, 18), 145, 113);
  
  // Status badge
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(145, 117, 25, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PAID', 157.5, 122.5, { align: 'center' });
  
  // Order Details Table
  const tableTop = 140;
  
  // Table header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, tableTop, 170, 14, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', margin + 10, tableTop + 9);
  doc.text('QTY', 130, tableTop + 9, { align: 'center' });
  doc.text('AMOUNT', 180, tableTop + 9, { align: 'right' });
  
  // Table row
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, tableTop + 14, 170, 25, 'F');
  doc.setDrawColor(230, 235, 240);
  doc.line(margin, tableTop + 39, margin + 170, tableTop + 39);
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.planName} Plan`, margin + 10, tableTop + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text('Premium Subscription - One Time Purchase', margin + 10, tableTop + 32);
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(10);
  doc.text('1', 130, tableTop + 28, { align: 'center' });
  
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(data.amount / 100);
  
  doc.setFont('helvetica', 'bold');
  doc.text(formattedAmount, 180, tableTop + 28, { align: 'right' });
  
  // Summary section
  const summaryY = tableTop + 50;
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(110, summaryY, 80, 50, 4, 4, 'F');
  doc.setDrawColor(230, 235, 240);
  doc.roundedRect(110, summaryY, 80, 50, 4, 4, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text('Subtotal', 120, summaryY + 14);
  doc.text('Tax (0%)', 120, summaryY + 26);
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(formattedAmount, 180, summaryY + 14, { align: 'right' });
  doc.text('₹0', 180, summaryY + 26, { align: 'right' });
  
  // Total row with gradient
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(110, summaryY + 32, 80, 16, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL', 120, summaryY + 43);
  doc.setFontSize(13);
  doc.text(formattedAmount, 180, summaryY + 43, { align: 'right' });
  
  // Features unlocked section
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, summaryY, 80, 50, 4, 4, 'F');
  doc.setDrawColor(230, 235, 240);
  doc.roundedRect(margin, summaryY, 80, 50, 4, 4, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('FEATURES UNLOCKED', margin + 8, summaryY + 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  const features = ['✓ Premium File Sharing', '✓ Extended Storage', '✓ Priority Support'];
  features.forEach((feature, i) => {
    doc.text(feature, margin + 8, summaryY + 24 + (i * 10));
  });
  
  // Footer
  const footerY = 265;
  
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, footerY, pageWidth, 32, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for your purchase!', pageWidth / 2, footerY + 12, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('For support, contact support@fileshare.pro', pageWidth / 2, footerY + 22, { align: 'center' });
  
  // Decorative accent at very bottom
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 293, pageWidth, 7, 'F');
  
  return doc;
};

export const downloadInvoice = (data: InvoiceData): void => {
  const doc = generateInvoicePDF(data);
  doc.save(`FileShare_Invoice_${data.invoiceNumber}.pdf`);
};
