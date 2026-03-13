#!/bin/bash

# Package Copyboard extension for distribution

set -e

# Build first
bash "$(dirname "$0")/build.sh"

echo ""
echo "📦 Creating zip packages..."

cd dist
(cd firefox && zip -r ../copyboard-firefox.zip .)
(cd chrome && zip -r ../copyboard-chrome.zip .)
cd ..

echo ""
echo "✅ Packages created:"
echo "   dist/copyboard-firefox.zip"
echo "   dist/copyboard-chrome.zip"
echo ""
echo "📋 Firefox: upload to https://addons.mozilla.org/developers/"
echo "📋 Chrome:  upload to https://chrome.google.com/webstore/devconsole"
