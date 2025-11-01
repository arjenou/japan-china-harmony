import { useLayoutEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Factories from "@/components/Factories";
import Services from "@/components/Services";
import Products from "@/components/Products";
// import ProcessFlow from "@/components/ProcessFlow";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  // 使用 useLayoutEffect 在 DOM 更新后、浏览器绘制前执行
  useLayoutEffect(() => {
    // 检查是否有待滚动的目标section（从导航菜单点击或产品页联系按钮）
    const scrollTarget = sessionStorage.getItem('scrollTarget');
    
    if (scrollTarget) {
      // 清除存储的目标
      sessionStorage.removeItem('scrollTarget');
      // 同时清除产品滚动标记，避免冲突
      sessionStorage.removeItem('shouldScrollToProducts');
      
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
      return; // 如果有 scrollTarget，不执行后续的 shouldScrollToProducts 逻辑
    }
    
    // 检查是否需要滚动到产品区域（从产品详情页通过浏览器后退按钮返回）
    // 注意：如果有 lastViewedProductId，让 Products 组件处理具体产品的滚动
    // 这里只处理没有具体产品ID的情况（直接滚动到产品区域）
    const shouldScrollToProducts = sessionStorage.getItem('shouldScrollToProducts');
    const lastProductId = sessionStorage.getItem('lastViewedProductId');
    
    if (shouldScrollToProducts === 'true' && !lastProductId) {
      // 如果没有具体产品ID，只滚动到产品区域顶部
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
    // 如果有 lastProductId，Products 组件会自己处理滚动到具体产品位置
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
        {/* <ProcessFlow /> */}
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default Index;
