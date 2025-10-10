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

const products = [
  {
    id: 1,
    name: "ファッション小物",
    price: "¥2,800",
    image: product1,
  },
  {
    id: 2,
    name: "エコ雑貨セット",
    price: "¥3,500",
    image: product2,
  },
  {
    id: 3,
    name: "アクセサリーコレクション",
    price: "¥4,200",
    image: product3,
  },
  {
    id: 4,
    name: "ライフスタイル雑貨",
    price: "¥3,800",
    image: product4,
  },
  {
    id: 5,
    name: "レザーウォレット",
    price: "¥5,200",
    image: product5,
  },
  {
    id: 6,
    name: "竹製キッチン用品",
    price: "¥2,900",
    image: product6,
  },
  {
    id: 7,
    name: "陶器茶器セット",
    price: "¥6,500",
    image: product7,
  },
  {
    id: 8,
    name: "オーガニックトートバッグ",
    price: "¥3,200",
    image: product8,
  },
  {
    id: 9,
    name: "プレミアム文具セット",
    price: "¥4,800",
    image: product9,
  },
  {
    id: 10,
    name: "木製インテリア雑貨",
    price: "¥4,500",
    image: product10,
  },
  {
    id: 11,
    name: "シルクスカーフ＆ジュエリー",
    price: "¥7,200",
    image: product11,
  },
  {
    id: 12,
    name: "アロマセラピーセット",
    price: "¥5,800",
    image: product12,
  },
];

const Products = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          製品紹介
        </h2>
        <div className="w-20 h-1 gradient-accent mx-auto mb-12 rounded-full" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {products.map((product) => (
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
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {product.name}
                </h3>
                <p className="text-xl font-semibold text-primary">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
