# 🔒 Pre-Push Security Checklist

## ✅ BEFORE YOU PUSH - CHECK THESE

### 1. Environment Variables ✅
- [ ] `.env.local` exists in your project folder
- [ ] `.env.local` is listed in `.gitignore`
- [ ] `.env.example` exists (with NO real keys)
- [ ] All API keys are ONLY in `.env.local` (not in any other file)

### 2. Git Ignore ✅
- [ ] `.gitignore` file exists
- [ ] Contains `node_modules/`
- [ ] Contains `.env` and `.env.local`
- [ ] Contains `.next/` and `build/`

### 3. No Secrets in Code ✅
- [ ] Search all files for "r8_SJhmxxBfqX" (your Replicate key) - should only be in `.env.local`
- [ ] Search for "eyJhbGciOiJIUzI1NiIsInR5cCI" (Supabase key) - should only be in `.env.local`
- [ ] No hardcoded API URLs with credentials
- [ ] No passwords or tokens in any `.js` or `.json` files

### 4. Documentation ✅
- [ ] `README.md` exists with setup instructions
- [ ] `.env.example` shows which keys are needed (but no real values)
- [ ] No personal information in README

### 5. Test Git Status ✅
Run this command before pushing:
```bash
git status
```

**Should see:** ✅
- `.gitignore`
- `.env.example`
- `README.md`
- `src/` files
- `api/` files

**Should NOT see:** ❌
- `.env`
- `.env.local`
- `node_modules/`

---

## 🔍 Quick Security Scan

Run these commands to check for secrets:

```bash
# Check if .env is tracked
git ls-files | grep "\.env$"
# (Should return nothing)

# Check for Replicate key
grep -r "r8_" . --exclude-dir=node_modules
# (Should only show .env.local or nothing)

# Check for Supabase key
grep -r "eyJhbGci" . --exclude-dir=node_modules
# (Should only show .env.local or nothing)
```

If any of these show files OTHER than `.env.local`, **DO NOT PUSH** yet!

---

## 🚨 If You Accidentally Exposed Secrets

### 1. Already Pushed?
**IMMEDIATELY**:
1. Go to Replicate → Account → API Tokens → Revoke the token
2. Go to Supabase → Settings → API → Create new keys
3. Update your `.env.local` with new keys
4. Contact GitHub support to remove the commit from history

### 2. Not Pushed Yet?
**FIX IT**:
```bash
# Remove from git tracking
git rm --cached .env
git rm --cached .env.local

# Verify .gitignore has .env
cat .gitignore | grep ".env"

# Re-add files
git add .
git commit -m "Fix: Remove environment files from tracking"
```

---

## ✅ Final Check Before Push

```bash
# 1. Make sure you're on the right directory
pwd

# 2. Check what will be committed
git status

# 3. View the actual files that will be pushed
git diff --cached

# 4. If everything looks good, push!
git push -u origin main
```

---

## 🎯 What Happens After Push

1. **Code is public** on GitHub
2. **Anyone can see** all files you pushed
3. **Secrets in pushed files** cannot be easily removed
4. **Always verify** on GitHub after pushing

---

## ✅ All Checked? Ready to Push!

If you checked all boxes above, follow the instructions in `PUSH_TO_GITHUB.md`

**Remember**: It's better to double-check now than expose secrets later! 🔐