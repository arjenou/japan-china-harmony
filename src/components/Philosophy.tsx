import { Lightbulb, HandshakeIcon, TrendingUp } from "lucide-react";

const philosophies = [
  {
    icon: Lightbulb,
    title: "少数精鋭だからこそ、御社の利益を最大化",
    description: "中間コストを削減し、スピーディーな意思決定で、メーカー様・小売様双方の収益向上に貢献します。",
  },
  {
    icon: HandshakeIcon,
    title: "三方よしのトレードを。",
    description: "サプライヤーも、お客様も、地球も笑顔になる仕組みを大切にします。",
  },
  {
    icon: TrendingUp,
    title: "継続は力なり、変化はチャンスなり。",
    description: "市場の変化をデータで捉え、小さな改善を積み重ねることで、長くお付き合いいただけるパートナーを目指します。",
  },
];

const Philosophy = () => {
  return (
    <section id="philosophy" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          経営理念
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
