import { useLayoutEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Factories from "@/components/Factories";
import Services from "@/components/Services";
import Products from "@/components/Products";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  // 使用 useLayoutEffect 在 DOM 更新后、浏览器绘制前执行
  useLayoutEffect(() => {
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
      // 从产品详情页返回，立即粗略定位到产品区域
      // 不等待数据加载，直接定位到产品section的位置
      // Products 组件加载后会进行精确定位
      const productsSection = document.getElementById("products");
      if (productsSection) {
        const navbarHeight = 80;
        const extraSpace = 20;
        const offset = navbarHeight + extraSpace;
        
        const elementRect = productsSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const elementTop = elementRect.top + scrollTop;
        const scrollPosition = elementTop - offset;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: "auto",
        });
      }
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
