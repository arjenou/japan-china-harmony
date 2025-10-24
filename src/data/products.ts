export interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  folder: string;
  images: string[];
  features?: string;
}

// 示例产品已移除 - 所有产品从 API 获取
export const sampleProducts: Product[] = [];

