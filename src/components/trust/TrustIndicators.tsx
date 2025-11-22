import { Shield, Award, Lock, CheckCircle2, TrendingUp, Users, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
const TrustIndicators = () => {
  const certifications = [{
    name: "ISO 27001",
    icon: Shield,
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
    hoverBg: "group-hover:bg-primary/20"
  }, {
    name: "SOC 2 Type II",
    icon: Award,
    bgColor: "bg-success/10",
    iconColor: "text-success",
    hoverBg: "group-hover:bg-success/20"
  }, {
    name: "GDPR Compliant",
    icon: Lock,
    bgColor: "bg-warning/10",
    iconColor: "text-warning",
    hoverBg: "group-hover:bg-warning/20"
  }, {
    name: "256-bit Encryption",
    icon: CheckCircle2,
    bgColor: "bg-primary-glow/10",
    iconColor: "text-primary-glow",
    hoverBg: "group-hover:bg-primary-glow/20"
  }];
  const companyLogos = ["TechCorp", "DataFlow", "SecureNet", "CloudBase", "InnovateLab", "DigitalEdge"];
  const successMetrics = [{
    value: "99.9%",
    label: "Uptime Guarantee",
    icon: Clock,
    gradientFrom: "from-success/20",
    gradientTo: "to-success/5"
  }, {
    value: "2M+",
    label: "Files Secured Daily",
    icon: Shield,
    gradientFrom: "from-primary/20",
    gradientTo: "to-primary/5"
  }, {
    value: "150+",
    label: "Countries Served",
    icon: Users,
    gradientFrom: "from-warning/20",
    gradientTo: "to-warning/5"
  }, {
    value: "500K+",
    label: "Happy Customers",
    icon: TrendingUp,
    gradientFrom: "from-primary-glow/20",
    gradientTo: "to-primary-glow/5"
  }];
  return <div className="mb-20 sm:mb-24 relative z-10">
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
              {certifications.map((cert, index) => <div key={index} className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 sm:p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full ${cert.bgColor} ${cert.hoverBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <cert.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${cert.iconColor}`} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-center leading-tight">{cert.name}</p>
                  </div>
                </div>)}
            </div>
          </div>
        </Card>
      </div>

      {/* Success Metrics */}
      <div className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {successMetrics.map((metric, index) => <Card key={index} className="group relative overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 hover:scale-105">
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
            </Card>)}
        </div>
      </div>

      {/* Trusted By Companies */}
      <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-xl overflow-hidden mb-12">
        
      </Card>

      {/* Customer Success Story */}
      <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-xl overflow-hidden">
        
      </Card>
    </div>;
};
export default TrustIndicators;