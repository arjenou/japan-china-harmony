import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { type Product } from "@/data/products";

const API_BASE_URL = 'https://api.mono-grp.com';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 使用 React Query 获取产品详情（带缓存）
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // 添加时间戳参数以绕过缓存（每分钟更新一次）
      const cacheKey = Math.floor(Date.now() / 60000);
      const response = await fetch(`${API_BASE_URL}/api/products/${id}?_t=${cacheKey}`, {
        // 强制不使用浏览器缓存
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      
      if (data.product) {
        const apiProduct: Product = {
          id: data.product.id,
          name: data.product.name,
          image: `${API_BASE_URL}/api/images/${data.product.image}`,
          category: data.product.category,
          folder: data.product.folder,
          images: data.product.images || [],
          features: data.product.features,
        };
        return apiProduct;
      }
      return null;
    },
    staleTime: 1 * 60 * 1000, // 1分钟内数据被视为新鲜（从10分钟改为1分钟）
    gcTime: 5 * 60 * 1000, // 缓存保留5分钟（从30分钟改为5分钟）
    enabled: !!id, // 只在有id时才执行查询
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleBackToProducts = () => {
    // 标记需要滚动到产品区域，并保持产品状态用于定位
    sessionStorage.setItem('shouldScrollToProducts', 'true');
    // 保留 lastViewedProductId，让 Products 组件精确定位
    // 返回首页
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Skeleton className="h-10 w-40 mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-10 w-1/2" />
              </div>
              
              <Skeleton className="h-px w-full" />
              
              <div className="space-y-4">
                <Skeleton className="h-7 w-40" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
              
              <Skeleton className="h-px w-full" />
              
              <div className="space-y-4">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-40" />
              </div>
              
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">商品が見つかりません</h2>
          <Button onClick={handleBackToProducts} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            商品一覧に戻る
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentImage = `${API_BASE_URL}/api/images/${product.images[currentImageIndex]}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        {/* Back Button */}
        <Button 
          onClick={handleBackToProducts} 
          variant="ghost" 
          className="mb-6 hover:bg-primary/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          商品一覧に戻る
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-secondary/30 rounded-xl overflow-hidden group flex items-center justify-center">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6 text-primary" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-6 w-6 text-primary" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-secondary/30 ${
                      currentImageIndex === index
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={`${API_BASE_URL}/api/images/${img}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                {product.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
            </div>

            <div className="w-full h-px bg-border" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">商品の特徴</h2>
              <div className="prose prose-sm text-muted-foreground">
                {product.features ? (
                  <ul className="space-y-2">
                    {product.features.split('\n').filter(f => f.trim()).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2">
                    <li>高品質な素材を使用</li>
                    <li>実用性と耐久性を兼ね備えた設計</li>
                    <li>日常使いに最適</li>
                    <li>OEM/ODM対応可能</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-border" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">お問い合わせ</h2>
              <p className="text-muted-foreground">
                この商品についてのご質問やご注文については、お気軽にお問い合わせください。
              </p>
              <Button 
                onClick={() => {
                  navigate("/");
                  setTimeout(() => {
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="w-full sm:w-auto"
              >
                お問い合わせ
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-bold text-foreground">サービス内容</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ 小ロットから大量生産まで対応</li>
                <li>✓ OEM/ODMサービス</li>
                <li>✓ 品質管理と検査</li>
                <li>✓ 柔軟な納期対応</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;

