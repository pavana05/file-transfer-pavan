import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserCog, Trash2, Mail, FileUp, Search, Clock, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';

interface AuditEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

const actionConfig: Record<string, { icon: typeof Shield; color: string; bg: string; label: string }> = {
  role_change: { icon: UserCog, color: 'text-primary', bg: 'bg-primary/10', label: 'Role Change' },
  file_delete: { icon: Trash2, color: 'text-destructive', bg: 'bg-destructive/10', label: 'File Deleted' },
  email_sent: { icon: Mail, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Email Sent' },
  report_reviewed: { icon: Shield, color: 'text-warning', bg: 'bg-warning/10', label: 'Report Reviewed' },
  bulk_notification: { icon: Mail, color: 'text-success', bg: 'bg-success/10', label: 'Bulk Notification' },
  file_flagged: { icon: FileUp, color: 'text-warning', bg: 'bg-warning/10', label: 'File Flagged' },
};

const defaultConfig = { icon: Shield, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Action' };

export const AuditLog = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setLogs(data as AuditEntry[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const filtered = logs.filter(log => {
    const matchSearch = search === '' || 
      log.action.includes(search.toLowerCase()) ||
      log.target_type.includes(search.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Audit Log & Event Timeline
            </CardTitle>
            <CardDescription>Track all admin actions and system events</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="role_change">Role Changes</SelectItem>
              <SelectItem value="file_delete">File Deletions</SelectItem>
              <SelectItem value="email_sent">Emails Sent</SelectItem>
              <SelectItem value="report_reviewed">Reports Reviewed</SelectItem>
              <SelectItem value="bulk_notification">Bulk Notifications</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative space-y-1 max-h-[500px] overflow-y-auto pr-1">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border/50" />
          
          <AnimatePresence>
            {filtered.map((log, i) => {
              const config = actionConfig[log.action] || defaultConfig;
              const Icon = config.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative flex items-start gap-4 p-3 rounded-lg hover:bg-muted/40 transition-colors group"
                >
                  <div className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 z-10`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1">
                      {log.target_type}{log.target_id ? ` #${log.target_id.slice(0, 8)}` : ''}
                    </p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {JSON.stringify(log.details).slice(0, 120)}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:block">
                    {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No audit logs found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
