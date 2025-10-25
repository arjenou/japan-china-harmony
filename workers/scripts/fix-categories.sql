-- 修复数据库中的分类名称
-- 将中文分类名转换为日语分类名

-- 更新分类：瑜伽服 → ヨガウェア
UPDATE products SET category = 'ヨガウェア' WHERE category = '瑜伽服';

-- 更新分类：瑜伽器具 → ヨガ用具
UPDATE products SET category = 'ヨガ用具' WHERE category = '瑜伽器具';

-- 更新分类：运动休闲类 → スポーツ・レジャー
UPDATE products SET category = 'スポーツ・レジャー' WHERE category = '运动休闲类';

-- 更新分类：功能性服装 → 機能性ウェア
UPDATE products SET category = '機能性ウェア' WHERE category = '功能性服装';

-- 更新分类：包类 → バッグ類
UPDATE products SET category = 'バッグ類' WHERE category = '包类';

-- 查看更新结果
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;

