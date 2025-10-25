import { Building2, Users, Wrench, MapPin, Maximize2, ClipboardCheck, Cog } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Factories = () => {
  const { t } = useLanguage();
  
  const factories = [
    {
      name: t('factories.factory1.name'),
      location: t('factories.factory1.location'),
      area: t('factories.factory1.area'),
      employees: t('factories.factory1.employees'),
      engineers: t('factories.factory1.engineers'),
      inspectors: t('factories.factory1.inspectors'),
    },
    {
      name: t('factories.factory2.name'),
      location: t('factories.factory2.location'),
      area: t('factories.factory2.area'),
      capacity: t('factories.factory2.capacity'),
    },
  ];

  const backgroundImages = [
    "/factor/factor.png",
    "/factor/factor2.png"
  ];

  return (
    <section id="factories" className="py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('factories.title')}
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {factories.map((factory, index) => (
            <div 
              key={index}
              className="relative p-8 rounded-xl shadow-card hover:shadow-elegant transition-smooth border border-border overflow-hidden"
              style={{
                backgroundImage: `url(${backgroundImages[index]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* 蒙版层 */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/65 via-gray-700/60 to-gray-900/70" />
              
              {/* 内容层 */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/40 shadow-lg">
                    <Building2 className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">{factory.name}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent drop-shadow-md" />
                    <span className="font-semibold text-white drop-shadow-md">{t('factories.labels.location')}：</span>
                    <span className="text-white drop-shadow-md">{factory.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-accent drop-shadow-md" />
                    <span className="font-semibold text-white drop-shadow-md">{t('factories.labels.area')}：</span>
                    <span className="text-white drop-shadow-md">{factory.area}</span>
                  </div>
                  
                  {factory.employees && (
                    <>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent drop-shadow-md" />
                        <span className="font-semibold text-white drop-shadow-md">{t('factories.labels.employees')}：</span>
                        <span className="text-white drop-shadow-md">{factory.employees}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-accent drop-shadow-md" />
                        <span className="font-semibold text-white drop-shadow-md">{t('factories.labels.engineers')}：</span>
                        <span className="text-white drop-shadow-md">{factory.engineers}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-accent drop-shadow-md" />
                        <span className="font-semibold text-white drop-shadow-md">{t('factories.labels.inspectors')}：</span>
                        <span className="text-white drop-shadow-md">{factory.inspectors}</span>
                      </div>
                    </>
                  )}
                  
                  {factory.capacity && (
                    <div className="flex items-start gap-2">
                      <Cog className="w-4 h-4 text-accent flex-shrink-0 mt-1 drop-shadow-md" />
                      <span className="font-semibold text-white whitespace-nowrap drop-shadow-md">{t('factories.labels.capacity')}：</span>
                      <span className="whitespace-pre-line text-white drop-shadow-md">{factory.capacity}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Factories;
