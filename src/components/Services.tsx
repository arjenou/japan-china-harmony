import { Globe, Package, Sparkles } from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "アジア工場との橋渡し",
    description: "中国 協力工場5社以上",
  },
  {
    icon: Package,
    title: "小ロット対応",
    description: "MOQ 100pcs～小ロット対応、短納期（最短20日）",
  },
  {
    icon: Sparkles,
    title: "OEM/ODM",
    description: "企画・デザイン・サンプル・生産・検品・輸入・在庫保管まで\n雑貨問わず、PSE対応実績あり",
  },
];

const Services = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          主要サービス
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
