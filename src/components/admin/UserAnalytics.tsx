import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, HardDrive, Download, TrendingUp, Crown, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface UserRecord {
  user_id: string;
  email?: string;
  files_count: number;
  total_downloads: number;
  total_storage: number;
  has_premium: boolean;
  roles: string[];
}

interface UserAnalyticsProps {
  users: UserRecord[];
  totalFiles: number;
  totalStorage: number;
}

const COLORS = ['hsl(217, 91%, 45%)', 'hsl(152, 76%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(280, 70%, 50%)', 'hsl(350, 80%, 55%)'];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const UserAnalytics = ({ users, totalFiles, totalStorage }: UserAnalyticsProps) => {
  // Top users by storage
  const topByStorage = [...users].sort((a, b) => b.total_storage - a.total_storage).slice(0, 8);
  const storageData = topByStorage.map(u => ({
    name: u.email?.split('@')[0] || u.user_id.slice(0, 8),
    storage: Math.round(u.total_storage / 1024 / 1024 * 10) / 10, // MB
  }));

  // Top users by downloads
  const topByDownloads = [...users].sort((a, b) => b.total_downloads - a.total_downloads).slice(0, 8);
  const downloadData = topByDownloads.map(u => ({
    name: u.email?.split('@')[0] || u.user_id.slice(0, 8),
    downloads: u.total_downloads,
  }));

  // User engagement distribution
  const activeUsers = users.filter(u => u.files_count > 0).length;
  const premiumUsers = users.filter(u => u.has_premium).length;
  const powerUsers = users.filter(u => u.files_count >= 10).length;
  const casualUsers = activeUsers - powerUsers;

  const engagementData = [
    { name: 'Power Users (10+ files)', value: powerUsers },
    { name: 'Active Users', value: casualUsers },
    { name: 'Premium Users', value: premiumUsers },
    { name: 'Inactive', value: users.length - activeUsers },
  ].filter(d => d.value > 0);

  const avgFilesPerUser = users.length ? (totalFiles / users.length).toFixed(1) : '0';
  const avgStoragePerUser = users.length ? formatFileSize(totalStorage / users.length) : '0 B';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: activeUsers, icon: Activity, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Avg Files/User', value: avgFilesPerUser, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Avg Storage/User', value: avgStoragePerUser, icon: HardDrive, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Power Users', value: powerUsers, icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users by Storage */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              Top Users by Storage (MB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storageData} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" fontSize={11} stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="storage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement Pie */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={engagementData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${value}`}>
                    {engagementData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center -mt-4">
                {engagementData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top by Downloads */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4 text-success" />
              Most Popular Users by Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={downloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="downloads" fill="hsl(152, 76%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
