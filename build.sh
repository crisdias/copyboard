#!/bin/bash

# Build script for Copyboard extension
# Generates dist/firefox/ (MV2) and dist/chrome/ (MV3 with Side Panel)

set -e

DIST_DIR="dist"
FIREFOX_DIR="$DIST_DIR/firefox"
CHROME_DIR="$DIST_DIR/chrome"

echo "📦 Building Copyboard extension..."

# Clean previous builds
rm -rf "$DIST_DIR"
mkdir -p "$FIREFOX_DIR" "$CHROME_DIR"

# --- Firefox (MV2, sidebar_action) ---
echo "🦊 Building Firefox version..."
cp -r sidebar icons "$FIREFOX_DIR/"
cp background.js "$FIREFOX_DIR/"
cp manifest.json "$FIREFOX_DIR/manifest.json"

# --- Chrome/Edge (MV3, side_panel) ---
echo "🌐 Building Chrome/Edge version..."
cp -r sidebar icons "$CHROME_DIR/"
cp browser-polyfill.js background-chrome.js "$CHROME_DIR/"

# Inject polyfill into sidebar.html for Chrome
sed -i 's|<script src="sidebar.js"></script>|<script src="../browser-polyfill.js"></script>\n  <script src="sidebar.js"></script>|' "$CHROME_DIR/sidebar/sidebar.html"

# Generate MV3 manifest for Chrome/Edge
node -e "
const m = require('./manifest.json');

// Upgrade to Manifest V3
m.manifest_version = 3;

// Remove Firefox-only keys
delete m.browser_specific_settings;
delete m.sidebar_action;
delete m.developer;

// MV3: action replaces browser_action
m.action = {
  default_icon: m.browser_action.default_icon,
  default_title: m.browser_action.default_title
};
delete m.browser_action;

// MV3: service worker replaces background scripts
m.background = { service_worker: 'background-chrome.js' };

// MV3: clipboardWrite is not a valid permission, remove it
m.permissions = m.permissions.filter(p => p !== 'clipboardWrite');

// Side Panel API (Chrome + Edge)
m.side_panel = { default_path: 'sidebar/sidebar.html' };
m.edge_side_panel = { default_path: 'sidebar/sidebar.html', preferred_width: 380 };
m.permissions.push('sidePanel');

console.log(JSON.stringify(m, null, 2));
" > "$CHROME_DIR/manifest.json"

echo ""
echo "✅ Build complete!"
echo "   dist/firefox/  — load in about:debugging or package with web-ext"
echo "   dist/chrome/   — load in chrome://extensions or edge://extensions (Developer mode)"
