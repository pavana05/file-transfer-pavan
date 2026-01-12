import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
const FAQSection = () => {
  const faqs = [{
    question: "How secure is FileShare Pro?",
    answer: "FileShare Pro uses military-grade AES-256 encryption to protect your files. All data is encrypted both in transit and at rest. You can also add password protection and set expiration dates for additional security layers. We never access your files and they're automatically deleted after expiration."
  }, {
    question: "What's the maximum file size I can upload?",
    answer: "You can upload files up to 10GB per file. Our chunked upload technology ensures reliable transfers even for large files, with automatic resume capability if your connection drops. There's no limit on the number of files you can share."
  }, {
    question: "Do I need to create an account to share files?",
    answer: "No! You can share files instantly without creating an account. Simply upload your file and get a shareable link. However, creating a free account unlocks additional features like file management, access analytics, download history, and the ability to organize files into collections."
  }, {
    question: "How long are files stored?",
    answer: "By default, files are stored for 7 days. You can customize the expiration date when uploading, or set files to never expire (for registered users). Files are automatically and permanently deleted after expiration to ensure your privacy."
  }, {
    question: "Can I track who downloads my files?",
    answer: "Yes! With a free account, you get detailed analytics including download counts, access times, IP addresses, and geographic locations. You can also see failed access attempts if you've enabled PIN protection."
  }, {
    question: "What is P2P file transfer?",
    answer: "Peer-to-Peer transfer allows you to share files directly between devices using WebRTC technology, without uploading to our servers. It's perfect for local sharing, offers faster speeds, and provides complete privacy as files never touch our servers."
  }];
  return <div className="mb-20 sm:mb-24 relative z-10">
      <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 text-xs font-semibold shadow-sm backdrop-blur-sm text-accent-foreground">
          <HelpCircle className="h-4 w-4" />
          Frequently Asked Questions
        </div>
        
        <h3 className="text-4xl sm:text-5xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Got Questions?
          </span>
        </h3>
        
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
          Find answers to common questions about FileShare Pro
        </p>
      </div>

      <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="p-4 sm:p-6 md:p-10">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="border border-border/50 rounded-lg px-4 sm:px-6 py-2 hover:bg-muted/30 hover:border-primary/30 transition-all duration-300">
                <AccordionTrigger className="text-left hover:no-underline py-3 sm:py-4">
                  <div className="flex items-start gap-2 sm:gap-3 pr-2 sm:pr-4">
                    <Badge variant="outline" className="mt-0.5 sm:mt-1 shrink-0 h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center p-0 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-semibold text-sm sm:text-base md:text-lg text-foreground">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2 pb-4 pl-8 sm:pl-12 pr-2 sm:pr-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </Card>
    </div>;
};
export default FAQSection;