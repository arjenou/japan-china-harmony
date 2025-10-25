import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Factories from "@/components/Factories";
import Services from "@/components/Services";
import Products from "@/components/Products";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    // 检查是否有待滚动的目标section
    const scrollTarget = sessionStorage.getItem('scrollTarget');
    const shouldScrollToProducts = sessionStorage.getItem('shouldScrollToProducts');
    
    if (scrollTarget) {
      // 清除存储的目标
      sessionStorage.removeItem('scrollTarget');
      
      // 等待页面完全渲染后再滚动
      setTimeout(() => {
        const element = document.getElementById(scrollTarget);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    } else if (shouldScrollToProducts === 'true') {
      // 从产品详情页返回，直接跳转到产品区域（不要滚动动画）
      // 让 Products 组件处理精确定位到具体商品
      // 不需要 setTimeout，立即执行
      const productsSection = document.getElementById("products");
      if (productsSection) {
        const offset = 200;
        const elementPosition = productsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "auto", // 使用 auto 立即跳转，无动画
        });
      }
    } else {
      // 没有目标section，正常滚动到顶部
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero />
        <Philosophy />
        <Factories />
        <Services />
        <Products />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default Index;
