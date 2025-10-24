export interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  folder: string;
  images: string[];
  features?: string;
}

// 示例产品 - 仅用于演示
export const sampleProducts: Product[] = [
  {
    id: 1,
    name: "ビジネスバックパック・ノートPCバッグ",
    image: "/Goods/zahuo/Business_Backpack_Laptop_Bag/O1CN015RbkQu1NO4N0GuzsC_!!955051559-0-cib.jpg",
    category: "包类",
    folder: "Business_Backpack_Laptop_Bag",
    images: [
      "O1CN015RbkQu1NO4N0GuzsC_!!955051559-0-cib.jpg",
      "O1CN01KlRLBL1NO4N8T2tMT_!!955051559-0-cib.jpg",
      "O1CN01pqrROt1NO4XiyXqET_!!955051559-0-cib.jpg",
      "O1CN01rAmTfU1NO4NCH0Avl_!!955051559-0-cib.jpg",
      "O1CN01RfsWSD1NO4NEBXeqW_!!955051559-0-cib.jpg",
    ],
    features: "高品質な素材を使用\n実用性と耐久性を兼ね備えた設計\n日常使いに最適\nOEM/ODM対応可能",
  },
];

