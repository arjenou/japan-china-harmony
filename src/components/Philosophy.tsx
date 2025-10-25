import { Lightbulb, HandshakeIcon, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Philosophy = () => {
  const { t } = useLanguage();
  
  const philosophies = [
    {
      icon: Lightbulb,
      title: t('philosophy.philosophy1.title'),
      description: t('philosophy.philosophy1.description'),
    },
    {
      icon: HandshakeIcon,
      title: t('philosophy.philosophy2.title'),
      description: t('philosophy.philosophy2.description'),
    },
    {
      icon: TrendingUp,
      title: t('philosophy.philosophy3.title'),
      description: t('philosophy.philosophy3.description'),
    },
  ];

  return (
    <section id="philosophy" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('philosophy.title')}
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {philosophies.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="bg-card p-8 rounded-xl shadow-card hover:shadow-elegant transition-smooth border border-border group"
              >
                <div className="w-16 h-16 gradient-primary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-smooth">
                  <Icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
