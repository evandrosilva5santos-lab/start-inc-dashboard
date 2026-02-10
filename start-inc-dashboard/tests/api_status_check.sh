#!/bin/bash

# Simple API Health Check
# Usage: ./api_status_check.sh [base_url]

BASE_URL="${1:-http://localhost:3000}"
API_ENDPOINT="$BASE_URL/api/agents"

echo "🔍 Checking API Health: $API_ENDPOINT"

response=$(curl -s -o /dev/null -w "%{http_code}" "$API_ENDPOINT")

if [ "$response" -eq 200 ]; then
  echo "✅ API is ONLINE and returning 200 OK."
  exit 0
else
  echo "❌ API Failure! Status Code: $response"
  exit 1
fi
