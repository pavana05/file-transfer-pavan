// CSV Export utility functions
import { format } from 'date-fns';

export interface PaymentExport {
  id: string;
  plan_name: string;
  amount_inr: number;
  status: string;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface FileExport {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  download_count: number;
  upload_date: string;
}

const formatCurrency = (amount: number) => {
  return `₹${(amount / 100).toLocaleString('en-IN')}`;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const escapeCSVField = (field: string | number | null): string => {
  if (field === null || field === undefined) return '';
  const str = String(field);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportPaymentsToCSV = (payments: PaymentExport[]): void => {
  const headers = ['ID', 'Plan', 'Amount', 'Status', 'Payment ID', 'Date'];
  
  const rows = payments.map(p => [
    escapeCSVField(p.id),
    escapeCSVField(p.plan_name),
    escapeCSVField(formatCurrency(p.amount_inr)),
    escapeCSVField(p.status),
    escapeCSVField(p.razorpay_payment_id || 'N/A'),
    escapeCSVField(format(new Date(p.created_at), 'yyyy-MM-dd HH:mm:ss')),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadCSV(csvContent, `payments_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

export const exportFilesToCSV = (files: FileExport[]): void => {
  const headers = ['ID', 'File Name', 'Type', 'Size', 'Downloads', 'Upload Date'];
  
  const rows = files.map(f => [
    escapeCSVField(f.id),
    escapeCSVField(f.filename),
    escapeCSVField(f.file_type),
    escapeCSVField(formatFileSize(f.file_size)),
    escapeCSVField(f.download_count),
    escapeCSVField(format(new Date(f.upload_date), 'yyyy-MM-dd HH:mm:ss')),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadCSV(csvContent, `files_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Excel-like export (XLSX format using simple HTML table)
export const exportPaymentsToExcel = (payments: PaymentExport[]): void => {
  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Plan</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Payment ID</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${payments.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.plan_name}</td>
            <td>${formatCurrency(p.amount_inr)}</td>
            <td>${p.status}</td>
            <td>${p.razorpay_payment_id || 'N/A'}</td>
            <td>${format(new Date(p.created_at), 'yyyy-MM-dd HH:mm:ss')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  downloadExcel(tableHTML, `payments_export_${format(new Date(), 'yyyy-MM-dd')}.xls`);
};

export const exportFilesToExcel = (files: FileExport[]): void => {
  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>File Name</th>
          <th>Type</th>
          <th>Size</th>
          <th>Downloads</th>
          <th>Upload Date</th>
        </tr>
      </thead>
      <tbody>
        ${files.map(f => `
          <tr>
            <td>${f.id}</td>
            <td>${f.filename}</td>
            <td>${f.file_type}</td>
            <td>${formatFileSize(f.file_size)}</td>
            <td>${f.download_count}</td>
            <td>${format(new Date(f.upload_date), 'yyyy-MM-dd HH:mm:ss')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  downloadExcel(tableHTML, `files_export_${format(new Date(), 'yyyy-MM-dd')}.xls`);
};

const downloadExcel = (tableHTML: string, filename: string): void => {
  const template = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Export</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; }
      </style>
    </head>
    <body>${tableHTML}</body>
    </html>
  `;
  
  const blob = new Blob([template], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
