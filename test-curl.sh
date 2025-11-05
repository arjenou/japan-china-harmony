#!/bin/bash

# curl 测试脚本 - 简化版
# 使用方法: ./test-curl.sh [API_URL]

echo "🧪 使用 curl 测试联系表单 API"
echo "================================"
echo ""

# API 端点
API_URL="${1:-http://localhost:3000/api/contact}"

echo "📍 测试端点: $API_URL"
echo ""

# 测试数据
echo "📤 发送测试数据..."
echo ""

# 执行 curl 请求
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -w "\n\n📊 HTTP 状态码: %{http_code}\n⏱️  响应时间: %{time_total}s\n" \
  -d '{
    "name": "curl测试用户",
    "email": "curltest@example.com",
    "company": "curl测试公司",
    "message": "这是通过 curl 命令发送的测试消息。\n\n测试时间: '"$(date '+%Y-%m-%d %H:%M:%S')"'"
  }'

echo ""
echo "================================"
echo ""
echo "✅ 如果看到 {\"success\": true}，表示发送成功！"
echo "📧 请检查以下邮箱:"
echo "   - eikoyang@mono-grp.com.cn (管理员通知)"
echo "   - curltest@example.com (自动回复 - 如果是真实邮箱)"
echo ""

