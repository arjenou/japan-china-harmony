# 浏览器后退按钮锚点功能

## 功能说明
当用户从产品详情页通过浏览器后退按钮返回首页时，页面会自动滚动到产品区域，并高亮显示之前浏览的产品。

## 实现逻辑

### 1. 用户点击产品（Products.tsx）
```typescript
// 设置标记，表示从产品列表进入详情页
sessionStorage.setItem('shouldScrollToProducts', 'true');
sessionStorage.setItem('lastViewedProductId', product.id.toString());
sessionStorage.setItem('productsState', JSON.stringify(currentState));
```

### 2. 路由变化时（App.tsx - ScrollToTop）
```typescript
// 检测到标记时，不执行默认的滚动到顶部操作
if (shouldScrollToProducts === 'true') {
  return; // 让 Index.tsx 处理滚动
}
```

### 3. 首页加载时（Index.tsx）
```typescript
// 检测标记并滚动到产品区域
if (shouldScrollToProducts === 'true') {
  // 清除标记
  sessionStorage.removeItem('shouldScrollToProducts');
  
  // 延迟滚动，确保页面完全渲染
  requestAnimationFrame(() => {
    setTimeout(() => {
      // 滚动到产品区域（带 80px 偏移量避免被导航栏遮挡）
      const productsElement = document.getElementById('products');
      if (productsElement) {
        window.scrollTo({
          top: productsElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    }, 300);
  });
}
```

### 4. 产品高亮（Products.tsx）
```typescript
// 找到之前浏览的产品并高亮显示 2 秒
const productElement = document.getElementById(`product-${lastProductId}`);
if (productElement) {
  productElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
  setTimeout(() => {
    productElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
  }, 2000);
}
```

## 测试步骤

1. **打开首页** - http://localhost:8080/
2. **滚动到产品区域** - 可以看到产品列表
3. **点击任意产品** - 进入产品详情页
4. **点击浏览器后退按钮** - 返回首页
5. **验证结果**：
   - ✅ 页面应该自动滚动到产品区域（而不是停留在顶部 banner）
   - ✅ 之前点击的产品应该有蓝色高亮边框（持续 2 秒）
   - ✅ 保持之前的分类、搜索和分页状态

## 相关文件

- `src/pages/Index.tsx` - 首页组件，处理滚动到产品区域
- `src/components/Products.tsx` - 产品列表组件，设置标记和产品高亮
- `src/App.tsx` - 路由配置，禁用默认滚动行为

## 技术细节

### 为什么使用 requestAnimationFrame + setTimeout？

```typescript
requestAnimationFrame(() => {
  setTimeout(() => {
    // 滚动逻辑
  }, 300);
});
```

1. **requestAnimationFrame**: 确保在浏览器下一次重绘前执行
2. **setTimeout(300ms)**: 给页面足够的时间完成渲染（包括产品列表的加载）
3. 这种组合确保滚动在所有内容加载完成后执行

### 为什么禁用浏览器默认的滚动恢复？

```typescript
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
```

浏览器默认会记住用户离开页面时的滚动位置，并在返回时恢复。我们需要禁用这个功能，以便实现自定义的滚动到产品区域的行为。

## 更新日期
2025-10-26

