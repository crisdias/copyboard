# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Copyboard is a Firefox sidebar extension for managing quick notes in a post-it style interface. It uses Manifest V2 WebExtensions API and is Firefox-only (uses the sidebar API not available in Chromium browsers).

**Interface Language**: All UI text is in English.

## Development Commands

```bash
# Load extension for development
# 1. Open Firefox and navigate to about:debugging#/runtime/this-firefox
# 2. Click "Load Temporary Add-on"
# 3. Select manifest.json

# Package for Mozilla Add-ons submission (requires web-ext CLI)
./package.sh
```

## Architecture

The extension has a minimal architecture with no build step:

- **background.js**: Single responsibility - opens sidebar when toolbar button is clicked
- **sidebar/sidebar.js**: All application logic including:
  - Notes state management (in-memory `notes` array synced to `browser.storage.local`)
  - CRUD operations for notes
  - Drag-and-drop reordering
  - Clipboard operations via `navigator.clipboard`
  - DOM rendering (no framework, vanilla JS)
- **sidebar/sidebar.css**: Styling with CSS custom properties for theming, includes automatic dark mode via `prefers-color-scheme`

## Key Implementation Details

- Notes are stored as objects with `{id, content, createdAt}` structure
- Note IDs are generated using `Date.now().toString(36) + Math.random().toString(36).substr(2)`
- Storage uses Firefox's `browser.storage.local` API (not localStorage)
- HTML escaping uses DOM-based approach (`div.textContent = text; return div.innerHTML`)
- Minimum Firefox version: 58.0
