#!/bin/bash

# 联系表单 API 测试脚本
# 用于测试邮件发送功能

echo "🧪 测试联系表单 API..."
echo ""

# 设置 API 端点
# 本地测试使用: http://localhost:3000/api/contact
# 生产环境使用: https://你的域名.vercel.app/api/contact
API_URL="${1:-http://localhost:3000/api/contact}"

echo "📍 API 端点: $API_URL"
echo ""

# 测试数据
TEST_DATA='{
  "name": "测试用户",
  "email": "test@example.com",
  "company": "测试公司",
  "message": "这是一个测试消息，用于验证邮件发送功能是否正常工作。\n\n如果您收到这封邮件，说明系统配置成功！"
}'

echo "📤 发送测试数据..."
echo "$TEST_DATA" | jq .
echo ""

# 发送请求
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

# 分离响应体和状态码
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo "📥 响应状态码: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ 测试成功！"
  echo ""
  echo "响应内容:"
  echo "$HTTP_BODY" | jq .
  echo ""
  echo "📧 请检查以下邮箱:"
  echo "  1. eikoyang@mono-grp.com.cn (管理员通知)"
  echo "  2. test@example.com (自动回复)"
else
  echo "❌ 测试失败！"
  echo ""
  echo "响应内容:"
  echo "$HTTP_BODY" | jq .
  echo ""
  echo "🔍 故障排查建议:"
  echo "  1. 检查 Vercel 环境变量是否配置正确"
  echo "  2. 查看 Vercel 函数日志"
  echo "  3. 确认 SMTP 密码是否正确"
  echo "  4. 检查网络连接"
fi

echo ""
echo "📖 更多信息请查看: CONTACT_EMAIL_SETUP.md"

