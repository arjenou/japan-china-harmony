# 部署图片顺序功能更新指南

## ⚠️ 重要提示

您遇到的 JSON 解析错误是因为后端 API 还没有部署新的图片排序端点。需要重新部署 Cloudflare Workers。

## 🚀 快速部署步骤

### 1. 部署后端 (Cloudflare Workers)

```bash
# 进入 workers 目录
cd workers

# 部署到 Cloudflare
npm run deploy
# 或者
npx wrangler deploy
```

### 2. 构建并部署前端

```bash
# 回到项目根目录
cd ..

# 构建前端
npm run build

# 部署前端（根据你的部署方式）
# 如果使用 Vercel
vercel --prod

# 或者手动上传 dist 目录到你的服务器
```

## 📝 更新说明

### 后端更新
- **新增 API 端点**: `PUT /api/products/:id/images/reorder`
- **功能**: 接收图片 URL 数组，更新图片显示顺序
- **文件**: `workers/src/index.ts`

### 前端更新  
- **新增功能**: 图片上移/下移按钮
- **改进**: 更好的错误处理和用户反馈
- **文件**: `src/pages/Admin.tsx`

## ✅ 验证部署

部署完成后，请验证：

1. **测试 API 端点**
```bash
curl -X PUT https://api.mono-grp.com/api/products/1/images/reorder \
  -H "Content-Type: application/json" \
  -d '{"images": ["image1.jpg", "image2.jpg"]}'
```

2. **在浏览器中测试**
   - 打开商品管理后台
   - 编辑任意商品
   - 尝试点击图片的上移/下移按钮
   - 确认没有错误提示

## 🔍 故障排查

### 如果仍然遇到 JSON 错误

1. **清除浏览器缓存**
   - Chrome: Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
   - 勾选"缓存的图片和文件"
   - 点击"清除数据"

2. **检查 Workers 部署状态**
```bash
cd workers
npx wrangler tail
# 然后在浏览器中触发操作，查看日志
```

3. **验证 API 端点**
   - 打开浏览器开发者工具 (F12)
   - 切换到 Network 标签
   - 尝试移动图片
   - 检查 API 请求和响应

### 常见问题

**Q: 显示 404 错误**
A: Workers 可能没有正确部署，重新运行 `npm run deploy`

**Q: 显示 CORS 错误**
A: 检查 Workers 的 CORS 配置是否正确

**Q: 图片顺序没有保存**
A: 检查数据库连接和 D1 配置

## 📞 需要帮助？

如果遇到问题：
1. 检查 `workers/wrangler.toml` 配置
2. 查看 Cloudflare Dashboard 的 Workers 日志
3. 确认 D1 数据库连接正常

---

**更新日期**: 2025年10月26日

