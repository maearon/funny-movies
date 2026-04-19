#!/bin/bash
set -e

echo "🔧 Prepare database..."
bundle exec bin/rails db:prepare # db:create + db:migrate

echo "🌱 Seed data..."
# bundle exec bin/rails db:seed

echo "🧹 Delete the old server.pid file if it exist..."
rm -f /app/tmp/pids/server.pid

# echo "🧹 Delete old credentials if they exist..."
# rm -f config/credentials.yml.enc config/master.key

# echo "🗝️ Create new credentials..."
# rails credentials:edit <<< $'EDITOR="true"' # Do not open editor, avoid hanging EDITOR=true rails credentials:edit

# echo "🔒 Write default content to credentials..."
# echo "secret_key_base: $(rails secret)" > tmp/credentials.yml
# EDITOR="true" rails credentials:edit < tmp/credentials.yml
# rm tmp/credentials.yml

echo "🚀 Start the Rails server..."
exec "$@"