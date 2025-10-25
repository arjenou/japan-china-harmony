/**
 * 修复数据库中的分类名称
 * 将中文分类名转换为日语分类名
 */

const categoryMapping = {
  '瑜伽服': 'ヨガウェア',
  '瑜伽器具': 'ヨガ用具',
  '运动休闲类': 'スポーツ・レジャー',
  '功能性服装': '機能性ウェア',
  '包类': 'バッグ類',
  // 以下已经是日语，不需要转换
  '軍手と手袋': '軍手と手袋',
  '雑貨類': '雑貨類',
  'アニメ類': 'アニメ類'
};

const CLOUDFLARE_ACCOUNT_ID = 'YOUR_ACCOUNT_ID';
const DATABASE_ID = 'YOUR_DATABASE_ID';
const API_TOKEN = 'YOUR_API_TOKEN';

async function fixCategories() {
  console.log('🔄 开始修复分类名称...\n');

  try {
    // 1. 获取所有商品
    const getResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: 'SELECT id, name, category FROM products',
        }),
      }
    );

    const getData = await getResponse.json();
    
    if (!getData.success) {
      throw new Error('获取商品列表失败: ' + JSON.stringify(getData.errors));
    }

    const products = getData.result[0].results;
    console.log(`📦 找到 ${products.length} 个商品\n`);

    // 2. 更新需要修复的商品
    let updatedCount = 0;
    
    for (const product of products) {
      const oldCategory = product.category;
      const newCategory = categoryMapping[oldCategory];

      // 如果分类需要更新
      if (newCategory && newCategory !== oldCategory) {
        console.log(`🔧 更新商品: ${product.name}`);
        console.log(`   ${oldCategory} → ${newCategory}`);

        const updateResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sql: 'UPDATE products SET category = ? WHERE id = ?',
              params: [newCategory, product.id],
            }),
          }
        );

        const updateData = await updateResponse.json();
        
        if (updateData.success) {
          updatedCount++;
          console.log(`   ✅ 更新成功\n`);
        } else {
          console.log(`   ❌ 更新失败: ${JSON.stringify(updateData.errors)}\n`);
        }
      }
    }

    console.log(`\n✨ 完成！共更新了 ${updatedCount} 个商品的分类`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 运行脚本
fixCategories();

