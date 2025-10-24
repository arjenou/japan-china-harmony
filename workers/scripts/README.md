# 导入脚本说明

本目录包含用于导入现有数据的脚本。

## 脚本列表

### 1. import-products.js

生成 SQL 文件，用于导入现有产品数据到 D1 数据库。

**使用方法：**

```bash
# 1. 生成 SQL 文件
node scripts/import-products.js

# 2. 导入到本地开发环境
wrangler d1 execute yingwu_products --file=./import-data.sql

# 3. 导入到生产环境
wrangler d1 execute yingwu_products --file=./import-data.sql --remote
```

### 2. upload-images.js

批量上传现有图片到 R2 存储。

**前置要求：**

```bash
npm install --save-dev glob
```

**使用方法：**

```bash
# 上传所有图片
node scripts/upload-images.js
```

**注意：** 这个脚本会上传 `public/Goods/zahuo/` 目录下的所有图片。

## 完整导入流程

按照以下步骤导入所有数据：

### 步骤 1: 准备环境

```bash
cd workers
npm install
npm install --save-dev glob
```

### 步骤 2: 创建并初始化数据库

```bash
# 创建数据库
wrangler d1 create yingwu_products

# 更新 wrangler.toml 中的 database_id

# 初始化表结构
npm run db:init
```

### 步骤 3: 创建 R2 存储桶

```bash
wrangler r2 bucket create yingwu-images
wrangler r2 bucket create yingwu-images-preview
```

### 步骤 4: 上传图片

```bash
node scripts/upload-images.js
```

这可能需要几分钟，取决于图片数量。

### 步骤 5: 导入产品数据

```bash
# 生成 SQL
node scripts/import-products.js

# 导入到数据库
wrangler d1 execute yingwu_products --file=./import-data.sql --remote
```

### 步骤 6: 验证

```bash
# 检查产品数量
wrangler d1 execute yingwu_products --command="SELECT COUNT(*) FROM products" --remote

# 检查图片数量
wrangler d1 execute yingwu_products --command="SELECT COUNT(*) FROM product_images" --remote

# 检查 R2 中的文件
wrangler r2 object list yingwu-images --limit 10
```

## 故障排查

### 问题：图片上传失败

**可能原因：**
- Wrangler 未登录
- R2 存储桶不存在
- 文件路径错误

**解决方案：**
```bash
# 重新登录
wrangler login

# 检查存储桶
wrangler r2 bucket list

# 手动上传单个文件测试
wrangler r2 object put yingwu-images/test.jpg --file=/path/to/test.jpg
```

### 问题：SQL 导入失败

**可能原因：**
- 数据库未初始化
- SQL 语法错误
- 特殊字符未转义

**解决方案：**
```bash
# 检查表结构
wrangler d1 execute yingwu_products --command="SELECT name FROM sqlite_master WHERE type='table'" --remote

# 查看生成的 SQL 文件
cat import-data.sql

# 手动执行部分 SQL 测试
wrangler d1 execute yingwu_products --command="SELECT * FROM products LIMIT 1" --remote
```

## 备选方案：手动导入

如果脚本无法使用，可以手动通过管理界面添加产品：

1. 部署 Worker: `npm run deploy`
2. 访问管理界面: `https://your-domain.com/admin`
3. 逐个添加产品

虽然较慢，但更加可靠。

## 注意事项

⚠️ **重要提示：**

1. 导入前请备份现有数据
2. 测试时先在本地环境执行（不加 `--remote`）
3. 图片上传可能需要较长时间
4. 确保图片文件名没有特殊字符
5. 生产环境导入前先在开发环境测试

## 获取帮助

如果遇到问题：
- 查看 Worker 日志: `wrangler tail`
- 检查数据库: `wrangler d1 execute yingwu_products --command="SELECT * FROM products"`
- 查看 R2 内容: `wrangler r2 object list yingwu-images`

