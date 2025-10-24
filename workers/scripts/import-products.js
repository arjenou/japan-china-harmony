/**
 * 导入现有产品数据到 Cloudflare Workers
 * 
 * 使用方法:
 * node scripts/import-products.js
 */

const fs = require('fs');
const path = require('path');

// 从 src/data/products.ts 读取现有产品数据
const productsFilePath = path.join(__dirname, '../../src/data/products.ts');

// 映射类别（中文 -> 日语）
const categoryMap = {
  '瑜伽服': 'ヨガウェア',
  '瑜伽器具': 'ヨガ用具',
  '运动休闲类': 'スポーツ・レジャー',
  '功能性服装': '機能性ウェア',
  '包类': 'バッグ類',
  '軍手と手袋': '軍手と手袋',
  '雑貨類': '雑貨類',
  'アニメ類': 'アニメ類'
};

// 产品特征映射（日语）
const defaultFeatures = {
  'ヨガウェア': '高品質な素材を使用\n快適な着心地\nヨガに最適な伸縮性\nOEM/ODM対応可能',
  'ヨガ用具': '高品質な素材を使用\n実用性と耐久性を兼ね備えた設計\nヨガ練習に最適\nOEM/ODM対応可能',
  'スポーツ・レジャー': '高品質な素材を使用\n快適な着心地\nスポーツ・レジャーに最適\nOEM/ODM対応可能',
  '機能性ウェア': '高品質な素材を使用\n快適な着心地\n機能性に優れた設計\nOEM/ODM対応可能',
  'バッグ類': '高品質な素材を使用\n実用性と耐久性を兼ね備えた設計\n日常使いに最適\nOEM/ODM対応可能',
  '雑貨類': '高品質な素材を使用\n実用性と耐久性を兼ね備えた設計\n日常使いに最適\nOEM/ODM対応可能',
  '軍手と手袋': '高品質な素材を使用\n実用性と耐久性を兼ね備えた設計\n作業に最適\nOEM/ODM対応可能',
  'アニメ類': '高品質な素材を使用\n人気キャラクター商品\nファンに最適\nOEM/ODM対応可能'
};

// 生成 SQL 插入语句
function generateSQL() {
  const productsContent = fs.readFileSync(productsFilePath, 'utf-8');
  
  // 简单解析（实际使用时可能需要更复杂的解析）
  const productMatches = productsContent.match(/\{[^}]+\}/gs);
  
  if (!productMatches) {
    console.error('无法解析产品数据');
    return;
  }

  let insertStatements = [];
  let imageStatements = [];
  
  productMatches.forEach((match, index) => {
    // 提取字段
    const nameMatch = match.match(/name:\s*"([^"]+)"/);
    const categoryMatch = match.match(/category:\s*"([^"]+)"/);
    const folderMatch = match.match(/folder:\s*"([^"]+)"/);
    const imageMatch = match.match(/image:\s*"([^"]+)"/);
    const imagesMatch = match.match(/images:\s*\[([^\]]+)\]/);
    
    if (!nameMatch || !categoryMatch) return;
    
    const productId = index + 1;
    const name = nameMatch[1];
    const originalCategory = categoryMatch[1];
    const category = categoryMap[originalCategory] || originalCategory;
    const folder = folderMatch ? folderMatch[1] : name.replace(/[^a-zA-Z0-9]/g, '_');
    const mainImage = imageMatch ? imageMatch[1].replace('/Goods/zahuo/', '') : '';
    const features = defaultFeatures[category] || '高品質な素材を使用\n実用性と耐久性を兼ね備えた設計';
    
    // 插入产品
    insertStatements.push(
      `INSERT INTO products (id, name, category, folder, image, features) VALUES (${productId}, '${name.replace(/'/g, "''")}', '${category}', '${folder}', '${mainImage}', '${features.replace(/\n/g, '\\n')}');`
    );
    
    // 插入图片
    if (imagesMatch) {
      const images = imagesMatch[1].match(/"([^"]+)"/g) || [];
      images.forEach((img, imgIndex) => {
        const cleanImg = img.replace(/"/g, '').trim();
        imageStatements.push(
          `INSERT INTO product_images (product_id, image_url, display_order) VALUES (${productId}, '${folder}/${cleanImg}', ${imgIndex});`
        );
      });
    }
  });
  
  const sql = `
-- 导入现有产品数据
-- 生成时间: ${new Date().toISOString()}

-- 清空现有数据（可选，谨慎使用）
-- DELETE FROM product_images;
-- DELETE FROM products;

-- 插入产品
${insertStatements.join('\n')}

-- 插入图片
${imageStatements.join('\n')}

-- 查询结果
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as image_count FROM product_images;
`;

  return sql;
}

// 生成 SQL 文件
const sql = generateSQL();
if (sql) {
  const outputPath = path.join(__dirname, '../import-data.sql');
  fs.writeFileSync(outputPath, sql);
  console.log('✅ SQL 文件已生成:', outputPath);
  console.log('\n执行导入:');
  console.log('  本地: wrangler d1 execute yingwu_products --file=./import-data.sql');
  console.log('  生产: wrangler d1 execute yingwu_products --file=./import-data.sql --remote');
} else {
  console.error('❌ 生成失败');
}

