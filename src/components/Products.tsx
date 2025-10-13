import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";
import product9 from "@/assets/product-9.jpg";
import product10 from "@/assets/product-10.jpg";
import product11 from "@/assets/product-11.jpg";
import product12 from "@/assets/product-12.jpg";

const categories = [
  "全て",
  "ファッション小物",
  "キッチン用品",
  "インテリア雑貨",
  "アクセサリー",
  "文具",
  "エコ商品",
];

const products = [
  {
    id: 1,
    name: "ファッション小物",
    price: "¥2,800",
    image: product1,
    category: "ファッション小物",
  },
  {
    id: 2,
    name: "エコ雑貨セット",
    price: "¥3,500",
    image: product2,
    category: "エコ商品",
  },
  {
    id: 3,
    name: "アクセサリーコレクション",
    price: "¥4,200",
    image: product3,
    category: "アクセサリー",
  },
  {
    id: 4,
    name: "ライフスタイル雑貨",
    price: "¥3,800",
    image: product4,
    category: "インテリア雑貨",
  },
  {
    id: 5,
    name: "レザーウォレット",
    price: "¥5,200",
    image: product5,
    category: "ファッション小物",
  },
  {
    id: 6,
    name: "竹製キッチン用品",
    price: "¥2,900",
    image: product6,
    category: "キッチン用品",
  },
  {
    id: 7,
    name: "陶器茶器セット",
    price: "¥6,500",
    image: product7,
    category: "キッチン用品",
  },
  {
    id: 8,
    name: "オーガニックトートバッグ",
    price: "¥3,200",
    image: product8,
    category: "エコ商品",
  },
  {
    id: 9,
    name: "プレミアム文具セット",
    price: "¥4,800",
    image: product9,
    category: "文具",
  },
  {
    id: 10,
    name: "木製インテリア雑貨",
    price: "¥4,500",
    image: product10,
    category: "インテリア雑貨",
  },
  {
    id: 11,
    name: "シルクスカーフ＆ジュエリー",
    price: "¥7,200",
    image: product11,
    category: "アクセサリー",
  },
  {
    id: 12,
    name: "アロマセラピーセット",
    price: "¥5,800",
    image: product12,
    category: "インテリア雑貨",
  },
];

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全て");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "全て" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          製品紹介
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            {/* Search */}
            <div className="bg-primary text-primary-foreground p-4 rounded-lg">
              <h3 className="font-bold text-sm mb-3 uppercase tracking-wide">SEARCH</h3>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="キーワードを入力"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-card text-foreground border-border pr-10"
                />
                <Button 
                  size="sm" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 bg-muted hover:bg-muted/80"
                >
                  検索
                </Button>
              </div>
              <p className="text-xs mt-2 opacity-80">品番、品名等で検索ができます</p>
            </div>

            {/* Category */}
            <div className="bg-primary text-primary-foreground p-4 rounded-lg">
              <h3 className="font-bold text-sm mb-3 uppercase tracking-wide">CATEGORY</h3>
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
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">{filteredProducts.length}件</span>の商品が見つかりました
              </div>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-32 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="12">12件</SelectItem>
                  <SelectItem value="20">20件</SelectItem>
                  <SelectItem value="36">36件</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentProducts.map((product) => (
                <div 
                  key={product.id}
                  className="bg-card rounded-xl shadow-card hover:shadow-elegant transition-smooth border border-border overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden bg-secondary/30">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold mb-2 text-foreground">
                      {product.name}
                    </h3>
                    <p className="text-lg font-semibold text-primary">
                      {product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

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
