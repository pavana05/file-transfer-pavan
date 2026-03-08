import { motion } from 'framer-motion';
import { Upload, Link2, Download, Shield, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Files',
    desc: 'Drag & drop any file up to 1GB. Images, documents, videos — we support 100+ formats.',
    color: 'primary',
  },
  {
    icon: Link2,
    title: 'Get a Secure Link',
    desc: 'Instantly receive a shareable link or PIN code. Add password protection & expiration dates.',
    color: 'success',
  },
  {
    icon: Download,
    title: 'Share Anywhere',
    desc: 'Recipients download with one click. No signup needed. Track downloads in real-time.',
    color: 'warning',
  },
  {
    icon: Shield,
    title: 'Stay in Control',
    desc: 'Revoke access anytime. Set download limits. Files auto-delete after your chosen period.',
    color: 'primary',
  },
];

export const HowItWorks = () => {
  return (
    <div className="mb-28 sm:mb-36 relative z-10">
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6 text-sm font-bold text-success">
          <ArrowRight className="h-4 w-4" />
          How It Works
        </div>
        <h3 className="text-4xl sm:text-5xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent font-bold">
          Share Files in 4 Simple Steps
        </h3>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          From upload to download, your files are always protected
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
        {/* Connection lines (desktop only) */}
        <div className="hidden lg:block absolute top-[72px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
            whileHover={{ y: -8 }}
          >
            <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm group hover:border-primary/30 transition-all duration-500 h-full text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-6 sm:p-8 relative z-10">
                {/* Step Number */}
                <div className="absolute top-4 right-4 text-5xl font-black text-muted-foreground/10 select-none">
                  {i + 1}
                </div>

                <motion.div
                  className={`h-16 w-16 rounded-2xl bg-${step.color}/10 border border-${step.color}/20 flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_24px_hsl(var(--${step.color})/0.2)]`}
                  whileHover={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <step.icon className={`h-8 w-8 text-${step.color}`} />
                </motion.div>

                <div className="text-lg font-bold mb-2 text-foreground">{step.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
