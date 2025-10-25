import { useEffect } from "react";
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

  useEffect(() => {
    // 检查是否需要保持滚动位置（从产品详情页返回）
    const shouldScrollToProducts = sessionStorage.getItem('shouldScrollToProducts');
    
    // 如果不需要定位到产品，则正常滚动到顶部
    if (shouldScrollToProducts !== 'true') {
      window.scrollTo(0, 0);
    }
    // 如果需要定位到产品，不执行滚动到顶部，让 Index 组件处理
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
