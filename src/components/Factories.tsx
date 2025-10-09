import { Building2, Users, Wrench } from "lucide-react";

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
    capacity: "高周波ウェルダー溶着、超音波ミシン溶着対応",
  },
];

const Factories = () => {
  return (
    <section className="py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          協力工場
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {factories.map((factory, index) => (
            <div 
              key={index}
              className="bg-card p-8 rounded-xl shadow-card hover:shadow-elegant transition-smooth border border-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{factory.name}</h3>
              </div>
              
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground min-w-[100px]">所在地：</span>
                  <span>{factory.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground min-w-[100px]">面積：</span>
                  <span>{factory.area}</span>
                </div>
                
                {factory.employees && (
                  <>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">従業員：</span>
                      <span>{factory.employees}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">技術者：</span>
                      <span>{factory.engineers}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-foreground min-w-[100px]">検査員：</span>
                      <span>{factory.inspectors}</span>
                    </div>
                  </>
                )}
                
                {factory.capacity && (
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-foreground min-w-[100px]">生産能力：</span>
                    <span>{factory.capacity}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Factories;
