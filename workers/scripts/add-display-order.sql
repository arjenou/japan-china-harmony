-- 添加产品显示顺序字段
-- 为products表添加display_order字段，用于自定义产品显示顺序

-- 1. 添加display_order字段（如果不存在）
ALTER TABLE products ADD COLUMN display_order INTEGER DEFAULT 0;

-- 2. 为现有产品设置默认顺序（使用ID作为默认顺序）
UPDATE products SET display_order = id WHERE display_order = 0;

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);

-- 查看结果
SELECT id, name, category, display_order, created_at FROM products ORDER BY display_order;

