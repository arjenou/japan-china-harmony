import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products, type Product } from "@/data/products";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === Number(id));
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">商品が見つかりません</h2>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ホームに戻る
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentImage = `/Goods/zahuo/${product.folder}/${product.images[currentImageIndex]}`;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        {/* Back Button */}
        <Button 
          onClick={() => navigate("/")} 
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
            <div className="relative aspect-square bg-secondary/30 rounded-xl overflow-hidden group">
              <img
                src={currentImage}
                alt={product.nameJa}
                className="w-full h-full object-cover"
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
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={`/Goods/zahuo/${product.folder}/${img}`}
                      alt={`${product.nameJa} ${index + 1}`}
                      className="w-full h-full object-cover"
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {product.nameJa}
              </h1>
              <p className="text-lg text-muted-foreground">
                {product.name}
              </p>
            </div>

            <div className="w-full h-px bg-border" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">商品の特徴</h2>
              <div className="prose prose-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>高品質な素材を使用</li>
                  <li>実用性と耐久性を兼ね備えた設計</li>
                  <li>日常使いに最適</li>
                  <li>OEM/ODM対応可能</li>
                </ul>
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

