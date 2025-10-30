/**
 * 批量上传现有图片到 R2
 * 
 * 使用方法:
 * node scripts/upload-images.js
 * 
 * 需要先安装依赖: npm install --save-dev glob
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// 公共图片目录
const PUBLIC_DIR = path.join(__dirname, '../../public/Goods/zahuo');

// R2 存储桶名称
const BUCKET_NAME = 'yingwu-images';

// 查找所有图片文件
console.log('🔍 查找图片文件...\n');

const imageFiles = glob.sync(`${PUBLIC_DIR}/**/*.{jpg,jpeg,png,webp}`, {
  nodir: true
});

console.log(`找到 ${imageFiles.length} 个图片文件\n`);

// 上传到 R2
let successCount = 0;
let errorCount = 0;

imageFiles.forEach((filePath, index) => {
  // 计算相对路径
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  const key = relativePath.replace(/\\/g, '/'); // Windows 兼容
  
  try {
    console.log(`[${index + 1}/${imageFiles.length}] 上传: ${key}`);
    
    // 使用 wrangler 上传
    execSync(`wrangler r2 object put ${BUCKET_NAME}/${key} --file="${filePath}"`, {
      stdio: 'pipe'
    });
    
    successCount++;
  } catch (error) {
    console.error(`  ❌ 失败: ${error.message}`);
    errorCount++;
  }
});

console.log('\n上传完成:');
console.log(`  ✅ 成功: ${successCount}`);
console.log(`  ❌ 失败: ${errorCount}`);
console.log(`  📊 总计: ${imageFiles.length}`);

// 生成图片映射文件
const imageMap = {};
imageFiles.forEach(filePath => {
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  const key = relativePath.replace(/\\/g, '/');
imageMap[key] = `https://img.mono-grp.com/api/images/${key}`;
});

const mapPath = path.join(__dirname, '../image-map.json');
fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2));
console.log(`\n📄 图片映射已保存到: ${mapPath}`);

