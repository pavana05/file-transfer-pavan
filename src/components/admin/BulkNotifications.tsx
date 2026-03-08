import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Send, Users, Crown, AlertTriangle, Bell, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UserRecord {
  user_id: string;
  email?: string;
  has_premium: boolean;
  roles: string[];
}

interface BulkNotificationsProps {
  users: UserRecord[];
}

export const BulkNotifications = ({ users }: BulkNotificationsProps) => {
  const { user: currentUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [includeAdmins, setIncludeAdmins] = useState(false);

  const getAudienceCount = () => {
    switch (audience) {
      case 'premium': return users.filter(u => u.has_premium).length;
      case 'free': return users.filter(u => !u.has_premium).length;
      case 'admins': return users.filter(u => u.roles.includes('admin')).length;
      default: return users.length;
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;
    switch (audience) {
      case 'premium': filtered = users.filter(u => u.has_premium); break;
      case 'free': filtered = users.filter(u => !u.has_premium); break;
      case 'admins': filtered = users.filter(u => u.roles.includes('admin')); break;
    }
    if (!includeAdmins && audience !== 'admins') {
      filtered = filtered.filter(u => !u.roles.includes('admin'));
    }
    return filtered;
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    const targetUsers = getFilteredUsers();
    if (targetUsers.length === 0) {
      toast.error('No users match the selected criteria');
      return;
    }

    setSending(true);
    try {
      // Log the bulk notification action
      await supabase.from('audit_logs').insert({
        admin_id: currentUser?.id || '',
        action: 'bulk_notification',
        target_type: 'users',
        details: {
          audience,
          recipient_count: targetUsers.length,
          subject,
          include_admins: includeAdmins,
        },
      });

      // Send emails to each user via edge function
      let successCount = 0;
      let failCount = 0;

      for (const targetUser of targetUsers.slice(0, 50)) {
        if (!targetUser.email) continue;
        try {
          const { error } = await supabase.functions.invoke('send-admin-reply', {
            body: {
              contactId: null,
              recipientName: targetUser.email.split('@')[0],
              recipientEmail: targetUser.email,
              subject,
              message,
              templateType: 'custom',
            },
          });
          if (!error) successCount++;
          else failCount++;
        } catch {
          failCount++;
        }
      }

      toast.success(`Sent to ${successCount} users${failCount > 0 ? `, ${failCount} failed` : ''}`);
      setSubject('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Compose */}
      <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Compose Notification
          </CardTitle>
          <CardDescription>Send announcements to users via email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Subject</label>
            <Input placeholder="Notification subject..." value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Message</label>
            <Textarea placeholder="Write your announcement..." value={message} onChange={e => setMessage(e.target.value)} rows={8} />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="include-admins" checked={includeAdmins} onCheckedChange={(v) => setIncludeAdmins(!!v)} />
              <label htmlFor="include-admins" className="text-sm">Include admins</label>
            </div>
          </div>
          <Button onClick={handleSend} disabled={sending || !subject.trim() || !message.trim()} className="w-full sm:w-auto">
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : `Send to ${getAudienceCount()} users`}
          </Button>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Limited to 50 recipients per batch to avoid rate limits
          </p>
        </CardContent>
      </Card>

      {/* Audience */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="premium">Premium Users</SelectItem>
              <SelectItem value="free">Free Users</SelectItem>
              <SelectItem value="admins">Admins Only</SelectItem>
            </SelectContent>
          </Select>

          <div className="space-y-3 pt-2">
            {[
              { label: 'All Users', count: users.length, icon: Users, active: audience === 'all' },
              { label: 'Premium', count: users.filter(u => u.has_premium).length, icon: Crown, active: audience === 'premium' },
              { label: 'Free', count: users.filter(u => !u.has_premium).length, icon: Bell, active: audience === 'free' },
              { label: 'Admins', count: users.filter(u => u.roles.includes('admin')).length, icon: Mail, active: audience === 'admins' },
            ].map(item => (
              <div key={item.label} className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${item.active ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{item.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
