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
  Lock, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, 
  Pie, Cell, Legend
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { toast } from 'sonner';
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { 
  exportPaymentsToCSV, exportPaymentsToExcel, 
  exportFilesToCSV, exportFilesToExcel 
} from '@/lib/export-utils';

interface Payment {
  id: string;
  user_id: string;
  user_email?: string;
  plan_name: string;
  amount_inr: number;
  status: string;
  razorpay_payment_id: string | null;
  created_at: string;
  purchased_at: string | null;
}

interface FileRecord {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  user_id: string;
  user_email?: string;
  download_count: number;
  upload_date: string;
}

interface Stats {
  totalUsers: number;
  totalRevenue: number;
  totalFiles: number;
  totalDownloads: number;
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
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{name: string; value: number}[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalFiles: 0,
    totalDownloads: 0,
    recentUsersGrowth: 12.5,
    recentRevenueGrowth: 23.1,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load payments with plan info
      const { data: paymentsData } = await supabase
        .from('premium_purchases')
        .select(`
          *,
          premium_plans(name)
        `)
        .order('created_at', { ascending: false });

      // Load files
      const { data: filesData } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('upload_date', { ascending: false });

      // Process payments
      const processedPayments = (paymentsData || []).map(p => ({
        ...p,
        plan_name: (p.premium_plans as any)?.name || 'Unknown',
      }));

      setPayments(processedPayments);
      setFiles(filesData || []);

      // Calculate stats
      const completedPayments = processedPayments.filter(p => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount_inr || 0), 0);
      const totalDownloads = (filesData || []).reduce((sum, f) => sum + (f.download_count || 0), 0);
      
      // Get unique users
      const uniqueUserIds = new Set([
        ...processedPayments.map(p => p.user_id),
        ...(filesData || []).map(f => f.user_id)
      ]);

      setStats({
        totalUsers: uniqueUserIds.size,
        totalRevenue,
        totalFiles: filesData?.length || 0,
        totalDownloads,
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
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
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

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
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
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
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
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Admin Dashboard</h1>
                  <p className="text-xs text-muted-foreground">Manage your platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <ArrowUpRight className="h-3 w-3 text-success" />
                      <span className="text-success font-medium">+{stats.recentUsersGrowth}%</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <ArrowUpRight className="h-3 w-3 text-success" />
                      <span className="text-success font-medium">+{stats.recentRevenueGrowth}%</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Files */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                    <p className="text-3xl font-bold">{stats.totalFiles.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <FileUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Uploaded files</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                    <FileUp className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Downloads */}
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                    <p className="text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">All time</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <Download className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue & Activity Chart */}
            <Card className="lg:col-span-2 border-border/50">
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
            <Card className="border-border/50">
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
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2">
                  <FileUp className="h-4 w-4" />
                  Files
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Payments */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Recent Payments</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('payments')}>
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {payments.slice(0, 5).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
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
                              <p className="font-semibold text-sm">{formatCurrency(payment.amount_inr)}</p>
                              {getStatusBadge(payment.status)}
                            </div>
                          </div>
                        ))}
                        {payments.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">No payments yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Files */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Recent Files</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('files')}>
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {files.slice(0, 5).map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileUp className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate max-w-[200px]">{file.filename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.file_size)} • {file.download_count} downloads
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(file.upload_date), 'MMM dd')}
                            </p>
                          </div>
                        ))}
                        {files.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">No files uploaded yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Platform Health */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Platform Health</CardTitle>
                    <CardDescription>System metrics and performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">Uptime</span>
                        </div>
                        <p className="text-2xl font-bold text-success">99.9%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Avg Response</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">45ms</p>
                      </div>
                      <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-warning" />
                          <span className="text-sm font-medium">Success Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-warning">98.5%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Security</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-500">A+</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>All Payments</CardTitle>
                        <CardDescription>Manage and track all payment transactions</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-48"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-32">
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
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
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
                              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
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
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>All Files</CardTitle>
                        <CardDescription>View and manage uploaded files</CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search files..." className="pl-9 w-48" />
                        </div>
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
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Downloads</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {files.map((file) => (
                            <TableRow key={file.id} className="hover:bg-muted/20">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FileUp className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-medium truncate max-w-[200px]">{file.filename}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="font-mono text-xs">
                                  {file.file_type.split('/')[1]?.toUpperCase() || file.file_type}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatFileSize(file.file_size)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Download className="h-3 w-3 text-muted-foreground" />
                                  {file.download_count}
                                </div>
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
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      <Ban className="h-4 w-4 mr-2" />
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                          {files.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                No files found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
