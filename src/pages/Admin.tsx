import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = 'https://yingwu-admin.wangyunjie1101.workers.dev';

const categories = [
  '瑜伽服',
  '瑜伽器具',
  '运动休闲类',
  '功能性服装',
  '包类',
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
}

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    features: '',
    folder: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const url = selectedCategory && selectedCategory !== 'all'
        ? `${API_BASE_URL}/api/products?category=${encodeURIComponent(selectedCategory)}`
        : `${API_BASE_URL}/api/products`;
      
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data.products || []);
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

      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          formDataToSend.append('images', selectedFiles[i]);
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
        setIsDialogOpen(false);
        resetForm();
        fetchProducts();
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
        toast({
          title: '成功',
          description: '商品删除成功',
        });
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
        toast({
          title: '成功',
          description: '图片删除成功',
        });
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

  const resetForm = () => {
    setFormData({ name: '', category: '', features: '', folder: '' });
    setSelectedFiles(null);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      features: product.features || '',
      folder: product.folder
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
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

                <div>
                  <Label htmlFor="images">商品图片 {!editingProduct && '*'}</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {editingProduct ? '选择文件以添加新图片' : '可选择多张图片'}
                  </p>
                </div>

                {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                  <div>
                    <Label>当前图片</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {editingProduct.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={`${API_BASE_URL}/api/images/${img}`}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteImage(editingProduct.id, img)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? '处理中...' : editingProduct ? '更新商品' : '创建商品'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleDialogClose(false)}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Label>筛选分类</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-gray-100">
                  {product.image ? (
                    <img
                      src={`${API_BASE_URL}/api/images/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
                    {product.category}
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.features && (
                    <CardDescription className="line-clamp-2">
                      {product.features}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
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
      </div>
    </div>
  );
}

