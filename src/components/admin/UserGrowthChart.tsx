import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Crown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, format, startOfDay, parseISO } from 'date-fns';

interface UserGrowthProps {
  files: Array<{ user_id: string; upload_date: string }>;
  payments: Array<{ user_id: string; status: string; created_at: string }>;
  totalUsers: number;
  premiumUsers: number;
}

const AnimatedCounter = ({ value, prefix = '' }: { value: number; prefix?: string }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="text-3xl font-bold"
    >
      {prefix}{value.toLocaleString()}
    </motion.span>
  );
};

export const UserGrowthChart = ({ files, payments, totalUsers, premiumUsers }: UserGrowthProps) => {
  // Build growth data for last 14 days
  const growthData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dayStart = startOfDay(date);
    
    // Count unique users who uploaded on this day
    const uniqueUploaders = new Set(
      files
        .filter(f => f.user_id && startOfDay(parseISO(f.upload_date)).getTime() === dayStart.getTime())
        .map(f => f.user_id)
    ).size;

    // Count completed payments on this day
    const dayPremium = payments
      .filter(p => p.status === 'completed' && startOfDay(parseISO(p.created_at)).getTime() === dayStart.getTime())
      .length;

    return {
      date: format(date, 'MMM dd'),
      activeUsers: uniqueUploaders,
      premiumConversions: dayPremium,
    };
  });

  // Calculate trends
  const firstHalfActive = growthData.slice(0, 7).reduce((s, d) => s + d.activeUsers, 0);
  const secondHalfActive = growthData.slice(7).reduce((s, d) => s + d.activeUsers, 0);
  const activeTrend = firstHalfActive === 0 ? 0 : Math.round(((secondHalfActive - firstHalfActive) / firstHalfActive) * 100);

  const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0';

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-success/3 pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="text-lg flex items-center gap-2">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TrendingUp className="h-5 w-5 text-primary" />
          </motion.div>
          User Growth Analytics
        </CardTitle>
        <CardDescription>Active users & premium conversion trends (14 days)</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div 
            className="p-3 rounded-xl bg-primary/5 border border-primary/10"
            whileHover={{ scale: 1.02, borderColor: 'hsl(var(--primary) / 0.3)' }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-medium text-muted-foreground">Total Users</span>
            </div>
            <AnimatedCounter value={totalUsers} />
          </motion.div>

          <motion.div 
            className="p-3 rounded-xl bg-warning/5 border border-warning/10"
            whileHover={{ scale: 1.02, borderColor: 'hsl(var(--warning) / 0.3)' }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Crown className="h-3.5 w-3.5 text-warning" />
              <span className="text-[11px] font-medium text-muted-foreground">Conversion</span>
            </div>
            <AnimatedCounter value={parseFloat(conversionRate)} prefix="" />
            <span className="text-sm font-bold">%</span>
          </motion.div>

          <motion.div 
            className="p-3 rounded-xl bg-success/5 border border-success/10"
            whileHover={{ scale: 1.02, borderColor: 'hsl(var(--success) / 0.3)' }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {activeTrend >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-success" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className="text-[11px] font-medium text-muted-foreground">Trend</span>
            </div>
            <span className={`text-3xl font-bold ${activeTrend >= 0 ? 'text-success' : 'text-destructive'}`}>
              {activeTrend > 0 ? '+' : ''}{activeTrend}%
            </span>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div 
          className="h-[220px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke="hsl(217, 91%, 45%)"
                fillOpacity={1}
                fill="url(#colorActive)"
                name="Active Users"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="premiumConversions"
                stroke="hsl(38, 92%, 50%)"
                fillOpacity={1}
                fill="url(#colorPremium)"
                name="Premium Conversions"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
};
