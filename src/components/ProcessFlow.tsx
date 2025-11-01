import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Lightbulb, Calendar, Handshake, Package, CheckCircle } from "lucide-react";

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
      icon: Package,
      key: 'step5',
      number: '5',
    },
    {
      icon: CheckCircle,
      key: 'step6',
      number: '6',
    },
  ];

  return (
    <section id="process" className="py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('processFlow.title')}
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLastInRowMobile = index % 2 === 1; // Mobile: every 2nd item (0-indexed: 1, 3, 5)
              const isLastInRowDesktop = (index + 1) % 3 === 0; // Desktop: every 3rd item
              const isLastStep = index === steps.length - 1;
              
              return (
                <div key={step.key} className="relative">
                  {/* Arrow connector - only show if not last in row */}
                  {/* Mobile (2 columns): hide if index is 1, 3, 5 (last in pair) */}
                  {/* Desktop (3 columns): hide if index is 2, 5 (last in triple) */}
                  {!isLastInRowMobile && !isLastInRowDesktop && !isLastStep && (
                    <div className="absolute top-16 md:top-24 left-full w-6 md:w-8 h-0.5 bg-border z-0 transform translate-x-2">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[6px] md:border-l-[10px] border-l-border border-t-[4px] md:border-t-[6px] border-t-transparent border-b-[4px] md:border-b-[6px] border-b-transparent" />
                    </div>
                  )}
                  
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

