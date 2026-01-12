# 🚀 BookTok Trailer Studio - Complete Setup Guide

## ✅ STEP 1: Set Up Supabase Database

1. **Go to Supabase**
   - Open: https://epddaluvbtymenxjjxwz.supabase.co
   - Log in with your account

2. **Create Database Table**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy the SQL code from the "Supabase SQL Schema" artifact
   - Paste it and click "Run"
   - You should see "Success. No rows returned"

✅ Database is now ready!

---

## ✅ STEP 2: Download Project Files (EASIEST METHOD)

### Option A: Using GitHub Desktop (Recommended)

1. **Install GitHub Desktop**
   - Download from: https://desktop.github.com/
   - Install and sign in

2. **Create New Repository**
   - Click "File" → "New Repository"
   - Name: `booktok-trailer-studio`
   - Local Path: Choose where to save (like Desktop)
   - Click "Create Repository"

3. **Add Files**
   - Open the folder that was created
   - Create these files and copy the code from artifacts:
     - `package.json` (from package-json artifact)
     - `.env.local` (from env-file artifact)
     - Create folder `api/` and inside it create `generate.js` (from backend-api artifact)
     - Create folder `src/` and inside it create `App.js` (from openart_clone artifact)

4. **Push to GitHub**
   - In GitHub Desktop, you'll see all files listed
   - Write commit message: "Initial setup with backend"
   - Click "Commit to main"
   - Click "Publish repository"
   - Uncheck "Keep this code private" if you want it public
   - Click "Publish Repository"

✅ Code is now on GitHub!

---

## ✅ STEP 3: Deploy to Vercel (FREE HOSTING)

1. **Sign Up for Vercel**
   - Go to: https://vercel.com/signup
   - Click "Continue with GitHub"
   - Authorize Vercel

2. **Import Your Project**
   - Click "Add New" → "Project"
   - Find your `booktok-trailer-studio` repository
   - Click "Import"

3. **Add Environment Variables**
   - In the "Environment Variables" section, add these:

   ```
   REPLICATE_API_TOKEN = your_replicate_token_here
   SUPABASE_URL = your_supabase_url_here
   SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get a URL like: `https://booktok-trailer-studio.vercel.app`

✅ Your app is now LIVE!

---

## ✅ STEP 4: Test Your App

1. **Open Your App**
   - Go to your Vercel URL
   - You should see the BookTok Trailer Studio interface

2. **Generate Your First Trailer**
   - Fill in book details:
     - Title: "The Dragon's Legacy"
     - Genre: Fantasy
     - Synopsis: "A young warrior discovers ancient magic"
     - Hook Quote: "In a world where dragons rule..."
   - Select a preset (try "HBO Gothic Cinematic")
   - Click "Generate Trailer"
   - Wait 30-60 seconds

3. **Check Results**
   - Video will appear in "My Trailers"
   - Check Supabase database to see the saved data

✅ Everything is working!

---

## 🎯 WHAT HAPPENS WHEN YOU GENERATE A TRAILER

1. **Character Image** (if Character Lock enabled)
   - Uses Stable Diffusion XL
   - Generates consistent character appearance
   - Cost: ~$0.01

2. **Scene Images** (4 scenes)
   - Uses Stable Diffusion XL
   - Creates cinematic scenes
   - Cost: ~$0.04 (4 images)

3. **Video Generation**
   - Uses Stable Video Diffusion
   - Animates images into video
   - Cost: ~$0.10

4. **Voice Narration**
   - Uses Bark AI (text-to-speech)
   - Generates narrator voice
   - Cost: ~$0.02

**Total Cost Per Trailer: ~$0.17**

With your Replicate account, you get free credits to start!

---

## 💰 PRICING & LIMITS

### Replicate Free Tier

- $5 free credits when you sign up
- Can generate ~30 trailers for free
- After that: Pay-as-you-go

### Supabase Free Tier

- 500MB database storage
- 50,000 monthly active users
- Unlimited API requests
- Perfect for starting out!

---

## 🔧 TROUBLESHOOTING

### "Error generating trailer"

- Check Replicate API key is correct in Vercel
- Check Supabase credentials
- Look at Vercel logs: Vercel Dashboard → Your Project → Logs

### "Database error"

- Make sure you ran the SQL schema in Supabase
- Check table was created: Supabase → Table Editor

### Video not appearing

- Check Vercel function logs
- Replicate might be processing (can take 60 seconds)
- Try again in 1 minute

---

## 📊 MONITORING YOUR APP

### Check Usage

1. **Replicate Dashboard**
   - https://replicate.com/account/usage
   - See how many credits used

2. **Supabase Dashboard**
   - See all generated trailers
   - Check database size

3. **Vercel Analytics**
   - See how many users visited
   - Check function execution time

---

## 🎨 CUSTOMIZATION IDEAS

### Add More Presets

Edit `cinematicPresets` array in the code to add new styles

### Change Video Duration

Modify the Stable Video Diffusion parameters

### Add More AI Models

- Runway Gen-3 (higher quality, more expensive)
- Pika Labs (different style)
- Leonardo AI (more control)

---

## 🚀 NEXT STEPS

1. **Add Payment System**
   - Integrate Stripe for paid plans
   - Charge users per trailer

2. **Add User Authentication**
   - Let users save their trailers
   - Create user accounts

3. **Improve Video Quality**
   - Upgrade to Runway Gen-3
   - Add video editing features

4. **Marketing**
   - Share on ProductHunt
   - Post on BookTok
   - Add blog/tutorials

---

## 📞 NEED HELP?

If anything doesn't work:

1. Check Vercel deployment logs
2. Check Supabase connection
3. Verify API keys are correct
4. Make sure all files are uploaded

**Your app is now ready to generate book trailers! 🎬**
