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
    const hasProductsState = sessionStorage.getItem('productsState');
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
      // 从产品详情页返回，滚动到产品区域
      sessionStorage.removeItem('shouldScrollToProducts');
      
      setTimeout(() => {
        const productsSection = document.getElementById("products");
        if (productsSection) {
          const offset = 80;
          const elementPosition = productsSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    } else if (hasProductsState) {
      // 如果有保存的产品浏览状态，先快速滚动到产品区域附近
      // Products 组件会处理具体的产品位置定位
      setTimeout(() => {
        const productsSection = document.getElementById("products");
        if (productsSection) {
          const offset = 100; // 稍微多一点偏移
          const elementPosition = productsSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "auto", // 使用 auto 立即跳转，不干扰后续的平滑滚动
          });
        }
      }, 50); // 减少延迟，快速定位
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
