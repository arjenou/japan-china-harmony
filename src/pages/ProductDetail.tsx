import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { type Product } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";

const API_BASE_URL = 'https://img.mono-grp.com';
const IMAGE_BASE_URL = 'https://img.mono-grp.com';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 使用 React Query 获取产品详情（带缓存）
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // 移除强制刷新逻辑，允许使用HTTP缓存
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      
      if (data.product) {
        const apiProduct: Product = {
          id: data.product.id,
          name: data.product.name,
          image: `${IMAGE_BASE_URL}/api/images/${data.product.image}`,
          category: data.product.category,
          folder: data.product.folder,
          images: data.product.images || [],
          features: data.product.features,
        };
        return apiProduct;
      }
      return null;
    },
    staleTime: 10 * 60 * 1000, // 10分钟内数据被视为新鲜
    gcTime: 60 * 60 * 1000, // 缓存保留1小时
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
          <h2 className="text-2xl font-bold mb-4">{t('productDetail.notFound')}</h2>
          <Button onClick={handleBackToProducts} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('productDetail.backToList')}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentImage = `${IMAGE_BASE_URL}/api/images/${product.images[currentImageIndex]}`;

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
          {t('productDetail.backToList')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-secondary/30 rounded-xl overflow-hidden group flex items-center justify-center">
              <img
                src={currentImage}
                alt={product.name}
                loading="lazy"
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
                      src={`${IMAGE_BASE_URL}/api/images/${img}`}
                      alt={`${product.name} ${index + 1}`}
                      loading="lazy"
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
              <h2 className="text-xl font-bold text-foreground">{t('productDetail.features')}</h2>
              <div className="prose prose-sm text-muted-foreground">
                {product.features ? (
                  <ul className="space-y-2">
                    {product.features.split('\n').filter(f => f.trim()).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2">
                    <li>{t('productDetail.defaultFeature1')}</li>
                    <li>{t('productDetail.defaultFeature2')}</li>
                    <li>{t('productDetail.defaultFeature3')}</li>
                    <li>{t('productDetail.defaultFeature4')}</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-border" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">{t('productDetail.contactTitle')}</h2>
              <p className="text-muted-foreground">
                {t('productDetail.contactDescription')}
              </p>
              <Button 
                onClick={() => {
                  // 清除产品滚动标记，设置联系表单滚动目标
                  sessionStorage.removeItem('shouldScrollToProducts');
                  sessionStorage.setItem('scrollTarget', 'contact');
                  navigate("/");
                }}
                className="w-full sm:w-auto"
              >
                {t('productDetail.contactButton')}
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-bold text-foreground">{t('productDetail.servicesTitle')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t('productDetail.service1')}</li>
                <li>{t('productDetail.service2')}</li>
                <li>{t('productDetail.service3')}</li>
                <li>{t('productDetail.service4')}</li>
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

