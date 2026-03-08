import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus, Shield } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PremiumPlan {
  name: string;
  slug: string;
  file_size_limit: number;
  expiration_days: number | null;
}

interface FeatureComparisonProps {
  plans: PremiumPlan[];
}

const features = [
  { name: 'Max File Size', category: 'Storage', free: '1 GB', getValue: (p: PremiumPlan) => `${Math.round(p.file_size_limit / (1024 * 1024 * 1024))} GB` },
  { name: 'File Expiration', category: 'Storage', free: '7 days', getValue: (p: PremiumPlan) => p.expiration_days ? `${p.expiration_days} days` : 'Unlimited' },
  { name: 'Uploads per Hour', category: 'Storage', free: '50', getValue: () => 'Unlimited' },
  { name: 'Password Protection', category: 'Security', free: true, getValue: () => true },
  { name: 'PIN Sharing', category: 'Security', free: true, getValue: () => true },
  { name: 'End-to-End Encryption', category: 'Security', free: true, getValue: () => true },
  { name: 'Download Limits', category: 'Control', free: false, getValue: () => true },
  { name: 'Custom Expiration', category: 'Control', free: false, getValue: () => true },
  { name: 'QR Code Sharing', category: 'Sharing', free: true, getValue: () => true },
  { name: 'Collection Uploads', category: 'Sharing', free: true, getValue: () => true },
  { name: 'P2P Transfer', category: 'Sharing', free: true, getValue: () => true },
  { name: 'File Analytics', category: 'Analytics', free: false, getValue: () => true },
  { name: 'Download History', category: 'Analytics', free: false, getValue: () => true },
  { name: 'Priority Support', category: 'Support', free: false, getValue: () => true },
];

const CellValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-success mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
    );
  }
  return <span className="text-sm font-semibold text-foreground">{value}</span>;
};

export const FeatureComparison = ({ plans }: FeatureComparisonProps) => {
  const categories = [...new Set(features.map(f => f.category))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl mx-auto"
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="text-center pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 text-sm font-bold text-primary mx-auto">
            <Shield className="h-4 w-4" />
            Feature Comparison
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-black">Compare All Plans</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[200px] font-bold text-foreground">Feature</TableHead>
                <TableHead className="text-center font-bold text-foreground">Free</TableHead>
                {plans.map(plan => (
                  <TableHead key={plan.slug} className="text-center font-bold text-foreground">
                    <div className="flex flex-col items-center gap-1">
                      {plan.name}
                      {plan.slug === 'business' && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Popular</Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(category => (
                <>
                  <TableRow key={`cat-${category}`} className="bg-muted/10">
                    <TableCell colSpan={2 + plans.length} className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-2 px-4">
                      {category}
                    </TableCell>
                  </TableRow>
                  {features
                    .filter(f => f.category === category)
                    .map(feature => (
                      <TableRow key={feature.name} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-sm text-foreground">{feature.name}</TableCell>
                        <TableCell className="text-center">
                          <CellValue value={feature.free} />
                        </TableCell>
                        {plans.map(plan => (
                          <TableCell key={plan.slug} className="text-center">
                            <CellValue value={feature.getValue(plan)} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};
