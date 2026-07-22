import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Crown, Star, Diamond, Award, Trophy, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Donation {
  id: string;
  name: string | null;
  amount: number;
  message: string | null;
  created_at: string;
}

const getTier = (amount: number) => {
  if (amount >= 99900) return { label: 'Diamond', icon: Diamond, gradient: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' };
  if (amount >= 49900) return { label: 'Crown', icon: Crown, gradient: 'from-amber-400 to-yellow-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
  if (amount >= 14900) return { label: 'Premium', icon: Award, gradient: 'from-purple-400 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' };
  if (amount >= 9900) return { label: 'Star', icon: Star, gradient: 'from-primary to-primary-glow', bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' };
  if (amount >= 4900) return { label: 'Supporter', icon: Heart, gradient: 'from-pink-400 to-rose-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' };
  return { label: 'Friend', icon: Heart, gradient: 'from-muted-foreground to-muted-foreground', bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground' };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount / 100);
};

const DonorWall = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'top'>('all');

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    const { data, error } = await supabase
      .from('donation_wall' as any)
      .select('id, name, amount, message, created_at')
      .order('amount', { ascending: false });

    if (!error && data) setDonations(data);
    setLoading(false);
  };

  const topDonors = donations.slice(0, 3);
  const displayed = filter === 'top' ? donations.slice(0, 10) : donations;

  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/10 via-primary/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-amber-500/10 to-transparent rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:text-primary" />
            <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/support">
              <Button size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                Donate
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-10 sm:py-16 lg:py-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6 text-sm font-bold text-pink-500">
            <Heart className="h-4 w-4" />
            Wall of Gratitude
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
            <span className="text-foreground">Our Amazing </span>
            <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">Supporters</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you to everyone who helps keep FileShare Pro free and open
          </p>

          {/* Total Raised */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm shadow-lg"
          >
            <Trophy className="h-6 w-6 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Total Raised</p>
              <p className="text-2xl font-black text-foreground">{formatCurrency(totalRaised)}</p>
            </div>
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </motion.div>
        </motion.div>

        {/* Top 3 Podium */}
        {topDonors.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-end justify-center gap-4 mb-16 max-w-3xl mx-auto"
          >
            {[topDonors[1], topDonors[0], topDonors[2]].map((donor, i) => {
              const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
              const tier = getTier(donor.amount);
              const height = rank === 1 ? 'h-40' : rank === 2 ? 'h-32' : 'h-24';
              const Icon = tier.icon;

              return (
                <motion.div
                  key={donor.id}
                  whileHover={{ y: -8 }}
                  className={`flex-1 relative ${rank === 1 ? 'order-2 sm:order-2' : rank === 2 ? 'order-1 sm:order-1' : 'order-3 sm:order-3'}`}
                >
                  <Card className={`overflow-hidden border ${tier.border} ${tier.bg} backdrop-blur-sm`}>
                    <CardContent className={`p-4 sm:p-6 text-center ${height} flex flex-col items-center justify-center`}>
                      <div className={`text-2xl sm:text-3xl font-black mb-1 ${rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-gray-400' : 'text-amber-700'}`}>
                        #{rank}
                      </div>
                      <Icon className={`h-6 w-6 ${tier.text} mb-2`} />
                      <p className="text-sm font-bold text-foreground truncate w-full">{donor.name || 'Anonymous'}</p>
                      <p className="text-lg font-black text-foreground">{formatCurrency(donor.amount)}</p>
                      <Badge className={`mt-1 ${tier.bg} ${tier.text} ${tier.border} text-[10px]`}>
                        {tier.label}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {(['all', 'top'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Supporters' : 'Top 10'}
            </Button>
          ))}
        </div>

        {/* Donor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <AnimatePresence>
              {displayed.map((donor, i) => {
                const tier = getTier(donor.amount);
                const Icon = tier.icon;

                return (
                  <motion.div
                    key={donor.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className={`overflow-hidden border ${tier.border} bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl ${tier.bg} flex items-center justify-center border ${tier.border} group-hover:scale-110 transition-transform`}>
                              <Icon className={`h-5 w-5 ${tier.text}`} />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm">{donor.name || 'Anonymous'}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {format(new Date(donor.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-foreground">{formatCurrency(donor.amount)}</p>
                            <Badge className={`${tier.bg} ${tier.text} ${tier.border} text-[10px] mt-0.5`}>
                              {tier.label}
                            </Badge>
                          </div>
                        </div>
                        {donor.message && (
                          <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-2 mt-2 line-clamp-2">
                            "{donor.message}"
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {displayed.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No donations yet</p>
                <p className="text-sm mt-1">Be the first to support FileShare Pro!</p>
                <Link to="/support">
                  <Button className="mt-4 gap-2">
                    <Heart className="h-4 w-4" />
                    Make a Donation
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DonorWall;
