import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, Download, Activity } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { FileAnalyticsSkeleton } from './FileAnalyticsSkeleton';

interface AnalyticsData {
  date: string;
  views: number;
  downloads: number;
}

interface FileStats {
  totalViews: number;
  totalDownloads: number;
  viewsTrend: number;
}

const chartConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--primary))',
  },
  downloads: {
    label: 'Downloads',
    color: 'hsl(var(--accent))',
  },
};

export const FileAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [stats, setStats] = useState<FileStats>({ totalViews: 0, totalDownloads: 0, viewsTrend: 0 });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : 30;
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());

      // Get analytics data using secure function that excludes IP/user agent data
      const { data: analyticsRaw, error } = await supabase
        .rpc('get_user_file_analytics', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });

      if (error) throw error;

      // Group data by date
      const dataByDate = new Map<string, { views: number; downloads: number }>();
      
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), days - i - 1), 'MMM dd');
        dataByDate.set(date, { views: 0, downloads: 0 });
      }

      let totalViews = 0;
      let totalDownloads = 0;

      analyticsRaw?.forEach((record: any) => {
        const date = format(new Date(record.accessed_at), 'MMM dd');
        const current = dataByDate.get(date) || { views: 0, downloads: 0 };
        
        if (record.event_type === 'view') {
          current.views++;
          totalViews++;
        } else if (record.event_type === 'download') {
          current.downloads++;
          totalDownloads++;
        }
        
        dataByDate.set(date, current);
      });

      const chartData: AnalyticsData[] = Array.from(dataByDate.entries()).map(([date, data]) => ({
        date,
        views: data.views,
        downloads: data.downloads,
      }));

      // Calculate trend (compare first half vs second half)
      const midPoint = Math.floor(chartData.length / 2);
      const firstHalfViews = chartData.slice(0, midPoint).reduce((sum, d) => sum + d.views, 0);
      const secondHalfViews = chartData.slice(midPoint).reduce((sum, d) => sum + d.views, 0);
      const trend = firstHalfViews === 0 ? 0 : ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100;

      setAnalyticsData(chartData);
      setStats({ totalViews, totalDownloads, viewsTrend: Math.round(trend) });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FileAnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-md border border-primary/20 hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Views</span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{stats.totalViews}</h3>
            {stats.viewsTrend !== 0 && (
              <span className={`text-sm font-medium flex items-center gap-1 ${stats.viewsTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp className={`w-3.5 h-3.5 ${stats.viewsTrend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(stats.viewsTrend)}%
              </span>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 backdrop-blur-md border border-accent/20 hover:border-accent/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Downloads</span>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-accent" />
            </div>
          </div>
          <h3 className="text-3xl font-bold">{stats.totalDownloads}</h3>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-muted/5 to-muted/10 backdrop-blur-md border border-border/30 hover:border-border/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Engagement Rate</span>
            <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-foreground" />
            </div>
          </div>
          <h3 className="text-3xl font-bold">
            {stats.totalViews > 0 ? Math.round((stats.totalDownloads / stats.totalViews) * 100) : 0}%
          </h3>
        </Card>
      </div>

      {/* Charts */}
      <Card className="p-6 bg-card/40 backdrop-blur-md border border-border/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Activity Over Time</h3>
            <p className="text-sm text-muted-foreground">Views and downloads for your shared files</p>
          </div>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d')}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="7d" className="text-sm">7 Days</TabsTrigger>
              <TabsTrigger value="30d" className="text-sm">30 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs defaultValue="line" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="line" className="mt-0">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="downloads" 
                    stroke="hsl(var(--accent))"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="bar" className="mt-0">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="downloads" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
