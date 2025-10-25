import { Globe, Package, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const { t } = useLanguage();
  
  const services = [
    {
      icon: Globe,
      title: t('services.service1.title'),
      description: t('services.service1.description'),
    },
    {
      icon: Package,
      title: t('services.service2.title'),
      description: t('services.service2.description'),
    },
    {
      icon: Sparkles,
      title: t('services.service3.title'),
      description: t('services.service3.description'),
    },
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('services.title')}
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index}
                className="bg-card p-8 rounded-xl shadow-card hover:shadow-elegant transition-smooth border border-border group text-center"
              >
                <div className="w-16 h-16 gradient-accent rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                  <Icon className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
