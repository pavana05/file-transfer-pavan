import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Eye, MessageSquare, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  color: string;
  joinedAt: string;
}

interface Annotation {
  id: string;
  userId: string;
  userName: string;
  text: string;
  position: { x: number; y: number };
  timestamp: string;
}

interface RealtimeCollaborationProps {
  fileId: string;
  fileName: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(280 85% 65%)',
  'hsl(217 91% 60%)',
];

const RealtimeCollaboration = ({ fileId, fileName }: RealtimeCollaborationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!fileId) return;

    const channel = supabase.channel(`file:${fileId}`, {
      config: {
        presence: {
          key: user?.id || `anonymous-${Math.random().toString(36).substr(2, 9)}`,
        },
      },
    });

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: User[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            users.push({
              id: key,
              name: presence.name || 'Anonymous',
              color: presence.color,
              joinedAt: presence.joinedAt,
            });
          });
        });
        
        setActiveUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        toast({
          title: 'User Joined',
          description: `${newPresences[0].name} is now viewing this file`,
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'annotation' }, ({ payload }) => {
        setAnnotations((prev) => [...prev, payload as Annotation]);
        toast({
          title: 'New Annotation',
          description: `${payload.userName} added a comment`,
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const userColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          
          await channel.track({
            name: user?.email?.split('@')[0] || 'Anonymous',
            color: userColor,
            joinedAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [fileId, user, toast]);

  const handleAddAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.trim()) return;

    const annotation: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'anonymous',
      userName: user?.email?.split('@')[0] || 'Anonymous',
      text: newAnnotation,
      position: annotationPosition,
      timestamp: new Date().toISOString(),
    };

    const channel = supabase.channel(`file:${fileId}`);
    await channel.send({
      type: 'broadcast',
      event: 'annotation',
      payload: annotation,
    });

    setAnnotations((prev) => [...prev, annotation]);
    setNewAnnotation('');
    setShowAnnotationForm(false);

    toast({
      title: 'Annotation Added',
      description: 'Your comment has been shared with viewers',
    });
  };

  const handleFileClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.classList.contains('annotatable')) {
      setAnnotationPosition({ x: e.clientX, y: e.clientY });
      setShowAnnotationForm(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Users */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Currently Viewing</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Eye className="h-3 w-3" />
            {activeUsers.length}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeUsers.map((activeUser) => (
            <div key={activeUser.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Avatar className="h-6 w-6" style={{ backgroundColor: activeUser.color }}>
                <AvatarFallback className="text-xs text-white">
                  {activeUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{activeUser.name}</span>
            </div>
          ))}
          {activeUsers.length === 0 && (
            <p className="text-sm text-muted-foreground">You are the first viewer</p>
          )}
        </div>
      </Card>

      {/* Annotations */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Annotations</span>
          </div>
          <Badge variant="secondary">{annotations.length}</Badge>
        </div>

        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="p-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary">
                  {annotation.userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(annotation.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-foreground">{annotation.text}</p>
            </div>
          ))}
          {annotations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No annotations yet. Click "Add Comment" to start.
            </p>
          )}
        </div>

        {!showAnnotationForm ? (
          <Button
            onClick={() => setShowAnnotationForm(true)}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <Pencil className="h-4 w-4" />
            Add Comment
          </Button>
        ) : (
          <form onSubmit={handleAddAnnotation} className="space-y-2">
            <Textarea
              value={newAnnotation}
              onChange={(e) => setNewAnnotation(e.target.value)}
              placeholder="Share your thoughts or feedback..."
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Post Comment
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAnnotationForm(false);
                  setNewAnnotation('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default RealtimeCollaboration;
