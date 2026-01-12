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
  Sparkles
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
    { id: 'general', label: 'General Inquiry', icon: HelpCircle },
    { id: 'support', label: 'Technical Support', icon: Headphones },
    { id: 'bug', label: 'Report a Bug', icon: Bug },
    { id: 'feature', label: 'Feature Request', icon: Sparkles },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">Message Sent!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for reaching out. Our team will review your message and get back to you within 24-48 hours.
          </p>
          <Button onClick={() => window.location.href = '/'} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.href = '/'}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-lg font-semibold">Contact Support</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Headphones className="w-4 h-4" />
              We're here to help
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Have a question, feedback, or need assistance? Our support team is ready to help you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Contact Info Cards */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
              <Card className="p-5 bg-card/60 backdrop-blur border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-sm text-muted-foreground">support@fileshare.pro</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-card/60 backdrop-blur border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Response Time</h3>
                    <p className="text-sm text-muted-foreground">Within 24-48 hours</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-card/60 backdrop-blur border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-sm text-muted-foreground">Worldwide Support</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <FileQuestion className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">FAQ</h3>
                    <p className="text-sm text-muted-foreground mb-3">Check our frequently asked questions</p>
                    <Button variant="outline" size="sm" className="w-full">
                      View FAQ
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="p-6 sm:p-8 bg-card/60 backdrop-blur border-border/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Selection */}
                  <div className="space-y-3">
                    <Label>What can we help you with?</Label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                            formData.category === cat.id
                              ? 'bg-primary/10 border-primary/50 text-primary'
                              : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          <cat.icon className="w-4 h-4" />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-11 bg-background/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11 bg-background/60"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your inquiry"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="h-11 bg-background/60"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide as much detail as possible..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="min-h-[140px] bg-background/60 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Contact;