#!/bin/bash
# starts the stand-in services and the app server for tests
cd "$(dirname "$0")/../.."
pkill -f "tools/test/mock.mjs" 2>/dev/null; pkill -f "tools/dev_server.mjs" 2>/dev/null; sleep 0.5
node tools/test/mock.mjs > /tmp/sprout_mock.log 2>&1 &
export PLAID_CLIENT_ID=test-client PLAID_SECRET=test-secret PLAID_ENV=sandbox PLAID_BASE_URL=http://127.0.0.1:4010/plaid
export ANTHROPIC_API_KEY=test-key ANTHROPIC_BASE_URL=http://127.0.0.1:4010/anthropic
export KV_REST_API_URL=http://127.0.0.1:4010/kv KV_REST_API_TOKEN=kvtoken
export ENCRYPTION_KEY=test-encryption-key-0123456789abcdef
export PUSH_TEST_HOST=http://127.0.0.1:4010 CRON_SECRET=test-cron-secret
export ACCESS_CODES="owner-code-1234:owner:nick,free-code-5678:free:nick,plus-code-9999:plus:amy"
export AI_MONTHLY_BUDGET_USD=${AI_MONTHLY_BUDGET_USD:-15}
node tools/dev_server.mjs > /tmp/sprout_dev.log 2>&1 &
wait
