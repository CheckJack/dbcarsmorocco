#!/bin/bash
# Complete Dependency Deletion Diagnostic Script
# READ-ONLY - This script only checks and reports, it does NOT modify or delete anything

echo "=========================================="
echo "🔍 DEPENDENCY DELETION DIAGNOSTIC"
echo "=========================================="
echo ""

PROJECT_ROOT="/Users/tiagocordeiro/Desktop/DBLUXCARSWEB"
FRONTEND_DIR="$PROJECT_ROOT/dbcars/frontend"
BACKEND_DIR="$PROJECT_ROOT/dbcars/backend"

# 1. Check node_modules existence
echo "1️⃣  CHECKING NODE_MODULES..."
echo "----------------------------------------"
if [ -d "$FRONTEND_DIR/node_modules" ]; then
    FRONTEND_COUNT=$(find "$FRONTEND_DIR/node_modules" -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ Frontend node_modules EXISTS ($FRONTEND_COUNT top-level packages)"
    FRONTEND_SIZE=$(du -sh "$FRONTEND_DIR/node_modules" 2>/dev/null | cut -f1)
    echo "   Size: $FRONTEND_SIZE"
else
    echo "❌ Frontend node_modules MISSING!"
fi

if [ -d "$BACKEND_DIR/node_modules" ]; then
    BACKEND_COUNT=$(find "$BACKEND_DIR/node_modules" -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ Backend node_modules EXISTS ($BACKEND_COUNT top-level packages)"
    BACKEND_SIZE=$(du -sh "$BACKEND_DIR/node_modules" 2>/dev/null | cut -f1)
    echo "   Size: $BACKEND_SIZE"
else
    echo "❌ Backend node_modules MISSING!"
fi
echo ""

# 2. Check package-lock.json files
echo "2️⃣  CHECKING PACKAGE-LOCK.JSON FILES..."
echo "----------------------------------------"
LOCK_FILES=$(find "$PROJECT_ROOT" -name "package-lock.json" -type f 2>/dev/null)
if [ -z "$LOCK_FILES" ]; then
    echo "⚠️  No package-lock.json files found"
else
    echo "Found package-lock.json files:"
    echo "$LOCK_FILES" | while read -r file; do
        REL_PATH=$(echo "$file" | sed "s|$PROJECT_ROOT/||")
        if [ -f "$file" ]; then
            SIZE=$(ls -lh "$file" 2>/dev/null | awk '{print $5}')
            echo "   📄 $REL_PATH ($SIZE)"
            
            # Check if it's empty or problematic
            if [ -s "$file" ]; then
                # Check if it has packages
                if grep -q '"packages"' "$file" 2>/dev/null; then
                    PACKAGE_COUNT=$(grep -c '"":' "$file" 2>/dev/null || echo "0")
                    if [ "$PACKAGE_COUNT" -gt 0 ]; then
                        echo "      ⚠️  Contains $PACKAGE_COUNT package entries"
                    fi
                fi
            else
                echo "      ⚠️  File is empty!"
            fi
        fi
    done
fi
echo ""

# 3. Check for package.json files
echo "3️⃣  CHECKING PACKAGE.JSON FILES..."
echo "----------------------------------------"
PKG_FILES=$(find "$PROJECT_ROOT" -name "package.json" -type f 2>/dev/null)
if [ -z "$PKG_FILES" ]; then
    echo "❌ No package.json files found!"
else
    echo "Found package.json files:"
    echo "$PKG_FILES" | while read -r file; do
        REL_PATH=$(echo "$file" | sed "s|$PROJECT_ROOT/||")
        if [ -f "$file" ]; then
            NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$file" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
            echo "   📦 $REL_PATH (name: $NAME)"
        fi
    done
fi
echo ""

# 4. Check for IDE configuration files
echo "4️⃣  CHECKING IDE CONFIGURATION FILES..."
echo "----------------------------------------"
IDE_DIRS=$(find "$PROJECT_ROOT" -type d \( -name ".vscode" -o -name ".cursor" -o -name ".idea" \) 2>/dev/null)
if [ -z "$IDE_DIRS" ]; then
    echo "ℹ️  No IDE config directories found (.vscode, .cursor, .idea)"
else
    echo "Found IDE config directories:"
    echo "$IDE_DIRS" | while read -r dir; do
        REL_PATH=$(echo "$dir" | sed "s|$PROJECT_ROOT/||")
        echo "   📁 $REL_PATH"
        if [ -f "$dir/settings.json" ]; then
            echo "      ⚠️  Contains settings.json - checking for problematic settings..."
            if grep -q "files.exclude.*node_modules" "$dir/settings.json" 2>/dev/null; then
                echo "      ❌ Found 'files.exclude' with node_modules!"
            fi
            if grep -q "files.watcherExclude.*node_modules" "$dir/settings.json" 2>/dev/null; then
                echo "      ℹ️  Found 'files.watcherExclude' with node_modules (this is OK)"
            fi
        fi
    done
fi
echo ""

# 5. Check npm configuration
echo "5️⃣  CHECKING NPM CONFIGURATION..."
echo "----------------------------------------"
if command -v npm &> /dev/null; then
    echo "NPM version: $(npm --version)"
    echo ""
    echo "Global npm config:"
    npm config list --global 2>/dev/null | grep -E "(prefix|cache|registry)" | head -5 || echo "   (no relevant settings)"
    echo ""
    echo "Local npm config:"
    cd "$FRONTEND_DIR" 2>/dev/null
    npm config list 2>/dev/null | grep -E "(prefix|cache|registry)" | head -5 || echo "   (no relevant settings)"
    echo ""
    
    # Check for .npmrc files
    NPMRC_FILES=$(find "$PROJECT_ROOT" -name ".npmrc" -type f 2>/dev/null)
    if [ -n "$NPMRC_FILES" ]; then
        echo "Found .npmrc files:"
        echo "$NPMRC_FILES" | while read -r file; do
            REL_PATH=$(echo "$file" | sed "s|$PROJECT_ROOT/||")
            echo "   📄 $REL_PATH"
            cat "$file" | sed 's/^/      /'
        done
    else
        echo "ℹ️  No .npmrc files found"
    fi
else
    echo "❌ npm command not found!"
fi
echo ""

# 6. Check for running node/npm processes
echo "6️⃣  CHECKING RUNNING NODE/NPM PROCESSES..."
echo "----------------------------------------"
NODE_PROCS=$(ps aux | grep -E "node|npm|next" | grep -v grep | grep -v "grep" 2>/dev/null)
if [ -z "$NODE_PROCS" ]; then
    echo "ℹ️  No node/npm/next processes currently running"
else
    echo "Found running processes:"
    echo "$NODE_PROCS" | head -10 | while read -r line; do
        PID=$(echo "$line" | awk '{print $2}')
        CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}')
        echo "   🔄 PID $PID: $CMD"
    done
fi
echo ""

# 7. Check file permissions
echo "7️⃣  CHECKING FILE PERMISSIONS..."
echo "----------------------------------------"
if [ -d "$FRONTEND_DIR/node_modules" ]; then
    PERMS=$(ls -ld "$FRONTEND_DIR/node_modules" 2>/dev/null | awk '{print $1, $3, $4}')
    echo "Frontend node_modules permissions: $PERMS"
    
    # Check if writable
    if [ -w "$FRONTEND_DIR/node_modules" ]; then
        echo "   ✅ Directory is writable"
    else
        echo "   ⚠️  Directory is NOT writable (might cause issues)"
    fi
else
    echo "❌ Frontend node_modules doesn't exist to check permissions"
fi
echo ""

# 8. Check startup script
echo "8️⃣  CHECKING STARTUP SCRIPT..."
echo "----------------------------------------"
STARTUP_SCRIPT="$PROJECT_ROOT/start-dev.sh"
if [ -f "$STARTUP_SCRIPT" ]; then
    echo "✅ Startup script exists: start-dev.sh"
    
    # Check if it checks for node_modules
    if grep -q "node_modules" "$STARTUP_SCRIPT"; then
        if grep -q "if.*!.*-d.*node_modules" "$STARTUP_SCRIPT"; then
            echo "   ✅ Script checks for node_modules before starting"
        else
            echo "   ⚠️  Script mentions node_modules but doesn't check for it"
        fi
    else
        echo "   ❌ Script does NOT check for node_modules"
        echo "   ⚠️  This is a problem - script should check before starting!"
    fi
else
    echo "❌ Startup script not found!"
fi
echo ""

# 9. Check for git hooks
echo "9️⃣  CHECKING GIT HOOKS..."
echo "----------------------------------------"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
if [ -d "$GIT_HOOKS_DIR" ]; then
    HOOKS=$(find "$GIT_HOOKS_DIR" -type f -executable 2>/dev/null | grep -v ".sample")
    if [ -z "$HOOKS" ]; then
        echo "ℹ️  No custom git hooks found"
    else
        echo "Found git hooks:"
        echo "$HOOKS" | while read -r hook; do
            HOOK_NAME=$(basename "$hook")
            echo "   📜 $HOOK_NAME"
            if grep -qi "rm.*node_modules\|delete.*node_modules\|clean" "$hook" 2>/dev/null; then
                echo "      ⚠️  Hook contains commands that might affect node_modules!"
            fi
        done
    fi
else
    echo "ℹ️  .git directory not found or not accessible"
fi
echo ""

# 10. Check for workspace files
echo "🔟 CHECKING WORKSPACE FILES..."
echo "----------------------------------------"
WORKSPACE_FILES=$(find "$PROJECT_ROOT" -name "*.code-workspace" -o -name ".cursorrules" 2>/dev/null)
if [ -z "$WORKSPACE_FILES" ]; then
    echo "ℹ️  No workspace files found"
else
    echo "Found workspace files:"
    echo "$WORKSPACE_FILES" | while read -r file; do
        REL_PATH=$(echo "$file" | sed "s|$PROJECT_ROOT/||")
        echo "   📄 $REL_PATH"
    done
fi
echo ""

# 11. Check Next.js cache
echo "1️⃣1️⃣  CHECKING NEXT.JS CACHE..."
echo "----------------------------------------"
if [ -d "$FRONTEND_DIR/.next" ]; then
    NEXT_SIZE=$(du -sh "$FRONTEND_DIR/.next" 2>/dev/null | cut -f1)
    echo "✅ Next.js cache exists (.next directory, size: $NEXT_SIZE)"
else
    echo "ℹ️  No Next.js cache found (.next directory doesn't exist)"
fi
echo ""

# 12. Summary and recommendations
echo "=========================================="
echo "📊 DIAGNOSTIC SUMMARY"
echo "=========================================="
echo ""

ISSUES_FOUND=0

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "❌ CRITICAL: Frontend node_modules is missing!"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

LOCK_COUNT=$(find "$PROJECT_ROOT" -name "package-lock.json" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$LOCK_COUNT" -gt 2 ]; then
    echo "⚠️  WARNING: Found $LOCK_COUNT package-lock.json files (expected: 2)"
    echo "   Multiple lock files can cause npm workspace confusion"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if ! grep -q "if.*!.*-d.*node_modules" "$STARTUP_SCRIPT" 2>/dev/null; then
    echo "⚠️  WARNING: Startup script doesn't check for node_modules"
    echo "   Script should install dependencies if missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo "✅ No obvious issues found in configuration"
    echo ""
    echo "💡 If dependencies are still being deleted, possible causes:"
    echo "   1. IDE extension with aggressive cleanup"
    echo "   2. File sync tool (Dropbox, iCloud, etc.)"
    echo "   3. Running npm commands from wrong directory"
    echo "   4. System-level cleanup script"
else
    echo ""
    echo "🔧 RECOMMENDED FIXES:"
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        echo "   1. Run: cd $FRONTEND_DIR && npm install"
    fi
    if [ "$LOCK_COUNT" -gt 2 ]; then
        echo "   2. Remove extra package-lock.json files from root and dbcars directories"
    fi
    if ! grep -q "if.*!.*-d.*node_modules" "$STARTUP_SCRIPT" 2>/dev/null; then
        echo "   3. Update start-dev.sh to check for node_modules before starting"
    fi
fi

echo ""
echo "=========================================="
echo "✅ Diagnostic complete!"
echo "=========================================="
echo ""
echo "⚠️  NOTE: This script is READ-ONLY and did not modify or delete any files."

