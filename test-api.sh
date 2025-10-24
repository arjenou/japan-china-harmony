#!/bin/bash

echo "🧪 测试 API 连接..."
echo ""

echo "1️⃣ 测试分类列表 API:"
curl -s https://www.mono-grp.com/api/categories | jq . || echo "❌ 失败"
echo ""
echo ""

echo "2️⃣ 测试产品列表 API:"
curl -s https://www.mono-grp.com/api/products | jq . || echo "❌ 失败"
echo ""
echo ""

echo "3️⃣ 测试不带 www 的域名:"
curl -s https://mono-grp.com/api/categories | jq . || echo "❌ 失败"
echo ""
echo ""

echo "✅ 测试完成！"

