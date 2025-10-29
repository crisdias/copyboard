#!/bin/bash

# Script to package Copyboard extension for Mozilla Add-ons submission

echo "📦 Packaging Copyboard extension..."

# Build using web-ext
web-ext build --overwrite-dest

echo "✅ Package created in web-ext-artifacts/"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://addons.mozilla.org/developers/"
echo "2. Click 'Submit a New Add-on'"
echo "3. Upload the .zip file from web-ext-artifacts/"
echo ""
echo "Note: Make sure you've updated manifest.json with:"
echo "  - author name"
echo "  - homepage_url"
echo "  - browser_specific_settings.gecko.id"
