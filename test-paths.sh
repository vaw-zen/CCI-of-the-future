#!/bin/bash
# Test script to verify GitHub Actions paths

echo "🔍 Testing SEO Automation Paths"
echo "Current working directory: $(pwd)"
echo "Contents of scripts directory:"
ls -la scripts/ 2>/dev/null || echo "No scripts directory found"

echo ""
echo "Contents of scripts/workflows directory:"
ls -la scripts/workflows/ 2>/dev/null || echo "No scripts/workflows directory found"

echo ""
echo "Contents of scripts/workflows/seo-automation directory:"
ls -la scripts/workflows/seo-automation/ 2>/dev/null || echo "No scripts/workflows/seo-automation directory found"

echo ""
echo "Checking if target script exists:"
if [ -f "scripts/workflows/seo-automation/simple-seo-analysis.cjs" ]; then
    echo "✅ scripts/workflows/seo-automation/simple-seo-analysis.cjs exists"
else
    echo "❌ scripts/workflows/seo-automation/simple-seo-analysis.cjs NOT found"
fi

echo ""
echo "Checking if old path exists:"
if [ -f "scripts/simple-seo-analysis.cjs" ]; then
    echo "⚠️ scripts/simple-seo-analysis.cjs exists (old path)"
else
    echo "✅ scripts/simple-seo-analysis.cjs NOT found (good)"
fi

echo ""
echo "Environment variables:"
echo "GITHUB_ACTIONS: $GITHUB_ACTIONS"
echo "GITHUB_WORKSPACE: $GITHUB_WORKSPACE"

echo ""
echo "Testing Node.js execution:"
echo "node scripts/workflows/seo-automation/simple-seo-analysis.cjs --version || echo 'Script execution failed'"