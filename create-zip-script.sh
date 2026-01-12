#!/bin/bash

# Create ZIP of BookTok Trailer Studio
# Excludes node_modules, dist, .git, and other unnecessary files

echo "📦 Creating BookTok Trailer Studio ZIP..."

# Get current directory name
PROJECT_DIR=$(basename "$PWD")
ZIP_NAME="booktok-trailer-studio-$(date +%Y%m%d).zip"

# Create zip excluding unwanted folders
zip -r "$ZIP_NAME" . \
  -x "node_modules/*" \
  -x "dist/*" \
  -x ".git/*" \
  -x ".next/*" \
  -x "build/*" \
  -x "*.log" \
  -x ".DS_Store" \
  -x ".env" \
  -x ".env.local" \
  -x ".vercel/*" \
  -x "coverage/*" \
  -x ".cache/*"

echo "✅ ZIP created: $ZIP_NAME"
echo "📍 Location: $PWD/$ZIP_NAME"
echo ""
echo "📊 ZIP Contents:"
unzip -l "$ZIP_NAME" | head -20

echo ""
echo "✅ Done! You can now download: $ZIP_NAME"