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
    // 检查是否有待滚动的目标section（从导航菜单点击）
    const scrollTarget = sessionStorage.getItem('scrollTarget');
    
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
    }
    
    // 检查是否需要滚动到产品区域（从产品详情页通过浏览器后退按钮返回）
    const shouldScrollToProducts = sessionStorage.getItem('shouldScrollToProducts');
    
    if (shouldScrollToProducts === 'true') {
      // 清除标记
      sessionStorage.removeItem('shouldScrollToProducts');
      
      // 等待页面完全渲染后再滚动到产品区域
      // 使用 requestAnimationFrame 确保在浏览器下一次重绘前执行
      requestAnimationFrame(() => {
        setTimeout(() => {
          const productsElement = document.getElementById('products');
          if (productsElement) {
            const offset = 80;
            const elementPosition = productsElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }, 300);
      });
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
