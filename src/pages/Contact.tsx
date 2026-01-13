import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Headphones, 
  Clock, 
  MapPin, 
  CheckCircle2,
  Loader2,
  HelpCircle,
  FileQuestion,
  Bug,
  Sparkles,
  Shield,
  Globe,
  Zap,
  Phone,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });

  const categories = [
    { id: 'general', label: 'General Inquiry', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { id: 'support', label: 'Technical Support', icon: Headphones, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { id: 'bug', label: 'Report a Bug', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { id: 'feature', label: 'Feature Request', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  ];

  const features = [
    { icon: Shield, label: 'Secure & Private', desc: 'Your data is protected' },
    { icon: Zap, label: 'Fast Response', desc: 'Within 24 hours' },
    { icon: Globe, label: 'Global Support', desc: 'Available worldwide' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible."
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/10 rounded-full blur-3xl" />
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative text-center max-w-md"
        >
          <motion.div 
            className="relative inline-flex mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="absolute inset-0 bg-success/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-success via-emerald-500 to-success/80 flex items-center justify-center shadow-2xl shadow-success/30 ring-4 ring-success/20">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-success" />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Message Sent Successfully!
          </motion.h1>
          
          <motion.p 
            className="text-muted-foreground text-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Thank you for reaching out. Our expert team will review your message and respond within 24-48 hours.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              onClick={() => window.location.href = '/'} 
              size="lg"
              className="gap-2 h-12 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/20"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 right-1/4 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.href = '/'}
            className="gap-2 hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Headphones className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold">Support Center</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-12 sm:mb-16">
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 text-primary text-sm font-semibold mb-6 shadow-lg shadow-primary/5"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              We're online and ready to help
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              How Can We Help You?
            </h1>
            
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Have a question, feedback, or need assistance? Our dedicated support team is here to provide you with the best possible service.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/60 backdrop-blur border border-border/50"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Contact Info Cards */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
              {/* Email Card */}
              <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur border-border/50 group hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Email Us</h3>
                    <p className="text-primary font-medium">support@fileshare.pro</p>
                    <p className="text-xs text-muted-foreground mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>
              </Card>

              {/* Response Time Card */}
              <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-card via-card to-success/5 backdrop-blur border-border/50 group hover:border-success/30 transition-all duration-300 hover:shadow-xl hover:shadow-success/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-success/20 transition-all duration-500" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-success/20 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Fast Response</h3>
                    <p className="text-success font-medium">Within 24-48 hours</p>
                    <p className="text-xs text-muted-foreground mt-1">Priority support for premium users</p>
                  </div>
                </div>
              </Card>

              {/* Location Card */}
              <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-card via-card to-accent/5 backdrop-blur border-border/50 group hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-all duration-500" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Global Support</h3>
                    <p className="text-muted-foreground font-medium">Available Worldwide</p>
                    <p className="text-xs text-muted-foreground mt-1">24/7 support in all time zones</p>
                  </div>
                </div>
              </Card>

              {/* FAQ Card */}
              <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 group hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                    <FileQuestion className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Browse FAQ</h3>
                    <p className="text-sm text-muted-foreground mb-4">Find instant answers to common questions</p>
                    <Button variant="outline" size="sm" className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 group/btn">
                      View FAQ
                      <ExternalLink className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card className="relative overflow-hidden p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-card via-card to-muted/10 backdrop-blur border-border/50 shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative">
                  {/* Form Header */}
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">Send us a Message</h2>
                    <p className="text-muted-foreground">Fill out the form below and we'll get back to you shortly.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">What can we help you with?</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                          <motion.button
                            key={cat.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.id })}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
                              formData.category === cat.id
                                ? `${cat.bg} ${cat.border} ${cat.color} shadow-lg`
                                : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50 hover:border-border'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg ${formData.category === cat.id ? cat.bg : 'bg-muted/50'} flex items-center justify-center transition-colors`}>
                              <cat.icon className={`w-4 h-4 ${formData.category === cat.id ? cat.color : 'text-muted-foreground'}`} />
                            </div>
                            <span className="text-sm truncate">{cat.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">Your Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="h-12 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-12 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-semibold">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your inquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="h-12 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-semibold">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide as much detail as possible so we can assist you better..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="min-h-[160px] bg-background/60 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl resize-none transition-all"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="lg"
                        className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary/90 hover:to-primary/80 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 rounded-xl"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    {/* Privacy note */}
                    <p className="text-xs text-center text-muted-foreground">
                      <Shield className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                      Your information is secure and will never be shared with third parties.
                    </p>
                  </form>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Contact;