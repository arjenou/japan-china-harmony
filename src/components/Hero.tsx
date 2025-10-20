import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import heroImage1 from "@/assets/hero-bg1.jpg";
import heroImage2 from "@/assets/hero-bg2.jpg";
import heroImage3 from "@/assets/hero-bg3.jpg";

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [heroImage1, heroImage2, heroImage3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 切り替え間隔: 5秒

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Images with Overlay */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`上海英物国際貿易 ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            loading="eager"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/40 to-primary/20" />
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? "bg-accent w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`画像 ${index + 1} に切り替え`}
          />
        ))}
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
