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
  
  const primaryColor = [139, 92, 246]; // Purple
  const textColor = [30, 30, 30];
  const mutedColor = [120, 120, 120];
  
  // Header background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FileShare Pro', 20, 25);
  
  // Invoice label
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('INVOICE', 20, 38);
  
  // Invoice number on right
  doc.setFontSize(10);
  doc.text(`#${data.invoiceNumber}`, 190, 25, { align: 'right' });
  doc.text(data.purchaseDate, 190, 35, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  // Bill To section
  doc.setFontSize(10);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('BILL TO', 20, 70);
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.userName || 'Customer', 20, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(data.userEmail, 20, 88);
  
  // Payment details on right
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('PAYMENT DETAILS', 120, 70);
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(10);
  doc.text(`Payment ID: ${data.paymentId}`, 120, 80);
  doc.text(`Order ID: ${data.orderId}`, 120, 88);
  doc.text('Status: Paid', 120, 96);
  
  // Table header
  const tableTop = 120;
  doc.setFillColor(245, 245, 245);
  doc.rect(20, tableTop - 8, 170, 12, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(9);
  doc.text('DESCRIPTION', 25, tableTop);
  doc.text('QTY', 120, tableTop);
  doc.text('AMOUNT', 185, tableTop, { align: 'right' });
  
  // Table content
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(11);
  
  const itemY = tableTop + 15;
  doc.text(`${data.planName} Plan - Premium Subscription`, 25, itemY);
  doc.text('1', 125, itemY);
  
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(data.amount / 100);
  doc.text(formattedAmount, 185, itemY, { align: 'right' });
  
  // Divider line
  doc.setDrawColor(220, 220, 220);
  doc.line(20, itemY + 10, 190, itemY + 10);
  
  // Subtotal
  const subtotalY = itemY + 25;
  doc.setFontSize(10);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Subtotal', 140, subtotalY);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(formattedAmount, 185, subtotalY, { align: 'right' });
  
  // Tax (0%)
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Tax (0%)', 140, subtotalY + 10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('₹0', 185, subtotalY + 10, { align: 'right' });
  
  // Total
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(130, subtotalY + 18, 60, 14, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL', 140, subtotalY + 28);
  doc.text(formattedAmount, 185, subtotalY + 28, { align: 'right' });
  
  // Footer
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const footerY = 250;
  doc.text('Thank you for your purchase!', 105, footerY, { align: 'center' });
  doc.text('For support, contact support@fileshare.pro', 105, footerY + 8, { align: 'center' });
  
  // Decorative bottom bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 290, 210, 7, 'F');
  
  return doc;
};

export const downloadInvoice = (data: InvoiceData): void => {
  const doc = generateInvoicePDF(data);
  doc.save(`FileShare_Invoice_${data.invoiceNumber}.pdf`);
};
