# Known Issues

## Issue #1: Dev Server Hanging / Website Not Loading (RECURRING ISSUE)

**Last Occurrence:** November 19, 2025
**Update:** Workaround implemented - Disabled lazy loading

### Symptoms
- Running `npm run dev` appears to work, but the website doesn't load
- Browser shows infinite loading spinner with "Loading..." text
- **NEW:** Website takes multiple minutes to initially load
- **NEW:** Page loads eventually but has no CSS styling
- **NEW:** Navigation to other pages shows "Loading..." forever and never completes
- No error messages in browser console
- No network calls being made (or extremely slow)
- Vite dev server output shows only `> vite` and nothing else (missing the usual startup message with URL)
- Build commands (`npm run build`) also hang indefinitely
- Even simple commands like `curl http://localhost:5173` hang

### Root Causes

This is actually a **combination of multiple issues** that can occur together:

#### 1. Multiple Vite Dev Servers Running Simultaneously
- Multiple `node` processes running Vite at the same time
- These processes conflict with each other, preventing any of them from working properly
- Can happen if you start the dev server multiple times without killing previous instances

**How to check:**
```bash
ps aux | grep "node.*vite" | grep -v grep
```

**Expected output if problem exists:**
You'll see multiple lines with different PIDs, like:
```
jonathanouyang   26001   7.9  0.2 36102092  18804 s007  R     6:10PM   0:00.72 node /Users/.../vite
jonathanouyang   24445   0.0  0.0 44401028    932 s005  S+    5:59PM   0:01.88 node /Users/.../vite
jonathanouyang   26617   0.0  0.0 33726668   2248 s007  R     6:16PM   0:00.06 node /Users/.../vite
```

#### 2. macOS Extended File Attributes Causing Filesystem Hangs
- **This is the primary recurring issue**
- macOS extended attributes (metadata) on source files can become corrupted or problematic
- When Vite tries to read these files, the read operations hang indefinitely
- This prevents Vite from compiling/bundling the application
- Can affect any file type: `.jsx`, `.js`, `.css`, `.json`, etc.

**How to check for extended attributes:**
```bash
xattr -l path/to/file.jsx
```

**Common attributes that might appear:**
- `com.apple.provenance` - Usually harmless but can cause issues
- `com.apple.quarantine` - Can block file access
- Other custom attributes

**Why this happens:**
- Files downloaded from the internet
- Files copied from external drives
- Files synced via cloud services (iCloud, Dropbox, etc.)
- macOS file system corruption

#### 3. Corrupted Node Modules
- Less common, but `node_modules` can become corrupted
- Usually manifests as the same hanging behavior
- Can happen after interrupted installs or filesystem issues

#### 4. Corrupted package.json
- In severe cases, `package.json` itself can become corrupted
- File appears to have size (e.g., 1.0K) but reading it returns 0 bytes
- This is often related to extended attributes issue
- Prevents npm from running any commands

### Complete Solution (Step by Step)

Follow these steps in order:

#### Step 1: Kill All Vite Processes
```bash
pkill -9 -f "node.*vite"
```

Verify they're gone:
```bash
ps aux | grep "node.*vite" | grep -v grep || echo "All Vite processes killed"
```

#### Step 2: Clear Extended Attributes (MOST IMPORTANT)
This is the primary fix for the recurring issue:

```bash
cd "/path/to/Personal Website"
xattr -cr src/
xattr -cr public/
```

The `-c` flag clears all extended attributes, `-r` makes it recursive.

**Verify attributes are cleared:**
```bash
# Check a previously problematic file
xattr -l src/components/GlowingHeader.css
# Should output nothing if attributes are cleared
```

#### Step 3: Verify package.json is Valid
```bash
cat package.json | wc -c
```

If this returns `0`, your package.json is corrupted. Restore it from git:
```bash
git checkout package.json
```

Verify it's restored:
```bash
cat package.json | wc -c
# Should return a number like 1023
```

#### Step 4: Clear Vite Cache
```bash
rm -rf node_modules/.vite
```

#### Step 5: Reinstall Dependencies (if needed)
Only do this if the issue persists after steps 1-4:

```bash
rm -rf node_modules package-lock.json
npm install
```

#### Step 6: Start Fresh Dev Server
```bash
npm run dev
```

**Expected successful output:**
```
> Jonathan Ouyang's Website@0.0.0 dev
> vite

  VITE v5.4.21  ready in 1406 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Quick Diagnosis Commands

Use these to quickly identify which problem you're facing:

```bash
# 1. Check for multiple Vite processes
ps aux | grep "node.*vite" | grep -v grep

# 2. Check for extended attributes on source files
find src -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.css" \) | head -5 | xargs -I {} sh -c 'echo "=== {} ===" && xattr -l {}'

# 3. Check if package.json is corrupted
cat package.json | wc -c

# 4. Check if Vite dev server is responding
curl -s http://localhost:5173 | head -20
```

### Prevention Tips

1. **Regularly clear extended attributes** on your source files, especially after:
   - Pulling code from git
   - Downloading assets
   - Copying files from external sources

   ```bash
   # Add this to your workflow
   xattr -cr src/ public/
   ```

2. **Always stop dev server properly:**
   - Use `Ctrl+C` in the terminal running the dev server
   - Don't just close the terminal window
   - Check for lingering processes: `ps aux | grep "node.*vite"`

3. **Before starting dev server:**
   ```bash
   # Quick cleanup script
   pkill -9 -f "node.*vite"  # Kill old processes
   xattr -cr src/           # Clear attributes
   npm run dev              # Start fresh
   ```

4. **Create an alias** for quick recovery:
   Add to your `~/.zshrc` or `~/.bashrc`:
   ```bash
   alias fix-vite='pkill -9 -f "node.*vite" && cd "$PWD" && xattr -cr src/ public/ && echo "Fixed! Now run: npm run dev"'
   ```

### Why Removing 3D Assets Didn't Fix It

Initially suspected that large 3D model files (`/models/scene.glb`) were causing the slow loading. However, the actual problem was:
- The 3D model file was already removed (models directory was empty)
- The real issue was extended file attributes preventing ANY files from being read
- This made it seem like the app was loading slowly, but it was actually not loading at all

### Technical Details

**Why extended attributes cause hangs:**
- When Node.js/Vite attempts to read a file with problematic extended attributes, the filesystem operation can block indefinitely
- This is a known issue on macOS with certain extended attributes
- The `xattr -c` command removes all extended attributes, allowing normal file access

**Why multiple Vite processes cause issues:**
- Each Vite instance tries to bind to the same port (5173)
- File watching conflicts occur
- Build cache conflicts
- Only one instance can successfully serve, but all instances consume resources

### Files Most Commonly Affected
Based on this occurrence:
- `src/components/GlowingHeader.css` - Initially timed out when trying to read
- `package.json` - Became corrupted (0 bytes) despite showing 1.0K size
- Any file in `src/` directory can be affected

### Testing the Fix

After applying the solution, verify:

1. **Dev server starts successfully:**
   ```bash
   npm run dev
   ```
   Should see: `VITE v5.4.21 ready in [time]ms`

2. **Website loads in browser:**
   - Navigate to http://localhost:5173/
   - Page should load (not show infinite "Loading...")
   - No console errors

3. **Build works:**
   ```bash
   npm run build
   ```
   Should complete without hanging

### Related Issues

This issue may be related to:
- macOS Gatekeeper quarantine attributes
- Cloud sync services (iCloud, Dropbox) adding metadata
- External drives with different file systems
- Git operations on macOS

### When to Use Each Solution

| Symptom | Solution |
|---------|----------|
| Multiple Vite processes visible | Kill processes (Step 1) |
| Dev server hangs at startup | Clear extended attributes (Step 2) |
| npm commands fail with JSON parse error | Restore package.json (Step 3) |
| Recurring issues after fix | Full reinstall (Steps 4-5) |
| Fresh clone still has issues | Clear attributes immediately (Step 2) |

### Emergency Recovery Script

Save this as `fix-dev-server.sh` in project root:

```bash
#!/bin/bash
echo "🔧 Emergency Dev Server Fix"
echo "=========================="

echo "1. Killing all Vite processes..."
pkill -9 -f "node.*vite"
sleep 1

echo "2. Clearing extended attributes..."
xattr -cr src/ 2>/dev/null || echo "  ⚠️  No src/ directory found"
xattr -cr public/ 2>/dev/null || echo "  ⚠️  No public/ directory found"

echo "3. Checking package.json..."
if [ $(cat package.json | wc -c) -eq 0 ]; then
    echo "  ⚠️  package.json corrupted! Restoring from git..."
    git checkout package.json
fi

echo "4. Clearing Vite cache..."
rm -rf node_modules/.vite

echo ""
echo "✅ Fix complete! Now run: npm run dev"
```

Make it executable:
```bash
chmod +x fix-dev-server.sh
```

Run when needed:
```bash
./fix-dev-server.sh
```

---

**Document Version:** 1.0
**Last Updated:** November 19, 2025
**Status:** Active/Recurring Issue
**Severity:** High (blocks development)
**Time to Fix:** ~2-5 minutes with this guide

---

## WORKAROUND: Disabled Lazy Loading

**Date Implemented:** November 19, 2025

### Problem
The macOS extended attributes (`com.apple.provenance` and `com.apple.decmpfs`) are **extremely persistent** and cannot be reliably removed using standard xattr commands. Even after running `xattr -cr` or `xattr -d`, the attributes remain on files.

These attributes cause:
1. **Slow dynamic imports** - React lazy() components take minutes to load
2. **Missing CSS** - CSS files load very slowly or not at all
3. **Stuck on "Loading..."** - Suspense fallback never resolves

### The Workaround
**Disabled lazy loading in `src/App.jsx`**

Changed from:
```javascript
import { lazy, Suspense } from 'react';
const Highlights = lazy(() => import('./components/Highlights'));
// ... etc
```

To:
```javascript
import Highlights from './components/Highlights';
// ... directly import all components
```

And removed all `<Suspense>` wrappers from routes.

### Impact
- ✅ **Much faster loading** - Components load immediately without dynamic imports
- ✅ **Navigation works** - Can now navigate between pages instantly
- ✅ **CSS loads properly** - Styling appears correctly
- ⚠️ **Larger initial bundle** - All components load upfront instead of on-demand
- ⚠️ **Slightly longer initial load** - But still much faster than with lazy loading + extended attributes

### When to Re-enable Lazy Loading
Only re-enable lazy loading when:
1. You've moved the project off the Desktop (try ~/Developer or ~/Projects)
2. OR You've turned off iCloud sync for the project directory
3. OR You've moved to a case-sensitive filesystem without compression
4. AND Extended attributes no longer persist after removal

### Testing if Attributes Are Fixed
```bash
cd "/Users/jonathanouyang/Desktop/Personal Website"
xattr -cr src/
find src -type f -exec xattr -l {} \; | grep "com.apple"
```

If output is empty (no attributes), you can try re-enabling lazy loading.

### Permanent Solution Options

1. **Move project off Desktop**
   ```bash
   mv "/Users/jonathanouyang/Desktop/Personal Website" ~/Developer/personal-website
   cd ~/Developer/personal-website
   xattr -cr .
   ```

2. **Disable iCloud sync for project**
   - Right-click project folder → "Remove from iCloud"
   - Or move to a folder not synced by iCloud

3. **Clone fresh from git to new location**
   ```bash
   cd ~/Developer
   git clone <your-repo-url> personal-website-fresh
   cd personal-website-fresh
   npm install
   ```

### Why This Happens
- macOS Desktop is often synced with iCloud
- iCloud adds `com.apple.provenance` to track file origins
- APFS filesystem adds `com.apple.decmpfs` for compression
- These attributes are "protected" and resist standard removal attempts
- Extended attributes slow down file I/O operations significantly
- Dynamic imports (used by React.lazy()) are particularly affected

