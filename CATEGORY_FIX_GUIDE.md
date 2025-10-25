# 分类修复指南

## 问题说明

之前管理后台使用的是**中文分类**，而前端和后端使用的是**日语分类**，导致：
- 用中文分类上传的商品在前端筛选时显示为空白
- 分类不匹配，查询不到数据

## 解决方案

已将管理后台的分类统一改为日语，但数据库中已有的商品需要更新分类名称。

### 分类对应表

| 中文分类 | 日语分类 |
|---------|---------|
| 瑜伽服 | ヨガウェア |
| 瑜伽器具 | ヨガ用具 |
| 运动休闲类 | スポーツ・レジャー |
| 功能性服装 | 機能性ウェア |
| 包类 | バッグ類 |
| 軍手と手袋 | 軍手と手袋 |
| 雑貨類 | 雑貨類 |
| アニメ類 | アニメ類 |

## 修复步骤

### 方法一：使用 Wrangler CLI（推荐）

1. 进入 workers 目录：
```bash
cd workers
```

2. 执行 SQL 脚本修复分类：
```bash
npx wrangler d1 execute japan-china-harmony-db --file=./scripts/fix-categories.sql
```

3. 验证修复结果：
```bash
npx wrangler d1 execute japan-china-harmony-db --command="SELECT category, COUNT(*) as count FROM products GROUP BY category"
```

### 方法二：使用 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers & Pages → D1
3. 选择你的数据库 `japan-china-harmony-db`
4. 在 Console 中逐条执行以下 SQL：

```sql
UPDATE products SET category = 'ヨガウェア' WHERE category = '瑜伽服';
UPDATE products SET category = 'ヨガ用具' WHERE category = '瑜伽器具';
UPDATE products SET category = 'スポーツ・レジャー' WHERE category = '运动休闲类';
UPDATE products SET category = '機能性ウェア' WHERE category = '功能性服装';
UPDATE products SET category = 'バッグ類' WHERE category = '包类';
```

5. 查看结果：
```sql
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;
```

### 方法三：在管理后台重新编辑

如果商品不多，也可以直接在管理后台：
1. 打开每个使用中文分类的商品
2. 点击"编辑"
3. 从下拉框中重新选择日语分类
4. 保存

## 验证修复

修复完成后：
1. 刷新前端页面
2. 点击各个分类按钮
3. 应该能正常显示商品了

## 后续注意事项

✅ 现在管理后台已统一使用日语分类
✅ 新上传的商品会自动使用日语分类
✅ 前端和后端分类保持一致

---

**提示**：建议使用方法一（Wrangler CLI），最快速方便！

