import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Shield, Flag, Search, Eye, CheckCircle, XCircle, Trash2, AlertTriangle, FileUp, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface FileReport {
  id: string;
  file_id: string;
  reporter_id: string | null;
  reason: string;
  details: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

interface FileRecord {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  user_id: string;
  share_token: string;
  is_public: boolean;
}

interface FileModerationProps {
  files: FileRecord[];
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const FileModeration = ({ files }: FileModerationProps) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<FileReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<FileReport | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [flagFileId, setFlagFileId] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [flagDetails, setFlagDetails] = useState('');

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('file_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Enrich with file info
      const enriched = data.map(r => {
        const file = files.find(f => f.id === r.file_id);
        return {
          ...r,
          file_name: file?.original_name || 'Unknown',
          file_size: file?.file_size || 0,
          file_type: file?.file_type || 'unknown',
        };
      });
      setReports(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { loadReports(); }, [files]);

  const handleReview = async (status: 'resolved' | 'dismissed') => {
    if (!selectedReport || !user) return;
    try {
      await supabase
        .from('file_reports')
        .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
        .eq('id', selectedReport.id);

      await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action: 'report_reviewed',
        target_type: 'file_report',
        target_id: selectedReport.id,
        details: { status, file_id: selectedReport.file_id, notes: reviewNotes },
      });

      toast.success(`Report ${status}`);
      setIsReviewOpen(false);
      setSelectedReport(null);
      setReviewNotes('');
      loadReports();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update report');
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedReport || !user) return;
    try {
      const file = files.find(f => f.id === selectedReport.file_id);
      if (file) {
        await supabase.storage.from('uploads').remove([file.share_token]);
        await supabase.from('uploaded_files').delete().eq('id', file.id);
      }
      await supabase.from('file_reports').update({ status: 'resolved', reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', selectedReport.id);
      await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action: 'file_delete',
        target_type: 'file',
        target_id: selectedReport.file_id,
        details: { reason: 'moderation', report_id: selectedReport.id },
      });
      toast.success('File deleted and report resolved');
      setIsDeleteConfirm(false);
      setIsReviewOpen(false);
      loadReports();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete file');
    }
  };

  const handleFlagFile = async () => {
    if (!flagFileId || !flagReason || !user) return;
    try {
      await supabase.from('file_reports').insert({
        file_id: flagFileId,
        reporter_id: user.id,
        reason: flagReason,
        details: flagDetails || null,
      });
      await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action: 'file_flagged',
        target_type: 'file',
        target_id: flagFileId,
        details: { reason: flagReason },
      });
      toast.success('File flagged for review');
      setIsFlagOpen(false);
      setFlagFileId('');
      setFlagReason('');
      setFlagDetails('');
      loadReports();
    } catch (error: any) {
      toast.error(error.message || 'Failed to flag file');
    }
  };

  const filtered = reports.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSearch = search === '' || r.file_name?.toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'resolved': return <Badge className="bg-success/10 text-success border-success/20">Resolved</Badge>;
      case 'dismissed': return <Badge variant="secondary">Dismissed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: reports.length, icon: Flag, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pending', value: pendingCount, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Dismissed', value: reports.filter(r => r.status === 'dismissed').length, icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reports Table */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Moderation Queue
                {pendingCount > 0 && <Badge className="bg-warning/10 text-warning border-warning/20 ml-2">{pendingCount} pending</Badge>}
              </CardTitle>
              <CardDescription>Review flagged files and policy violations</CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsFlagOpen(true)}>
              <Flag className="h-4 w-4 mr-2" />
              Flag File
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(report => (
                  <TableRow key={report.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[150px]">{report.file_name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(report.file_size || 0)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[200px]">{report.reason}</p>
                    </TableCell>
                    <TableCell>{statusBadge(report.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedReport(report); setIsReviewOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Shield className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No reports found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">File</span>
                  <span className="text-sm font-medium">{selectedReport.file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reason</span>
                  <span className="text-sm font-medium">{selectedReport.reason}</span>
                </div>
                {selectedReport.details && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Details</span>
                    <span className="text-sm">{selectedReport.details}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {statusBadge(selectedReport.status)}
                </div>
              </div>
              <Textarea placeholder="Review notes (optional)..." value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={3} />
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="destructive" size="sm" onClick={() => setIsDeleteConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete File
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleReview('dismissed')}>
                  <XCircle className="h-4 w-4 mr-2" /> Dismiss
                </Button>
                <Button size="sm" onClick={() => handleReview('resolved')}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Resolve
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={isDeleteConfirm} onOpenChange={setIsDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the file and resolve the report. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flag File Dialog */}
      <Dialog open={isFlagOpen} onOpenChange={setIsFlagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag File for Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={flagFileId} onValueChange={setFlagFileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a file..." />
              </SelectTrigger>
              <SelectContent>
                {files.slice(0, 50).map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.original_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={flagReason} onValueChange={setFlagReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copyright">Copyright Violation</SelectItem>
                <SelectItem value="malware">Suspected Malware</SelectItem>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="spam">Spam / Abuse</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Additional details..." value={flagDetails} onChange={e => setFlagDetails(e.target.value)} rows={3} />
            <DialogFooter>
              <Button onClick={handleFlagFile} disabled={!flagFileId || !flagReason}>
                <Flag className="h-4 w-4 mr-2" /> Flag File
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
