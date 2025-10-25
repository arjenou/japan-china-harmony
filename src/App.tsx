import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 禁用浏览器默认的滚动恢复行为
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// 路由变化时的滚动管理组件
function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // 检查是否需要恢复滚动位置（从产品详情页返回）
    const shouldScrollToProducts = sessionStorage.getItem('shouldScrollToProducts');
    const savedScrollPosition = sessionStorage.getItem('savedScrollPosition');
    
    if (shouldScrollToProducts === 'true' && savedScrollPosition) {
      // 直接恢复到保存的滚动位置
      const scrollPos = parseInt(savedScrollPosition, 10);
      window.scrollTo({
        top: scrollPos,
        behavior: 'auto', // 立即跳转，无动画
      });
      // 清除标记
      sessionStorage.removeItem('shouldScrollToProducts');
      sessionStorage.removeItem('savedScrollPosition');
    } else if (shouldScrollToProducts !== 'true') {
      // 正常情况下滚动到顶部
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
