import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { products } from "@/data/products";

const categories = [
  "全て",
  "バッグ類",
  "手袋類",
  "収納用品",
  "衣類",
  "その他雑貨",
];

const Products = () => {
  const navigate = useNavigate();
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
    <section id="products" className="py-20 bg-muted/30">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {currentProducts.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-card rounded-xl shadow-card hover:shadow-elegant transition-smooth border border-border overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden bg-secondary/30">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
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
