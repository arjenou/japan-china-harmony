import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Lightbulb, Calendar, Handshake, Package, CheckCircle, ClipboardCheck, Truck } from "lucide-react";

const ProcessFlow = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Users,
      key: 'step1',
      number: '1',
    },
    {
      icon: Lightbulb,
      key: 'step2',
      number: '2',
    },
    {
      icon: Calendar,
      key: 'step3',
      number: '3',
    },
    {
      icon: Handshake,
      key: 'step4',
      number: '4',
    },
    {
      icon: CheckCircle,
      key: 'step5',
      number: '5',
    },
    {
      icon: Package,
      key: 'step6',
      number: '6',
    },
    {
      icon: ClipboardCheck,
      key: 'step7',
      number: '7',
    },
    {
      icon: Truck,
      key: 'step8',
      number: '8',
    },
  ];

  return (
    <section id="process" className="py-20 gradient-subtle overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('processFlow.title')}
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 w-full">
            {steps.map((step) => {
              const Icon = step.icon;
              
              return (
                <div key={step.key} className="relative">
                  <div className="bg-card p-3 md:p-6 rounded-lg md:rounded-xl shadow-card border border-border h-full relative transition-smooth hover:shadow-elegant">
                    {/* Background number */}
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 text-3xl md:text-6xl font-bold text-muted-foreground/10 select-none">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="flex justify-center mb-2 md:mb-4 relative z-10">
                      <div className="w-10 h-10 md:w-16 md:h-16 gradient-primary rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 md:w-8 md:h-8 text-primary-foreground" />
                      </div>
                    </div>
                    
                    {/* Title - fixed height to prevent layout shift */}
                    <div className="min-h-[2.5rem] md:min-h-[3rem] mb-1 md:mb-2 relative z-10 flex items-center justify-center">
                      <h3 className="text-sm md:text-xl font-bold text-center text-foreground leading-tight">
                        {t(`processFlow.${step.key}.title`)}
                      </h3>
                    </div>
                    
                    {/* Japanese subtitle - fixed height to prevent layout shift */}
                    <div className="min-h-[1.25rem] md:min-h-[1.5rem] mb-2 md:mb-4 relative z-10 flex items-center justify-center">
                      <p className="text-xs md:text-sm text-center text-muted-foreground leading-tight">
                        {t(`processFlow.${step.key}.subtitle`)}
                      </p>
                    </div>
                    
                    {/* Description - fixed height to prevent layout shift */}
                    <div className="relative z-10 min-h-[4rem] md:min-h-[6rem]">
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {t(`processFlow.${step.key}.description`)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessFlow;

