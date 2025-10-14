import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="上海英物国際貿易" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 md:mb-6 animate-fade-in whitespace-nowrap overflow-x-auto">
            上海英物国際貿易有限会社
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-3 md:mb-4 leading-relaxed">
            世界の"いいモノ"を作りに
          </p>
          <p className="text-sm sm:text-base md:text-lg text-primary-foreground/80 mb-6 md:mb-8 leading-relaxed">
            中国の製造と貿易の一体運営、優良工場と長年のパイプを活かし、雑貨・ファッション小物・エコ雑貨のOEM/ODMを中心に、小ロットから大型量販店向けまで幅広くお手伝いします。年間100アイテム以上の開発実績。
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent-glow text-accent-foreground shadow-glow transition-smooth text-sm sm:text-base"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            お問い合わせ
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
