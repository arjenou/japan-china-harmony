import { useState, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { type Product } from "@/data/products";

const API_BASE_URL = 'https://img.mono-grp.com';
const IMAGE_BASE_URL = 'https://img.mono-grp.com';

/** Sidebar order; default selection is the first key (not "all"). */
const PRODUCT_CATEGORY_KEYS = [
  'bags',
  'goods',
  // 'yoga', // ヨガウェア — UI 非表示
  // 'yogaTools', // ヨガ用具 — UI 非表示
  'sports',
  'functional',
  // 'gloves', // 軍手と手袋 — UI 非表示
  'anime',
  'all',
] as const;

const Products = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  
  // 检查是否需要恢复状态（只在初始化时读取一次）
  const [isRestoringState] = useState(() => {
    return !!sessionStorage.getItem('productsState');
  });
  
  // 初始化状态（从 sessionStorage 恢复或使用默认值）
  const [searchInput, setSearchInput] = useState(() => {
    const stored = sessionStorage.getItem('productsState');
    if (stored) {
      try {
        const state = JSON.parse(stored);
        return state.searchQuery || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  });
  
  const [searchQuery, setSearchQuery] = useState(() => {
    const stored = sessionStorage.getItem('productsState');
    if (stored) {
      try {
        const state = JSON.parse(stored);
        return state.searchQuery || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  });
  
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const defaultCategory = t(`products.categories.${PRODUCT_CATEGORY_KEYS[0]}`);
    const returningFromDetail =
      sessionStorage.getItem('shouldScrollToProducts') === 'true' &&
      !!sessionStorage.getItem('lastViewedProductId');
    const stored = sessionStorage.getItem('productsState');
    if (returningFromDetail && stored) {
      try {
        const state = JSON.parse(stored);
        if (state.category && typeof state.category === 'string') {
          const allowed = PRODUCT_CATEGORY_KEYS.map((key) =>
            t(`products.categories.${key}`)
          );
          if (allowed.includes(state.category)) {
            return state.category;
          }
        }
      } catch {
        /* ignore */
      }
    }
    return defaultCategory;
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    const stored = sessionStorage.getItem('productsState');
    if (stored) {
      try {
        const state = JSON.parse(stored);
        return state.page || 1;
      } catch (e) {
        return 1;
      }
    }
    return 1;
  });
  
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const stored = sessionStorage.getItem('productsState');
    if (stored) {
      try {
        const state = JSON.parse(stored);
        return state.itemsPerPage || 12;
      } catch (e) {
        return 12;
      }
    }
    return 12;
  });
  
  const [shouldScrollToProduct, setShouldScrollToProduct] = useState(false);
  
  const categories = PRODUCT_CATEGORY_KEYS.map((key) =>
    t(`products.categories.${key}`)
  );

  // 当语言改变时，重置为当前语言下的第一个分类（但不在恢复状态时执行）
  useEffect(() => {
    if (!isRestoringState) {
      setSelectedCategory(t(`products.categories.${PRODUCT_CATEGORY_KEYS[0]}`));
    }
  }, [language, isRestoringState]);
  
  // 搜索防抖 - 输入停止500ms后自动搜索（但不在恢复状态时重置页码）
  useEffect(() => {
    if (isRestoringState) {
      // 如果正在恢复状态，跳过防抖逻辑
      return;
    }
    
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput, isRestoringState]);

  // 使用 React Query 获取产品数据（带缓存）
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', currentPage, itemsPerPage, selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
      });
      
      // 需要将翻译后的分类名称映射回原始分类名称
      const categoryMap: Record<string, string> = {
        [t('products.categories.all')]: '全て',
        [t('products.categories.yoga')]: 'ヨガウェア',
        [t('products.categories.yogaTools')]: 'ヨガ用具',
        [t('products.categories.sports')]: 'スポーツ・レジャー',
        [t('products.categories.functional')]: '機能性ウェア',
        [t('products.categories.bags')]: 'バッグ類',
        [t('products.categories.gloves')]: '軍手と手袋',
        [t('products.categories.goods')]: '雑貨類',
        [t('products.categories.anime')]: 'アニメ類',
      };
      
      const originalCategory = categoryMap[selectedCategory] || selectedCategory;
      if (originalCategory !== '全て') {
        params.append('category', originalCategory);
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      // 移除强制刷新逻辑，允许使用HTTP缓存
      const response = await fetch(`${API_BASE_URL}/api/products?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      // Transform API products to match our Product interface
      const apiProducts: Product[] = data.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        image: `${IMAGE_BASE_URL}/api/images/${p.image}`,
        category: p.category,
        folder: p.folder,
        images: p.images || [],
        features: p.features,
      }));
      
      return {
        products: apiProducts,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据被视为新鲜
    gcTime: 30 * 60 * 1000, // 缓存保留30分钟
  });

  const products = data?.products || [];
  const totalProducts = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  // 在产品列表加载完成后，滚动到之前浏览的产品位置并添加高亮效果
  useLayoutEffect(() => {
    // 检查是否有上次浏览的产品ID和需要滚动的标记
    const lastProductId = sessionStorage.getItem('lastViewedProductId');
    const shouldScroll = sessionStorage.getItem('shouldScrollToProducts');
    
    if (lastProductId && shouldScroll === 'true' && !isLoading && products.length > 0 && !shouldScrollToProduct) {
      // 标记已处理
      setShouldScrollToProduct(true);

      const scrollToProduct = () => {
        const productElement = document.getElementById(`product-${lastProductId}`);
        if (productElement) {
          const offset = 100;
          const elementPosition = productElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          // 与 Index 中恢复的 scrollY 衔接：瞬时定位，避免从页顶 smooth 滚下来
          window.scrollTo({ top: offsetPosition, behavior: 'auto' });

          productElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-300');

          setTimeout(() => {
            productElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
            sessionStorage.removeItem('lastViewedProductId');
            sessionStorage.removeItem('shouldScrollToProducts');
            sessionStorage.removeItem('productsState');
            sessionStorage.removeItem('savedScrollPosition');
          }, 3000);
        } else {
          const productsSection = document.getElementById('products');
          if (productsSection) {
            const offset = 100;
            const elementPosition = productsSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'auto' });
          }
          sessionStorage.removeItem('lastViewedProductId');
          sessionStorage.removeItem('shouldScrollToProducts');
          sessionStorage.removeItem('productsState');
          sessionStorage.removeItem('savedScrollPosition');
        }
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToProduct);
      });
    }
  }, [isLoading, products, shouldScrollToProduct]);

  return (
    <section id="products" className="py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('products.title')}
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            {/* Search */}
            <div className="bg-primary text-primary-foreground p-4 rounded-lg">
              <h3 className="font-bold text-sm mb-3 uppercase tracking-wide">{t('products.searchTitle')}</h3>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('products.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearchQuery(searchInput);
                      setCurrentPage(1);
                    }
                  }}
                  className="bg-card text-foreground border-border pr-10"
                />
                <Button 
                  size="sm" 
                  onClick={() => {
                    setSearchQuery(searchInput);
                    setCurrentPage(1);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 bg-muted hover:bg-muted/80"
                >
                  {t('products.searchButton')}
                </Button>
              </div>
              <p className="text-xs mt-2 opacity-80">{t('products.searchHint')}</p>
            </div>

            {/* Category - 桌面端显示 */}
            {!isMobile && (
              <div className="bg-primary text-primary-foreground p-4 rounded-lg">
                <h3 className="font-bold text-sm mb-3 uppercase tracking-wide">{t('products.categoryTitle')}</h3>
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left py-2 px-3 text-sm transition-smooth rounded ${
                          selectedCategory === category
                            ? "bg-accent text-accent-foreground font-semibold"
                            : "hover:bg-primary-foreground/10"
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">{totalProducts}</span>{t('products.resultsText')}
              </div>
              <div className="flex items-center gap-3">
                {/* 移动端：类别下拉菜单放在顶部栏 */}
                {isMobile && (
                  <Select value={selectedCategory} onValueChange={(value) => {
                    setSelectedCategory(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="bg-card text-foreground border-border min-w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-32 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="12">12{t('products.itemsPerPage')}</SelectItem>
                    <SelectItem value="20">20{t('products.itemsPerPage')}</SelectItem>
                    <SelectItem value="36">36{t('products.itemsPerPage')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <div key={index} className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3 md:p-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('products.noResults')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    id={`product-${product.id}`}
                    onClick={() => {
                      // 保存当前浏览状态和产品ID
                      const currentState = {
                        page: currentPage,
                        itemsPerPage: itemsPerPage,
                        category: selectedCategory,
                        searchQuery: searchQuery,
                      };
                      sessionStorage.setItem('productsState', JSON.stringify(currentState));
                      sessionStorage.setItem('lastViewedProductId', product.id.toString());
                      
                      // 设置标记，表示从产品列表进入详情页
                      // 当用户使用浏览器后退按钮返回时，会自动滚动到产品区域
                      sessionStorage.setItem('shouldScrollToProducts', 'true');
                      
                      // 保存当前的精确滚动位置
                      sessionStorage.setItem('savedScrollPosition', window.pageYOffset.toString());
                      
                      navigate(`/product/${product.id}`);
                    }}
                    className="bg-card rounded-xl shadow-card hover:shadow-elegant transition-all duration-300 border border-border overflow-hidden group cursor-pointer"
                  >
                    <div className="aspect-square overflow-hidden bg-secondary/30 flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-smooth"
                      />
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="text-sm md:text-base font-bold text-foreground line-clamp-2">
                        {product.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
