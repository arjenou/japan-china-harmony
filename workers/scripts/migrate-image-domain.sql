-- 仅影响存有“完整URL”的记录；若字段是纯键值（如 folder/xxx.jpg），则不会改变

-- products.image: 无条件 REPLACE（对不匹配的数据无副作用）
UPDATE products
SET image = REPLACE(
  REPLACE(
    REPLACE(image,
      'https://yingwu-admin.wangyunjie1101.workers.dev/api/images/',
      'https://img.mono-grp.com/api/images/'
    ),
    'https://www.mono-grp.com/api/images/',
    'https://img.mono-grp.com/api/images/'
  ),
  'https://api.mono-grp.com/api/images/',
  'https://img.mono-grp.com/api/images/'
);

-- product_images.image_url: 无条件 REPLACE
UPDATE product_images
SET image_url = REPLACE(
  REPLACE(
    REPLACE(image_url,
      'https://yingwu-admin.wangyunjie1101.workers.dev/api/images/',
      'https://img.mono-grp.com/api/images/'
    ),
    'https://www.mono-grp.com/api/images/',
    'https://img.mono-grp.com/api/images/'
  ),
  'https://api.mono-grp.com/api/images/',
  'https://img.mono-grp.com/api/images/'
);

-- 可选：查看受影响的记录数量（本地执行时观察输出）
-- SELECT COUNT(*) FROM products WHERE image LIKE 'https://img.mono-grp.com/api/images/%';
-- SELECT COUNT(*) FROM product_images WHERE image_url LIKE 'https://img.mono-grp.com/api/images/%';


