import { Building2, Users, Wrench, MapPin, Maximize2, ClipboardCheck, Cog } from "lucide-react";

const factories = [
  {
    name: "太倉工場",
    location: "江蘇省太倉市",
    area: "2,000㎡",
    employees: "260名",
    engineers: "25名",
    inspectors: "20名",
  },
  {
    name: "安徽工場",
    location: "拠点数：2か所",
    area: "5,000㎡",
    capacity: "高周波ウェルダー溶着\n超音波ミシン溶着対応",
  },
];

const Factories = () => {
  const backgroundImages = [
    "/factor/factor.png",
    "/factor/factor2.png"
  ];

  return (
    <section id="factories" className="py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          協力工場
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
                    <span className="font-semibold text-white drop-shadow-md">所在地：</span>
                    <span className="text-white drop-shadow-md">{factory.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-accent drop-shadow-md" />
                    <span className="font-semibold text-white drop-shadow-md">面積：</span>
                    <span className="text-white drop-shadow-md">{factory.area}</span>
                  </div>
                  
                  {factory.employees && (
                    <>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent drop-shadow-md" />
                        <span className="font-semibold text-white drop-shadow-md">従業員：</span>
                        <span className="text-white drop-shadow-md">{factory.employees}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-accent drop-shadow-md" />
                        <span className="font-semibold text-white drop-shadow-md">技術者：</span>
                        <span className="text-white drop-shadow-md">{factory.engineers}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-accent drop-shadow-md" />
                        <span className="font-semibold text-white drop-shadow-md">検査員：</span>
                        <span className="text-white drop-shadow-md">{factory.inspectors}</span>
                      </div>
                    </>
                  )}
                  
                  {factory.capacity && (
                    <div className="flex items-start gap-2">
                      <Cog className="w-4 h-4 text-accent flex-shrink-0 mt-1 drop-shadow-md" />
                      <span className="font-semibold text-white whitespace-nowrap drop-shadow-md">生産能力：</span>
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
