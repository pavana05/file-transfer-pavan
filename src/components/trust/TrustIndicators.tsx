import { Shield, Award, Lock, CheckCircle2, TrendingUp, Users, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TrustIndicators = () => {
  const certifications = [
    { name: "ISO 27001", icon: Shield, bgColor: "bg-primary/10", iconColor: "text-primary", hoverBg: "group-hover:bg-primary/20" },
    { name: "SOC 2 Type II", icon: Award, bgColor: "bg-success/10", iconColor: "text-success", hoverBg: "group-hover:bg-success/20" },
    { name: "GDPR Compliant", icon: Lock, bgColor: "bg-warning/10", iconColor: "text-warning", hoverBg: "group-hover:bg-warning/20" },
    { name: "256-bit Encryption", icon: CheckCircle2, bgColor: "bg-primary-glow/10", iconColor: "text-primary-glow", hoverBg: "group-hover:bg-primary-glow/20" }
  ];

  const companyLogos = [
    "TechCorp",
    "DataFlow",
    "SecureNet",
    "CloudBase",
    "InnovateLab",
    "DigitalEdge"
  ];

  const successMetrics = [
    {
      value: "99.9%",
      label: "Uptime Guarantee",
      icon: Clock,
      gradientFrom: "from-success/20",
      gradientTo: "to-success/5"
    },
    {
      value: "2M+",
      label: "Files Secured Daily",
      icon: Shield,
      gradientFrom: "from-primary/20",
      gradientTo: "to-primary/5"
    },
    {
      value: "150+",
      label: "Countries Served",
      icon: Users,
      gradientFrom: "from-warning/20",
      gradientTo: "to-warning/5"
    },
    {
      value: "500K+",
      label: "Happy Customers",
      icon: TrendingUp,
      gradientFrom: "from-primary-glow/20",
      gradientTo: "to-primary-glow/5"
    }
  ];

  return (
    <div className="mb-20 sm:mb-24 relative z-10">
      {/* Section Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6 text-xs font-semibold text-success shadow-sm backdrop-blur-sm">
          <Shield className="h-4 w-4" />
          Trusted by Industry Leaders
        </div>
        
        <h3 className="text-4xl sm:text-5xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Enterprise-Grade Security
          </span>
        </h3>
        
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Trusted by leading organizations worldwide with industry-recognized certifications
        </p>
      </div>

      {/* Security Certifications */}
      <div className="mb-12">
        <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <h4 className="text-xl sm:text-2xl font-bold text-center mb-8">
              Security Certifications & Compliance
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 sm:p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full ${cert.bgColor} ${cert.hoverBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <cert.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${cert.iconColor}`} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-center leading-tight">{cert.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Success Metrics */}
      <div className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {successMetrics.map((metric, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradientFrom} ${metric.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="p-6 sm:p-8 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <metric.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">
                  {metric.value}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{metric.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trusted By Companies */}
      <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-xl overflow-hidden mb-12">
        <div className="p-6 sm:p-8 md:p-12">
          <h4 className="text-xl sm:text-2xl font-bold text-center mb-8">
            Trusted by Leading Organizations
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
            {companyLogos.map((company, index) => (
              <div
                key={index}
                className="group flex items-center justify-center p-4 sm:p-6 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all duration-300 hover:scale-110"
              >
                <div className="text-center">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center mx-auto mb-2 group-hover:from-primary/30 group-hover:to-primary-glow/30 transition-all">
                    <span className="text-lg sm:text-xl font-bold text-primary">{company.charAt(0)}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    {company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Customer Success Story */}
      <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-xl overflow-hidden">
        <div className="p-8 sm:p-10 md:p-14">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Customer Success Story
              </Badge>
            </div>
            
            <blockquote className="text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-4 sm:mb-6 leading-relaxed px-4">
                "FileShare Pro transformed our workflow. We've reduced file transfer time by 70% and enhanced our security posture significantly. The P2P feature alone saved us thousands in infrastructure costs."
              </p>
              <footer className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shadow-lg">
                    JD
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm sm:text-base">John Davis</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">CTO, TechCorp Inc.</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2 sm:mt-4">
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1.5 text-success" />
                    Verified Customer
                  </Badge>
                  <span className="text-xs text-muted-foreground">Since 2023</span>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrustIndicators;