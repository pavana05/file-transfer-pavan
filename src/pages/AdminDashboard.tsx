import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CreditCard, FileUp, TrendingUp, ArrowLeft, 
  Search, Filter, Download, MoreVertical, Eye, Ban,
  CheckCircle, XCircle, Clock, IndianRupee, Activity,
  BarChart3, PieChart, Calendar, RefreshCw, Shield,
  Crown, Zap, Building2, ChevronDown, ArrowUpRight,
  ArrowDownRight, FileSpreadsheet, Table as TableIcon,
  Lock, AlertTriangle, Mail, MessageSquare, Reply,
  Inbox, CheckCheck, Archive, Trash2, Send, UserCog,
  UserPlus, UserMinus, Sparkles, Settings, Database,
  HardDrive, Globe, CheckSquare, Square, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, 
  Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { toast } from 'sonner';
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { 
  exportPaymentsToCSV, exportPaymentsToExcel, 
  exportFilesToCSV, exportFilesToExcel 
} from '@/lib/export-utils';
import { downloadInvoice } from '@/lib/invoice-generator';
import { AdminFullSkeleton } from '@/components/skeletons/AdminSkeleton';

interface Payment {
  id: string;
  user_id: string;
  user_email?: string;
  plan_name: string;
  amount_inr: number;
  status: string;
  razorpay_payment_id: string | null;
  razorpay_order_id?: string;
  created_at: string;
  purchased_at: string | null;
}

type EmailTemplate = 'custom' | 'acknowledgment' | 'resolution' | 'follow_up';

interface EmailTemplateOption {
  value: EmailTemplate;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface FileRecord {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  user_id: string;
  user_email?: string;
  download_count: number;
  upload_date: string;
  share_pin: string;
  share_token: string;
  is_public: boolean;
  password_hash: string | null;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  category: string;
  message: string;
  status: string;
  admin_notes: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRecord {
  user_id: string;
  email?: string;
  files_count: number;
  total_downloads: number;
  total_storage: number;
  has_premium: boolean;
  created_at?: string;
  roles: string[];
}

interface DonationRecord {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  amount: number;
  message: string | null;
  status: string;
  show_on_wall: boolean | null;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  created_at: string;
  completed_at: string | null;
}

type PaymentEmailType = 'confirmation' | 'reminder' | 'expiring' | 'custom';

interface PaymentEmailTemplate {
  value: PaymentEmailType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface Stats {
  totalUsers: number;
  totalRevenue: number;
  totalFiles: number;
  totalDownloads: number;
  totalContacts: number;
  pendingContacts: number;
  totalStorage: number;
  premiumUsers: number;
  recentUsersGrowth: number;
  recentRevenueGrowth: number;
}

interface ChartData {
  date: string;
  revenue: number;
  uploads: number;
  downloads: number;
}

const COLORS = ['hsl(217, 91%, 45%)', 'hsl(152, 76%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(280, 70%, 50%)'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading, user } = useAdminAccess();
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{name: string; value: number}[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalFiles: 0,
    totalDownloads: 0,
    totalContacts: 0,
    pendingContacts: 0,
    totalStorage: 0,
    premiumUsers: 0,
    recentUsersGrowth: 12.5,
    recentRevenueGrowth: 23.1,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contactStatusFilter, setContactStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkDeleteType, setBulkDeleteType] = useState<'files' | 'contacts'>('files');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentDetailOpen, setIsPaymentDetailOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>('custom');
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserRecord | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isPaymentEmailDialogOpen, setIsPaymentEmailDialogOpen] = useState(false);
  const [paymentEmailType, setPaymentEmailType] = useState<PaymentEmailType>('confirmation');
  const [paymentEmailSubject, setPaymentEmailSubject] = useState('');
  const [paymentEmailMessage, setPaymentEmailMessage] = useState('');
  const [isSendingPaymentEmail, setIsSendingPaymentEmail] = useState(false);

  const emailTemplates: EmailTemplateOption[] = [
    { value: 'custom', label: 'Custom Reply', description: 'Write your own message', icon: <Mail className="h-4 w-4" /> },
    { value: 'acknowledgment', label: 'Acknowledgment', description: 'Confirm receipt and next steps', icon: <Inbox className="h-4 w-4" /> },
    { value: 'resolution', label: 'Resolution', description: 'Issue resolved notification', icon: <CheckCheck className="h-4 w-4" /> },
    { value: 'follow_up', label: 'Follow Up', description: 'Request more information', icon: <Reply className="h-4 w-4" /> },
  ];

  const paymentEmailTemplates: PaymentEmailTemplate[] = [
    { value: 'confirmation', label: 'Payment Confirmation', description: 'Confirm successful payment', icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'reminder', label: 'Payment Reminder', description: 'Remind about pending payment', icon: <Clock className="h-4 w-4" /> },
    { value: 'expiring', label: 'Plan Expiring', description: 'Notify about expiring plan', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'custom', label: 'Custom Message', description: 'Write your own message', icon: <Mail className="h-4 w-4" /> },
  ];

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load payments with plan info
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('premium_purchases')
        .select(`
          *,
          premium_plans(name)
        `)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error loading payments:', paymentsError);
      }

      // Load files
      const { data: filesData, error: filesError } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('upload_date', { ascending: false });

      if (filesError) {
        console.error('Error loading files:', filesError);
      }

      // Load contact submissions
      const { data: contactsData, error: contactsError } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) {
        console.error('Error loading contacts:', contactsError);
      }

      // Process payments
      const processedPayments = (paymentsData || []).map(p => ({
        ...p,
        plan_name: (p.premium_plans as any)?.name || 'Unknown',
      }));

      setPayments(processedPayments);
      setFiles(filesData || []);
      setContacts(contactsData || []);

      // Load donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (donationsError) {
        console.error('Error loading donations:', donationsError);
      }
      setDonations(donationsData || []);
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error loading user roles:', rolesError);
      }

      // Build a map of user roles
      const userRolesMap = new Map<string, string[]>();
      (rolesData || []).forEach(role => {
        if (!userRolesMap.has(role.user_id)) {
          userRolesMap.set(role.user_id, []);
        }
        userRolesMap.get(role.user_id)!.push(role.role);
      });

      // Build user records from files and payments
      const userMap = new Map<string, UserRecord>();
      
      (filesData || []).forEach(file => {
        if (file.user_id) {
          if (!userMap.has(file.user_id)) {
            userMap.set(file.user_id, {
              user_id: file.user_id,
              files_count: 0,
              total_downloads: 0,
              total_storage: 0,
              has_premium: false,
              roles: userRolesMap.get(file.user_id) || [],
            });
          }
          const user = userMap.get(file.user_id)!;
          user.files_count += 1;
          user.total_downloads += file.download_count || 0;
          user.total_storage += file.file_size || 0;
        }
      });

      processedPayments.forEach(payment => {
        if (payment.user_id && payment.status === 'completed') {
          if (!userMap.has(payment.user_id)) {
            userMap.set(payment.user_id, {
              user_id: payment.user_id,
              files_count: 0,
              total_downloads: 0,
              total_storage: 0,
              has_premium: true,
              roles: userRolesMap.get(payment.user_id) || [],
            });
          } else {
            userMap.get(payment.user_id)!.has_premium = true;
          }
        }
      });

      // Also add users from roles who might not have files/payments
      userRolesMap.forEach((roles, userId) => {
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            files_count: 0,
            total_downloads: 0,
            total_storage: 0,
            has_premium: false,
            roles: roles,
          });
        }
      });

      setUsers(Array.from(userMap.values()));

      // Calculate stats
      const completedPayments = processedPayments.filter(p => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount_inr || 0), 0);
      const totalDownloads = (filesData || []).reduce((sum, f) => sum + (f.download_count || 0), 0);
      const totalStorage = (filesData || []).reduce((sum, f) => sum + (f.file_size || 0), 0);
      const pendingContacts = (contactsData || []).filter(c => c.status === 'new' || c.status === 'in_progress').length;
      const premiumUsers = Array.from(userMap.values()).filter(u => u.has_premium).length;
      
      setStats({
        totalUsers: userMap.size,
        totalRevenue,
        totalFiles: filesData?.length || 0,
        totalDownloads,
        totalContacts: contactsData?.length || 0,
        pendingContacts,
        totalStorage,
        premiumUsers,
        recentUsersGrowth: 12.5,
        recentRevenueGrowth: 23.1,
      });

      // Generate chart data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayStart = startOfDay(date);
        
        const dayRevenue = processedPayments
          .filter(p => {
            const pDate = startOfDay(parseISO(p.created_at));
            return pDate.getTime() === dayStart.getTime() && p.status === 'completed';
          })
          .reduce((sum, p) => sum + (p.amount_inr || 0), 0);

        const dayUploads = (filesData || [])
          .filter(f => {
            const fDate = startOfDay(parseISO(f.upload_date));
            return fDate.getTime() === dayStart.getTime();
          }).length;

        const dayDownloads = (filesData || [])
          .filter(f => {
            const fDate = startOfDay(parseISO(f.upload_date));
            return fDate.getTime() === dayStart.getTime();
          })
          .reduce((sum, f) => sum + (f.download_count || 0), 0);

        return {
          date: format(date, 'MMM dd'),
          revenue: dayRevenue / 100,
          uploads: dayUploads,
          downloads: dayDownloads,
        };
      });

      setChartData(last7Days);

      // Calculate plan distribution
      const planCounts: Record<string, number> = {};
      completedPayments.forEach(p => {
        planCounts[p.plan_name] = (planCounts[p.plan_name] || 0) + 1;
      });
      
      const distribution = Object.entries(planCounts).map(([name, value]) => ({ name, value }));
      setPlanDistribution(distribution);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getContactStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><Inbox className="h-3 w-3 mr-1" /> New</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning/10 text-warning border-warning/20"><Clock className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCheck className="h-3 w-3 mr-1" /> Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-muted text-muted-foreground border-muted-foreground/20"><Archive className="h-3 w-3 mr-1" /> Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string; className: string }> = {
      general: { label: 'General', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      support: { label: 'Support', className: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
      bug: { label: 'Bug', className: 'bg-destructive/10 text-destructive border-destructive/20' },
      feature: { label: 'Feature', className: 'bg-success/10 text-success border-success/20' },
    };
    const cat = categories[category] || { label: category, className: 'bg-muted text-muted-foreground' };
    return <Badge className={cat.className}>{cat.label}</Badge>;
  };

  const getPlanIcon = (plan: string) => {
    const lower = plan.toLowerCase();
    if (lower.includes('business')) return <Building2 className="h-4 w-4 text-purple-500" />;
    if (lower.includes('pro')) return <Zap className="h-4 w-4 text-primary" />;
    return <Crown className="h-4 w-4 text-amber-500" />;
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.razorpay_payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.plan_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = contactStatusFilter === 'all' || c.status === contactStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFiles = files.filter(f => {
    return f.original_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           f.filename?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUsers = users.filter(u => {
    return u.user_id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleExportPayments = (format: 'csv' | 'excel') => {
    const exportData = filteredPayments.map(p => ({
      id: p.id,
      plan_name: p.plan_name,
      amount_inr: p.amount_inr,
      status: p.status,
      razorpay_payment_id: p.razorpay_payment_id,
      created_at: p.created_at,
    }));

    if (format === 'csv') {
      exportPaymentsToCSV(exportData);
      toast.success('Payments exported to CSV');
    } else {
      exportPaymentsToExcel(exportData);
      toast.success('Payments exported to Excel');
    }
  };

  const handleExportFiles = (format: 'csv' | 'excel') => {
    const exportData = files.map(f => ({
      id: f.id,
      filename: f.filename,
      file_size: f.file_size,
      file_type: f.file_type,
      download_count: f.download_count,
      upload_date: f.upload_date,
    }));

    if (format === 'csv') {
      exportFilesToCSV(exportData);
      toast.success('Files exported to CSV');
    } else {
      exportFilesToExcel(exportData);
      toast.success('Files exported to Excel');
    }
  };

  const handleViewContact = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setAdminNotes(contact.admin_notes || '');
    setIsViewDialogOpen(true);
  };

  const handleUpdateContactStatus = async (contactId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.replied_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', contactId);

      if (error) throw error;

      setContacts(prev => prev.map(c => 
        c.id === contactId ? { ...c, ...updateData } : c
      ));
      
      if (selectedContact?.id === contactId) {
        setSelectedContact(prev => prev ? { ...prev, ...updateData } : null);
      }

      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedContact) return;

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ admin_notes: adminNotes })
        .eq('id', selectedContact.id);

      if (error) throw error;

      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id ? { ...c, admin_notes: adminNotes } : c
      ));
      setSelectedContact(prev => prev ? { ...prev, admin_notes: adminNotes } : null);

      toast.success('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setContacts(prev => prev.filter(c => c.id !== contactId));
      if (selectedContact?.id === contactId) {
        setIsViewDialogOpen(false);
        setSelectedContact(null);
      }

      toast.success('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('uploads')
        .remove([`files/${file.filename}`]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Bulk actions
  const handleToggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleToggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f.id));
    }
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleBulkDeleteFiles = async () => {
    try {
      for (const fileId of selectedFiles) {
        const file = files.find(f => f.id === fileId);
        if (file) {
          await supabase.storage.from('uploads').remove([`files/${file.filename}`]);
          await supabase.from('uploaded_files').delete().eq('id', fileId);
        }
      }
      setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
      setSelectedFiles([]);
      setIsBulkDeleteOpen(false);
      toast.success(`${selectedFiles.length} files deleted successfully`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some files');
    }
  };

  const handleBulkDeleteContacts = async () => {
    try {
      for (const contactId of selectedContacts) {
        await supabase.from('contact_submissions').delete().eq('id', contactId);
      }
      setContacts(prev => prev.filter(c => !selectedContacts.includes(c.id)));
      setSelectedContacts([]);
      setIsBulkDeleteOpen(false);
      toast.success(`${selectedContacts.length} contacts deleted successfully`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some contacts');
    }
  };

  const handleBulkUpdateContactStatus = async (status: string) => {
    try {
      for (const contactId of selectedContacts) {
        await supabase.from('contact_submissions').update({ status }).eq('id', contactId);
      }
      setContacts(prev => prev.map(c => 
        selectedContacts.includes(c.id) ? { ...c, status } : c
      ));
      setSelectedContacts([]);
      toast.success(`${selectedContacts.length} contacts updated to ${status}`);
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Failed to update some contacts');
    }
  };

  // Payment actions
  const handleViewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentDetailOpen(true);
  };

  const handleDownloadInvoice = (payment: Payment) => {
    if (payment.status !== 'completed') {
      toast.error('Invoice only available for completed payments');
      return;
    }
    
    try {
      downloadInvoice({
        invoiceNumber: `INV-${payment.id.slice(0, 8).toUpperCase()}`,
        purchaseDate: format(new Date(payment.purchased_at || payment.created_at), 'PPP'),
        planName: payment.plan_name,
        amount: payment.amount_inr,
        userName: 'Customer',
        userEmail: payment.user_email || 'N/A',
        paymentId: payment.razorpay_payment_id || 'N/A',
        orderId: payment.razorpay_order_id || payment.id,
      });
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  // Send admin reply email
  const handleSendReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSendingReply(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('send-admin-reply', {
        body: {
          contactId: selectedContact.id,
          recipientName: selectedContact.name,
          recipientEmail: selectedContact.email,
          subject: replySubject || `Re: ${selectedContact.subject || 'Your FileShare Pro Inquiry'}`,
          message: replyMessage,
          templateType: emailTemplate,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send reply');
      }

      // Update local state
      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id 
          ? { ...c, status: 'resolved', replied_at: new Date().toISOString() } 
          : c
      ));
      setSelectedContact(prev => prev ? { ...prev, status: 'resolved', replied_at: new Date().toISOString() } : null);
      
      toast.success('Reply sent successfully!');
      setReplyMessage('');
      setReplySubject('');
      setEmailTemplate('custom');
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const getTemplatePreview = (template: EmailTemplate): string => {
    switch (template) {
      case 'acknowledgment':
        return "Thank you for reaching out. We've received your inquiry and our team is reviewing it. We typically respond within 24-48 hours.";
      case 'resolution':
        return "Great news! We've resolved the issue you reported. [Add details about the resolution here]";
      case 'follow_up':
        return "We're following up on your inquiry. To help you better, we need: [Add what information you need]";
      default:
        return '';
    }
  };

  const handleTemplateChange = (template: EmailTemplate) => {
    setEmailTemplate(template);
    if (template !== 'custom') {
      setReplyMessage(getTemplatePreview(template));
    }
  };

  // Role management handlers
  const handleOpenRoleDialog = (userRecord: UserRecord) => {
    setSelectedUserForRole(userRecord);
    setIsRoleDialogOpen(true);
  };

  const handleAssignRole = async (role: 'admin' | 'moderator' | 'user') => {
    if (!selectedUserForRole) return;
    setIsUpdatingRole(true);
    try {
      await supabase.from('user_roles').delete().eq('user_id', selectedUserForRole.user_id);
      const { error } = await supabase.from('user_roles').insert({ user_id: selectedUserForRole.user_id, role });
      if (error) throw error;
      setUsers(prev => prev.map(u => u.user_id === selectedUserForRole.user_id ? { ...u, roles: [role] } : u));
      toast.success(`Role updated to ${role}`);
      setIsRoleDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleOpenPaymentEmailDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentEmailType('confirmation');
    setIsPaymentEmailDialogOpen(true);
  };

  const handleSendPaymentEmail = async () => {
    if (!selectedPayment) return;
    setIsSendingPaymentEmail(true);
    try {
      const response = await supabase.functions.invoke('send-payment-email', {
        body: {
          type: paymentEmailType,
          recipientEmail: selectedPayment.user_email || '',
          recipientName: 'Customer',
          planName: selectedPayment.plan_name,
          amount: selectedPayment.amount_inr,
          purchaseDate: format(new Date(selectedPayment.purchased_at || selectedPayment.created_at), 'PPP'),
          paymentId: selectedPayment.razorpay_payment_id,
          subject: paymentEmailSubject,
          message: paymentEmailMessage,
        },
      });
      if (response.error) throw new Error(response.error.message);
      toast.success('Payment email sent!');
      setIsPaymentEmailDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send email');
    } finally {
      setIsSendingPaymentEmail(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><Shield className="h-3 w-3 mr-1" /> Admin</Badge>;
      case 'moderator': return <Badge className="bg-primary/10 text-primary border-primary/20"><UserCog className="h-3 w-3 mr-1" /> Mod</Badge>;
      default: return <Badge variant="secondary">User</Badge>;
    }
  };

  if (authLoading || loading) {
    return <AdminFullSkeleton />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground mt-2">
                You don't have permission to access the admin dashboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/20">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Admin Dashboard</h1>
                  <p className="text-xs text-muted-foreground">Manage your platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {stats.pendingContacts > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('contacts')}
                  className="gap-2 border-warning/50 text-warning hover:bg-warning/10"
                >
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">{stats.pendingContacts} Pending</span>
                  <span className="sm:hidden">{stats.pendingContacts}</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total Users */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Users */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-amber-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Premium Users</p>
                    <p className="text-2xl font-bold">{stats.premiumUsers.toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Crown className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-success/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IndianRupee className="h-5 w-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Files */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-warning/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total Files</p>
                    <p className="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileUp className="h-5 w-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Storage */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-purple-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Storage Used</p>
                    <p className="text-2xl font-bold">{formatFileSize(stats.totalStorage)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HardDrive className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Messages */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Messages</p>
                    <p className="text-2xl font-bold">{stats.totalContacts.toLocaleString()}</p>
                    {stats.pendingContacts > 0 && (
                      <p className="text-xs text-warning font-medium">{stats.pendingContacts} pending</p>
                    )}
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue & Activity Chart */}
            <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Revenue & Activity (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(217, 91%, 45%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(217, 91%, 45%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(152, 76%, 48%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(152, 76%, 48%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(217, 91%, 45%)" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)"
                        name="Revenue (₹)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="uploads" 
                        stroke="hsl(152, 76%, 48%)" 
                        fillOpacity={1} 
                        fill="url(#colorUploads)"
                        name="Uploads"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Plan Distribution */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Plan Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {planDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={planDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {planDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-muted/50 p-1 flex-wrap h-auto gap-1">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Payments</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2">
                  <FileUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Files</span>
                </TabsTrigger>
                <TabsTrigger value="contacts" className="gap-2 relative">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Contacts</span>
                  {stats.pendingContacts > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning text-[10px] font-bold flex items-center justify-center text-warning-foreground">
                      {stats.pendingContacts}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="donations" className="gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Donations</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Payments */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Recent Payments</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('payments')}>
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {payments.slice(0, 5).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              {getPlanIcon(payment.plan_name)}
                              <div>
                                <p className="font-medium text-sm">{payment.plan_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(payment.amount_inr)}</p>
                              {getStatusBadge(payment.status)}
                            </div>
                          </div>
                        ))}
                        {payments.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No payments yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Files */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Recent Uploads</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('files')}>
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {files.slice(0, 5).map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileUp className="h-5 w-5 text-primary" />
                              </div>
                              <div className="max-w-[150px]">
                                <p className="font-medium text-sm truncate">{file.original_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.file_size)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="mb-1">
                                <Download className="h-3 w-3 mr-1" />
                                {file.download_count}
                              </Badge>
                              {file.password_hash && (
                                <Badge className="bg-warning/10 text-warning border-warning/20 ml-1">
                                  <Lock className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {files.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No files yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Contacts */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Recent Contact Messages</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('contacts')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contacts.slice(0, 3).map((contact) => (
                        <div 
                          key={contact.id} 
                          className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleViewContact(contact)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{contact.name}</p>
                                {getCategoryBadge(contact.category)}
                              </div>
                              <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                                {contact.subject || contact.message.slice(0, 50)}...
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getContactStatusBadge(contact.status)}
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(contact.created_at), 'MMM dd')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {contacts.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No contact submissions yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View and manage platform users and roles</CardDescription>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-48" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border/50 overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>User ID</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Files</TableHead>
                            <TableHead>Downloads</TableHead>
                            <TableHead>Storage</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((userRecord) => (
                            <TableRow key={userRecord.user_id} className="hover:bg-muted/20">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-mono text-xs truncate max-w-[150px]">{userRecord.user_id.slice(0, 8)}...</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {userRecord.roles.length > 0 ? userRecord.roles.map(role => <span key={role}>{getRoleBadge(role)}</span>) : getRoleBadge('user')}
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="secondary">{userRecord.files_count}</Badge></TableCell>
                              <TableCell><Badge variant="secondary"><Download className="h-3 w-3 mr-1" />{userRecord.total_downloads}</Badge></TableCell>
                              <TableCell className="text-muted-foreground">{formatFileSize(userRecord.total_storage)}</TableCell>
                              <TableCell>
                                {userRecord.has_premium ? <Badge className="bg-warning/10 text-warning border-warning/20"><Crown className="h-3 w-3 mr-1" /> Premium</Badge> : <Badge variant="secondary">Free</Badge>}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenRoleDialog(userRecord)}><UserCog className="h-4 w-4 mr-2" />Manage Role</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleAssignRole('admin')}><Shield className="h-4 w-4 mr-2" />Make Admin</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAssignRole('moderator')}><UserCog className="h-4 w-4 mr-2" />Make Moderator</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredUsers.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>All transactions and purchases</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search payments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-48"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              Export
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExportPayments('csv')}>
                              <TableIcon className="h-4 w-4 mr-2" />
                              Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportPayments('excel')}>
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Export as Excel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border/50 overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>Plan</TableHead>
                            <TableHead>Payment ID</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPayments.map((payment) => (
                            <TableRow key={payment.id} className="hover:bg-muted/20">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getPlanIcon(payment.plan_name)}
                                  <span className="font-medium">{payment.plan_name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {payment.razorpay_payment_id?.slice(0, 18) || 'N/A'}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(payment.amount_inr)}
                              </TableCell>
                              <TableCell>{getStatusBadge(payment.status)}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewPaymentDetails(payment)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDownloadInvoice(payment)}
                                      disabled={payment.status !== 'completed'}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download Invoice
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredPayments.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No payments found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>All Files</CardTitle>
                        <CardDescription>Manage uploaded files and their sharing settings</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-48"
                          />
                        </div>
                        {selectedFiles.length > 0 && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => {
                              setBulkDeleteType('files');
                              setIsBulkDeleteOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete ({selectedFiles.length})
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              Export
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExportFiles('csv')}>
                              <TableIcon className="h-4 w-4 mr-2" />
                              Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportFiles('excel')}>
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Export as Excel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border/50 overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="w-10">
                              <Checkbox 
                                checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                                onCheckedChange={handleSelectAllFiles}
                              />
                            </TableHead>
                            <TableHead>File</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Downloads</TableHead>
                            <TableHead>PIN</TableHead>
                            <TableHead>Protected</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredFiles.map((file) => (
                            <TableRow key={file.id} className="hover:bg-muted/20">
                              <TableCell>
                                <Checkbox 
                                  checked={selectedFiles.includes(file.id)}
                                  onCheckedChange={() => handleToggleFileSelection(file.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <FileUp className="h-4 w-4 text-primary" />
                                  <span className="font-medium truncate max-w-[200px]">{file.original_name || file.filename}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {file.file_type.split('/')[1]?.toUpperCase() || file.file_type}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatFileSize(file.file_size)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{file.download_count}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {file.share_pin || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {file.password_hash ? (
                                  <Badge className="bg-warning/10 text-warning border-warning/20">
                                    <Lock className="h-3 w-3 mr-1" /> Yes
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">No</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(file.upload_date), 'MMM dd, yyyy')}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => window.open(`/share/${file.share_token}`, '_blank')}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Share Page
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleDeleteFile(file.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete File
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredFiles.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                No files uploaded yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>Contact Submissions</CardTitle>
                        <CardDescription>Manage and respond to user inquiries</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-48"
                          />
                        </div>
                        <Select value={contactStatusFilter} onValueChange={setContactStatusFilter}>
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        {selectedContacts.length > 0 && (
                          <>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Settings className="h-4 w-4" />
                                  Bulk Actions ({selectedContacts.length})
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleBulkUpdateContactStatus('resolved')}>
                                  <CheckCheck className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkUpdateContactStatus('closed')}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Mark as Closed
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setBulkDeleteType('contacts');
                                    setIsBulkDeleteOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Selected
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border/50 overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="w-10">
                              <Checkbox 
                                checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                                onCheckedChange={handleSelectAllContacts}
                              />
                            </TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredContacts.map((contact) => (
                            <TableRow 
                              key={contact.id} 
                              className="hover:bg-muted/20 cursor-pointer"
                              onClick={() => handleViewContact(contact)}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox 
                                  checked={selectedContacts.includes(contact.id)}
                                  onCheckedChange={() => handleToggleContactSelection(contact.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{contact.name}</p>
                                  <p className="text-xs text-muted-foreground">{contact.email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {contact.subject || contact.message.slice(0, 50) + '...'}
                              </TableCell>
                              <TableCell>{getCategoryBadge(contact.category)}</TableCell>
                              <TableCell>{getContactStatusBadge(contact.status)}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(contact.created_at), 'MMM dd, yyyy')}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewContact(contact);
                                    }}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`mailto:${contact.email}?subject=Re: ${contact.subject || 'Your inquiry'}`, '_blank');
                                    }}>
                                      <Reply className="h-4 w-4 mr-2" />
                                      Reply via Email
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateContactStatus(contact.id, 'resolved');
                                      }}
                                    >
                                      <CheckCheck className="h-4 w-4 mr-2" />
                                      Mark Resolved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteContact(contact.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredContacts.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No contact submissions found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Donations Tab */}
              <TabsContent value="donations" className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-pink-500" />
                          Donation Management
                        </CardTitle>
                        <CardDescription>View and manage all donations from the support page</CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-success">
                            {formatCurrency(donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0))}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Donations</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border/50 overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>Donor</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Show on Wall</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {donations.map((donation) => (
                            <TableRow key={donation.id} className="hover:bg-muted/20">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                    donation.amount >= 49900 
                                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500' 
                                      : donation.amount >= 14900 
                                        ? 'bg-gradient-to-br from-purple-500 to-violet-500'
                                        : donation.amount >= 9900
                                          ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
                                          : 'bg-gradient-to-br from-pink-500 to-rose-500'
                                  }`}>
                                    <Heart className="h-5 w-5 text-white fill-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{donation.name || 'Anonymous'}</p>
                                    <p className="text-xs text-muted-foreground">{donation.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-bold text-lg">{formatCurrency(donation.amount)}</span>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                                  {donation.message || '—'}
                                </p>
                              </TableCell>
                              <TableCell>
                                {donation.status === 'completed' ? (
                                  <Badge className="bg-success/10 text-success border-success/20">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge className="bg-warning/10 text-warning border-warning/20">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {donation.show_on_wall ? (
                                  <Badge className="bg-pink-500/10 text-pink-500 border-pink-500/20">
                                    <Users className="h-3 w-3 mr-1" />
                                    Public
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    Private
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(donation.created_at), 'MMM dd, yyyy')}
                              </TableCell>
                            </TableRow>
                          ))}
                          {donations.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p>No donations received yet</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quick Actions */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>Perform common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 hover:border-primary/50"
                          onClick={() => navigate('/support')}
                        >
                          <Heart className="h-5 w-5 text-pink-500" />
                          <span className="text-sm">Support Page</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 hover:border-primary/50"
                          onClick={() => navigate('/pricing')}
                        >
                          <Crown className="h-5 w-5 text-amber-500" />
                          <span className="text-sm">View Pricing</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 hover:border-primary/50"
                          onClick={() => navigate('/contact')}
                        >
                          <Mail className="h-5 w-5 text-blue-500" />
                          <span className="text-sm">Contact Page</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 hover:border-primary/50"
                          onClick={loadDashboardData}
                        >
                          <RefreshCw className="h-5 w-5 text-success" />
                          <span className="text-sm">Refresh Data</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Health */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-success" />
                        System Health
                      </CardTitle>
                      <CardDescription>Monitor system status and performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                            <span className="text-sm font-medium">Database Status</span>
                          </div>
                          <Badge className="bg-success/10 text-success border-success/20">Online</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                            <span className="text-sm font-medium">Storage Service</span>
                          </div>
                          <Badge className="bg-success/10 text-success border-success/20">Healthy</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                            <span className="text-sm font-medium">Payment Gateway</span>
                          </div>
                          <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Storage Used</span>
                          </div>
                          <span className="text-sm font-semibold">{formatFileSize(stats.totalStorage)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Export */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Export Data
                      </CardTitle>
                      <CardDescription>Download data reports in various formats</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => handleExportPayments('csv')} className="gap-2">
                          <TableIcon className="h-4 w-4" />
                          Payments CSV
                        </Button>
                        <Button variant="outline" onClick={() => handleExportPayments('excel')} className="gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Payments Excel
                        </Button>
                        <Button variant="outline" onClick={() => handleExportFiles('csv')} className="gap-2">
                          <TableIcon className="h-4 w-4" />
                          Files CSV
                        </Button>
                        <Button variant="outline" onClick={() => handleExportFiles('excel')} className="gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Files Excel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin Stats Summary */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Summary
                      </CardTitle>
                      <CardDescription>Key metrics at a glance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Total Users</span>
                          <span className="font-bold">{stats.totalUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Premium Users</span>
                          <span className="font-bold text-amber-500">{stats.premiumUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Total Revenue</span>
                          <span className="font-bold text-success">{formatCurrency(stats.totalRevenue)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Files Uploaded</span>
                          <span className="font-bold">{stats.totalFiles.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>

      {/* Contact Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Contact Details
            </DialogTitle>
            <DialogDescription>
              View and manage this contact submission
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">From</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Email</p>
                  <a href={`mailto:${selectedContact.email}`} className="font-medium text-primary hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Category</p>
                  {getCategoryBadge(selectedContact.category)}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Status</p>
                  <Select 
                    value={selectedContact.status} 
                    onValueChange={(value) => handleUpdateContactStatus(selectedContact.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Received</p>
                  <p className="text-sm">{format(new Date(selectedContact.created_at), 'PPpp')}</p>
                </div>
                {selectedContact.replied_at && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Replied</p>
                    <p className="text-sm">{format(new Date(selectedContact.replied_at), 'PPpp')}</p>
                  </div>
                )}
              </div>

              {/* Subject & Message */}
              <div className="space-y-4">
                {selectedContact.subject && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Subject</p>
                    <p className="font-medium">{selectedContact.subject}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Message</p>
                  <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase font-medium">Admin Notes</p>
                <Textarea
                  placeholder="Add internal notes about this inquiry..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
                <Button size="sm" onClick={handleSaveNotes} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Save Notes
                </Button>
              </div>

              {/* Email Reply Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Send Reply</h3>
                </div>
                
                {/* Template Selection */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Email Template</p>
                  <div className="grid grid-cols-2 gap-2">
                    {emailTemplates.map((template) => (
                      <button
                        key={template.value}
                        onClick={() => handleTemplateChange(template.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          emailTemplate === template.value 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                            : 'border-border/50 hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {template.icon}
                          <span className="font-medium text-sm">{template.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Subject</p>
                  <Input
                    placeholder={`Re: ${selectedContact.subject || 'Your FileShare Pro Inquiry'}`}
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Message</p>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={5}
                  />
                </div>

                <Button 
                  onClick={handleSendReply} 
                  disabled={isSendingReply || !replyMessage.trim()}
                  className="w-full gap-2"
                >
                  {isSendingReply ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSendingReply ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            {selectedContact && (
              <Button
                onClick={() => {
                  handleUpdateContactStatus(selectedContact.id, 'resolved');
                  setIsViewDialogOpen(false);
                }}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark Resolved
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Detail Dialog */}
      <Dialog open={isPaymentDetailOpen} onOpenChange={setIsPaymentDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Details
            </DialogTitle>
            <DialogDescription>
              Complete transaction information
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex justify-center">
                <div className={`px-6 py-3 rounded-xl ${
                  selectedPayment.status === 'completed' 
                    ? 'bg-success/10' 
                    : selectedPayment.status === 'pending'
                    ? 'bg-warning/10'
                    : 'bg-destructive/10'
                }`}>
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>

              {/* Amount */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Amount</p>
                <p className="text-3xl font-bold">{formatCurrency(selectedPayment.amount_inr)}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Plan</p>
                  <div className="flex items-center gap-2">
                    {getPlanIcon(selectedPayment.plan_name)}
                    <span className="font-medium">{selectedPayment.plan_name}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Date</p>
                  <p className="font-medium">{format(new Date(selectedPayment.created_at), 'PPP')}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Payment ID</p>
                  <p className="font-mono text-sm break-all">{selectedPayment.razorpay_payment_id || 'N/A'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Order ID</p>
                  <p className="font-mono text-sm break-all">{selectedPayment.razorpay_order_id || selectedPayment.id}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium">User ID</p>
                  <p className="font-mono text-sm break-all">{selectedPayment.user_id}</p>
                </div>
                {selectedPayment.purchased_at && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Completed At</p>
                    <p className="font-medium">{format(new Date(selectedPayment.purchased_at), 'PPpp')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPaymentDetailOpen(false)}>
              Close
            </Button>
            {selectedPayment?.status === 'completed' && (
              <Button onClick={() => handleDownloadInvoice(selectedPayment)} className="gap-2">
                <Download className="h-4 w-4" />
                Download Invoice
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {bulkDeleteType === 'files' ? selectedFiles.length : selectedContacts.length} {bulkDeleteType}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={bulkDeleteType === 'files' ? handleBulkDeleteFiles : handleBulkDeleteContacts}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete {bulkDeleteType === 'files' ? selectedFiles.length : selectedContacts.length} {bulkDeleteType}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Manage User Role
            </DialogTitle>
            <DialogDescription>
              Assign or change the role for this user
            </DialogDescription>
          </DialogHeader>

          {selectedUserForRole && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="p-4 rounded-xl bg-muted/30 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <p className="font-mono text-sm text-muted-foreground break-all">
                  {selectedUserForRole.user_id.slice(0, 20)}...
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {selectedUserForRole.roles.length > 0 ? (
                    selectedUserForRole.roles.map(role => getRoleBadge(role))
                  ) : (
                    <Badge variant="secondary">User</Badge>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Select New Role</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleAssignRole('user')}
                    disabled={isUpdatingRole}
                    className={`justify-start gap-3 h-auto py-3 ${
                      selectedUserForRole.roles.includes('user') || selectedUserForRole.roles.length === 0
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">User</p>
                      <p className="text-xs text-muted-foreground">Standard user access</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAssignRole('moderator')}
                    disabled={isUpdatingRole}
                    className={`justify-start gap-3 h-auto py-3 ${
                      selectedUserForRole.roles.includes('moderator')
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                  >
                    <UserCog className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Moderator</p>
                      <p className="text-xs text-muted-foreground">Can manage content and users</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAssignRole('admin')}
                    disabled={isUpdatingRole}
                    className={`justify-start gap-3 h-auto py-3 ${
                      selectedUserForRole.roles.includes('admin')
                        ? 'border-destructive bg-destructive/5'
                        : ''
                    }`}
                  >
                    <Shield className="h-4 w-4 text-destructive" />
                    <div className="text-left">
                      <p className="font-medium">Admin</p>
                      <p className="text-xs text-muted-foreground">Full administrative access</p>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Email Dialog */}
      <Dialog open={isPaymentEmailDialogOpen} onOpenChange={setIsPaymentEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Send Payment Email
            </DialogTitle>
            <DialogDescription>
              Send a payment notification email to the user
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Info */}
              <div className="p-4 rounded-xl bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPlanIcon(selectedPayment.plan_name)}
                  <div>
                    <p className="font-medium">{selectedPayment.plan_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedPayment.created_at), 'PPP')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{formatCurrency(selectedPayment.amount_inr)}</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>

              {/* Email Template Selection */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Email Template</p>
                <div className="grid grid-cols-2 gap-2">
                  {paymentEmailTemplates.map((template) => (
                    <button
                      key={template.value}
                      onClick={() => setPaymentEmailType(template.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        paymentEmailType === template.value 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : 'border-border/50 hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {template.icon}
                        <span className="font-medium text-sm">{template.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message (only for custom type) */}
              {paymentEmailType === 'custom' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Subject</p>
                    <Input
                      placeholder="Email subject..."
                      value={paymentEmailSubject}
                      onChange={(e) => setPaymentEmailSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Message</p>
                    <Textarea
                      placeholder="Email message..."
                      value={paymentEmailMessage}
                      onChange={(e) => setPaymentEmailMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPaymentEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendPaymentEmail} 
              disabled={isSendingPaymentEmail}
              className="gap-2"
            >
              {isSendingPaymentEmail ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSendingPaymentEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
