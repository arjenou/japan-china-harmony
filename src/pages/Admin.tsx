import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { compressImages } from '@/lib/imageCompressor';

const API_BASE_URL = 'https://yingwu-admin.wangyunjie1101.workers.dev';

const categories = [
  'バッグ類',
  'ヨガウェア',
  'ヨガ用具',
  'スポーツ・レジャー',
  '機能性ウェア',
  '軍手と手袋',
  '雑貨類',
  'アニメ類'
];

interface Product {
  id: number;
  name: string;
  category: string;
  folder: string;
  image: string;
  features?: string;
  images?: string[];
  display_order?: number;
}

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    features: '',
    folder: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, currentPage]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('pageSize', pageSize.toString());
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      // 添加时间戳参数强制绕过缓存
      params.append('_t', Date.now().toString());
      
      const url = `${API_BASE_URL}/api/products?${params.toString()}`;
      
      const response = await fetch(url, {
        // 强制不使用缓存
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      const data = await response.json();
      
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 0);
      setTotalCount(data.total || 0);
    } catch (error) {
      toast({
        title: '错误',
        description: '获取商品列表失败',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: '错误',
        description: '请填写商品名称和分类',
        variant: 'destructive',
      });
      return;
    }

    if (!editingProduct && (!selectedFiles || selectedFiles.length === 0)) {
      toast({
        title: '错误',
        description: '请至少上传一张图片',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('features', formData.features);
      
      if (!editingProduct) {
        formDataToSend.append('folder', formData.folder || formData.name.replace(/[^a-zA-Z0-9]/g, '_'));
      }

      // 压缩图片
      if (selectedFiles && selectedFiles.length > 0) {
        setIsCompressing(true);
        setCompressionProgress({ current: 0, total: selectedFiles.length });

        const filesArray = Array.from(selectedFiles);
        const compressedFiles = await compressImages(
          filesArray,
          {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            maxSize: 500 * 1024, // 500KB
          },
          (current, total) => {
            setCompressionProgress({ current, total });
          }
        );

        setIsCompressing(false);

        for (let i = 0; i < compressedFiles.length; i++) {
          formDataToSend.append('images', compressedFiles[i]);
        }
      }

      const url = editingProduct 
        ? `${API_BASE_URL}/api/products/${editingProduct.id}`
        : `${API_BASE_URL}/api/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: '成功',
          description: editingProduct ? '商品更新成功' : '商品创建成功',
        });
        
        // 如果是编辑模式，重新获取产品数据并保持对话框打开
        if (editingProduct) {
          // 清空文件选择
          setSelectedFiles(null);
          // 清空文件输入框
          const fileInput = document.getElementById('images') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          
          // 重新获取该产品的最新数据
          const updatedProductResponse = await fetch(
            `${API_BASE_URL}/api/products/${editingProduct.id}?_t=${Date.now()}`,
            {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
              },
            }
          );
          
          if (updatedProductResponse.ok) {
            const data = await updatedProductResponse.json();
            const updatedProduct = data.product || data; // 兼容两种返回格式
            setEditingProduct(updatedProduct);
            
            // 更新表单数据
            setFormData({
              name: updatedProduct.name,
              category: updatedProduct.category,
              features: updatedProduct.features || '',
              folder: updatedProduct.folder
            });
            
            // 立即更新本地 products 列表中对应的产品数据
            setProducts(prevProducts => 
              prevProducts.map(p => 
                p.id === updatedProduct.id ? updatedProduct : p
              )
            );
          }
          
          // 后台刷新产品列表，确保与服务器完全同步
          fetchProducts();
        } else {
          // 新建模式，关闭对话框
          setIsDialogOpen(false);
          resetForm();
          fetchProducts();
        }
      } else {
        throw new Error(result.error || '操作失败');
      }
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '操作失败',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsCompressing(false);
      setCompressionProgress({ current: 0, total: 0 });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        // 立即从本地状态中移除该产品，提供即时反馈
        setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
        
        toast({
          title: '成功',
          description: '商品删除成功',
        });
        
        // 后台重新获取数据，确保与服务器同步
        fetchProducts();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '删除失败',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (productId: number, imageUrl: string) => {
    if (!confirm('确定要删除这张图片吗？')) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${productId}/images/${encodeURIComponent(imageUrl)}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (response.ok) {
        // 立即更新 editingProduct 的图片列表，移除被删除的图片
        if (editingProduct && editingProduct.images) {
          const updatedImages = editingProduct.images.filter(img => img !== imageUrl);
          setEditingProduct({
            ...editingProduct,
            images: updatedImages,
            // 如果删除的是主图，更新主图为第一张剩余图片
            image: editingProduct.image === imageUrl ? updatedImages[0] || '' : editingProduct.image
          });
        }
        
        toast({
          title: '成功',
          description: '图片删除成功',
        });
        
        // 后台刷新产品列表，确保与服务器同步
        fetchProducts();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '删除失败',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveImage = async (direction: 'up' | 'down', index: number) => {
    if (!editingProduct || !editingProduct.images) return;

    const images = [...editingProduct.images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // 检查边界
    if (newIndex < 0 || newIndex >= images.length) return;

    // 交换位置
    [images[index], images[newIndex]] = [images[newIndex], images[index]];

    // 立即更新本地状态，提供即时反馈
    setEditingProduct({
      ...editingProduct,
      images,
      image: images[0], // 更新主图为第一张
    });

    // 发送到服务器
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${editingProduct.id}/images/reorder`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ images }),
        }
      );

      // 检查响应状态
      if (!response.ok) {
        // 尝试解析错误响应
        const text = await response.text();
        let errorMessage = '更新失败';
        try {
          const result = JSON.parse(text);
          errorMessage = result.error || errorMessage;
        } catch {
          // 如果不是JSON，使用HTTP状态码
          errorMessage = `服务器错误 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // 解析成功响应
      const result = await response.json();

      toast({
        title: '成功',
        description: '图片顺序已更新',
      });
      
      // 后台刷新产品列表，确保与服务器同步
      fetchProducts();
    } catch (error: any) {
      // 恢复原状态
      if (editingProduct && editingProduct.images) {
        // 如果有原始数据，恢复
        const product = products.find(p => p.id === editingProduct.id);
        if (product) {
          setEditingProduct({
            ...editingProduct,
            images: product.images || [],
            image: product.image,
          });
        }
      }
      
      toast({
        title: '错误',
        description: error.message || '更新失败，请确保后端API已部署',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', features: '', folder: '' });
    setSelectedFiles(null);
    setEditingProduct(null);
  };

  const handleEdit = async (product: Product) => {
    // 从服务器获取最新的产品数据，确保显示最新信息
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${product.id}?_t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const latestProduct = data.product || data;
        
        setEditingProduct(latestProduct);
        setFormData({
          name: latestProduct.name,
          category: latestProduct.category,
          features: latestProduct.features || '',
          folder: latestProduct.folder
        });
        setIsDialogOpen(true);
      } else {
        // 如果获取失败，使用本地数据作为后备
        setEditingProduct(product);
        setFormData({
          name: product.name,
          category: product.category,
          features: product.features || '',
          folder: product.folder
        });
        setIsDialogOpen(true);
        
        toast({
          title: '提示',
          description: '获取最新数据失败，显示可能不是最新的',
          variant: 'default',
        });
      }
    } catch (error) {
      // 出错时使用本地数据
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        features: product.features || '',
        folder: product.folder
      });
      setIsDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1); // 重置到第一页
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderInputChange = (productId: number, newOrder: number) => {
    // 实时更新本地显示（仅更新输入框的值）
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, display_order: newOrder } : p
      )
    );
  };

  const handleOrderInputBlur = async (productId: number, newOrder: number) => {
    if (newOrder < 1) {
      newOrder = 1;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          display_order: newOrder,
          category: selectedCategory === 'all' ? null : selectedCategory
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = '更新失败';
        try {
          const result = JSON.parse(text);
          errorMessage = result.error || errorMessage;
        } catch {
          errorMessage = `服务器错误 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      toast({
        title: '成功',
        description: `产品顺序已更新为 ${newOrder}`,
      });
      
      // 刷新产品列表以显示正确的顺序
      await fetchProducts();
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '更新失败',
        variant: 'destructive',
      });
      
      // 刷新以恢复正确的数据
      await fetchProducts();
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveProduct = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === products.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newProducts = [...products];
    
    // 交换两个产品的位置
    [newProducts[index], newProducts[newIndex]] = [newProducts[newIndex], newProducts[index]];
    
    // 立即更新本地状态，提供即时反馈
    setProducts(newProducts);

    // 准备批量更新数据
    const updateData = newProducts.map((product, idx) => ({
      id: product.id,
      display_order: (currentPage - 1) * pageSize + idx + 1
    }));

    // 发送到服务器
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: updateData }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = '更新失败';
        try {
          const result = JSON.parse(text);
          errorMessage = result.error || errorMessage;
        } catch {
          errorMessage = `服务器错误 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      toast({
        title: '成功',
        description: '产品顺序已更新',
      });
      
      // 刷新产品列表
      await fetchProducts();
    } catch (error: any) {
      // 恢复原状态
      setProducts(products);
      
      toast({
        title: '错误',
        description: error.message || '更新失败',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">商品管理后台</h1>
            <p className="text-gray-600 mt-2">管理您的商品库存和信息</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                添加商品
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? '编辑商品' : '添加新商品'}</DialogTitle>
                <DialogDescription>
                  填写商品信息并上传图片
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">商品名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例：ビジネスバックパック"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">分类 *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!editingProduct && (
                  <div>
                    <Label htmlFor="folder">文件夹名称（可选）</Label>
                    <Input
                      id="folder"
                      value={formData.folder}
                      onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                      placeholder="留空将自动生成"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="features">商品特征</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="高品質な素材を使用&#10;実用性と耐久性を兼ね備えた設計&#10;日常使いに最適"
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">每行一个特征</p>
                </div>

                {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                  <div>
                    <Label>当前图片</Label>
                    <p className="text-sm text-gray-500 mb-2">第一张图片将作为主图显示</p>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {editingProduct.images.map((img, index) => (
                        <div key={index} className="relative group border rounded-lg p-2 bg-white hover:shadow-md transition-shadow">
                          <div className="w-full h-32 bg-secondary/30 rounded flex items-center justify-center mb-2">
                            <img
                              src={`${API_BASE_URL}/api/images/${img}`}
                              alt={`Product ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          
                          {/* 图片编号和主图标记 */}
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-600">
                              图 {index + 1}
                            </span>
                            {index === 0 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                主图
                              </span>
                            )}
                          </div>
                          
                          {/* 控制按钮组 */}
                          <div className="flex gap-1">
                            {/* 上移按钮 */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 h-7"
                              onClick={() => handleMoveImage('up', index)}
                              disabled={index === 0}
                              title="上移"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            
                            {/* 下移按钮 */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 h-7"
                              onClick={() => handleMoveImage('down', index)}
                              disabled={index === editingProduct.images!.length - 1}
                              title="下移"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                            
                            {/* 删除按钮 */}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="flex-1 h-7"
                              onClick={() => handleDeleteImage(editingProduct.id, img)}
                              title="删除"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="images">
                    {editingProduct ? (
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        添加更多图片
                      </span>
                    ) : (
                      '商品图片 *'
                    )}
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {editingProduct ? (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        选择图片后点击"更新商品"，新图片将追加到列表末尾（无需关闭窗口）
                      </span>
                    ) : (
                      '可选择多张图片，第一张将作为主图'
                    )}
                  </p>
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        已选择 {selectedFiles.length} 张新图片，点击"更新商品"按钮上传
                      </p>
                    </div>
                  )}
                </div>

                {isCompressing && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">正在压缩图片...</span>
                      <span className="text-sm text-blue-700">
                        {compressionProgress.current} / {compressionProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(compressionProgress.current / compressionProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading || isCompressing} className="flex-1">
                    {isCompressing 
                      ? '压缩中...' 
                      : isLoading 
                      ? '处理中...' 
                      : editingProduct 
                      ? '更新商品' 
                      : '创建商品'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleDialogClose(false)}
                    disabled={isLoading || isCompressing}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Label>筛选分类</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="全部分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {totalCount > 0 && (
            <div className="text-sm text-gray-600">
              共 <span className="font-semibold">{totalCount}</span> 个商品
            </div>
          )}
        </div>

        {isLoading && !isDialogOpen ? (
          <div className="text-center py-12">
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">暂无商品</p>
              <p className="text-sm text-gray-500 mt-2">点击上方按钮添加第一个商品</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-gray-100 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={`${API_BASE_URL}/api/images/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
                    {product.category}
                  </div>
                  {/* 显示顺序号或输入框 */}
                  {selectedCategory === 'all' ? (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {(currentPage - 1) * pageSize + index + 1}
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-white rounded-lg shadow-md p-1">
                      <input
                        type="number"
                        min="1"
                        value={product.display_order || (currentPage - 1) * pageSize + index + 1}
                        onChange={(e) => handleOrderInputChange(product.id, parseInt(e.target.value) || 1)}
                        onBlur={(e) => handleOrderInputBlur(product.id, parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-center font-bold text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="输入顺序号（1=最前）"
                      />
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.features && (
                    <CardDescription className="line-clamp-2">
                      {product.features}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-2">
                  {/* 在"全部"分类时显示排序按钮 */}
                  {selectedCategory === 'all' && (
                    <div className="flex gap-1 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => handleMoveProduct(index, 'up')}
                        disabled={index === 0 || isLoading}
                        title="上移"
                      >
                        <ArrowUp className="w-3 h-3" />
                        上移
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => handleMoveProduct(index, 'down')}
                        disabled={index === products.length - 1 || isLoading}
                        title="下移"
                      >
                        <ArrowDown className="w-3 h-3" />
                        下移
                      </Button>
                    </div>
                  )}
                  
                  {/* 在具体分类时显示提示 */}
                  {selectedCategory !== 'all' && (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 text-center">
                      💡 输入数字设置顺序，1=最前
                    </div>
                  )}
                  
                  {/* 编辑和删除按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="w-4 h-4" />
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </Button>
                  </div>
                  
                  {product.images && product.images.length > 1 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {product.images.length} 张图片
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 分页控件 */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              上一页
            </Button>
            
            <div className="flex items-center gap-1">
              {/* 第一页 */}
              {currentPage > 3 && (
                <>
                  <Button
                    variant={currentPage === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    className="w-10"
                  >
                    1
                  </Button>
                  {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                </>
              )}
              
              {/* 当前页附近的页码 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === currentPage || 
                         page === currentPage - 1 || 
                         page === currentPage + 1 ||
                         page === currentPage - 2 ||
                         page === currentPage + 2;
                })
                .map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              
              {/* 最后一页 */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className="w-10"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              下一页
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <span className="ml-4 text-sm text-gray-600">
              第 {currentPage} / {totalPages} 页
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

