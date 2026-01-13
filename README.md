# 🎬 BookTok Trailer Studio

AI-powered book trailer generator for TikTok, YouTube Shorts, and Instagram Reels. Create professional cinematic trailers with consistent characters, Google Flow-style presets, and automated video generation.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🚀 One-Click Generation
- **Instant trailer creation** from book details
- **Character Lock-In** - Maintains consistent character appearance across all scenes
- **4+ Cinematic presets** (HBO Gothic, Film Noir, Action, Horror, Romantic)
- **Google Flow-style prompts** - Detailed expanded prompts for each preset

### 🎨 Advanced Controls
- **Storyboard Builder** - Scene-by-scene planning with 6+ scene types
- **Camera & Lighting** - 6 camera angles + 6 lighting presets
- **Visual Effects** - Film grain, color grading, animated text, and more
- **Script Generator** - AI-powered script creation
- **Music & Voice** - 6 AI voice narrators + custom music

### 📤 Publishing Tools
- **Auto-hashtag generator** - Platform-optimized tags
- **Metadata optimization** - Title and description suggestions
- **Multi-platform export** - TikTok, YouTube Shorts, Instagram Reels

## 🤖 AI Models Used

| Feature | Model | Provider |
|---------|-------|----------|
| Video Generation | Stable Video Diffusion | Replicate |
| Image Generation | Stable Diffusion XL | Replicate |
| Character Lock | ControlNet + Face ID | Replicate |
| Voice Narration | Bark AI | Replicate |
| Alternative Video | Runway Gen-3 | Runway ML |
| Alternative Images | DALL-E 3, Midjourney | OpenAI, Midjourney |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Replicate API account
- Supabase account (free tier works!)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/LeoSzn12/Claude-Video-Gen-Tool.git
cd Claude-Video-Gen-Tool
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
- Get Replicate key: https://replicate.com/account/api-tokens
- Get Supabase credentials: https://app.supabase.com

4. **Set up Supabase database**
- Go to your Supabase project → SQL Editor
- Run the schema from `supabase-schema.sql`

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LeoSzn12/Claude-Video-Gen-Tool)

1. Click the button above or go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables from `.env.example`
4. Deploy!

### Environment Variables for Vercel
```
REPLICATE_API_TOKEN=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

## 💰 Pricing

### Development Costs
- **Setup**: FREE
- **Hosting**: FREE (Vercel + Supabase free tiers)
- **Per Trailer**: ~$0.17 (via Replicate)

### Cost Breakdown per Trailer
- Character Image: $0.01
- Scene Images (4): $0.04
- Video Generation: $0.10
- Voice Narration: $0.02
- **Total**: ~$0.17

### Free Tier Credits
- Replicate: $5 free credits (≈30 trailers)
- Supabase: 500MB database, unlimited requests
- Vercel: Unlimited deployments

## 🛠️ Project Structure

```
booktok-trailer-studio/
├── api/
│   └── generate.js          # Backend API for AI generation
├── src/
│   └── App.js              # Main React component
├── public/                 # Static assets
├── .env.local             # Environment variables (not in git)
├── .env.example           # Example env file
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
└── README.md              # This file
```

## 🔧 Configuration

### Cinematic Presets
Presets are defined in `src/App.js`:
- HBO Gothic Cinematic
- Cinematic Blockbuster
- Film Noir
- Motion Chapters Style
- Horror Gothic
- Romantic Dreamy

### AI Model Configuration
Models are configured in `api/generate.js`:
- Stable Diffusion XL for images
- Stable Video Diffusion for video
- Bark AI for voice narration

## 📊 Features Roadmap

- [ ] Video editing capabilities
- [ ] Custom music upload
- [ ] Batch generation
- [ ] User authentication
- [ ] Payment integration (Stripe)
- [ ] Advanced analytics
- [ ] Template marketplace
- [ ] Collaboration features

## 🐛 Troubleshooting

### "Error generating trailer"
- Verify API keys in `.env.local`
- Check Replicate account has credits
- Review Vercel function logs

### Database errors
- Ensure Supabase schema is created
- Check service role key permissions
- Verify table exists in Supabase dashboard

### Video not generating
- Replicate processing can take 30-90 seconds
- Check Replicate dashboard for job status
- Ensure video duration is within limits (15-60s)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

- GitHub Issues: [Report bugs](https://github.com/LeoSzn12/Claude-Video-Gen-Tool/issues)
- Documentation: See `docs/` folder
- Email: support@booktrailer.studio (if applicable)

## 🙏 Acknowledgments

- Built with [Replicate](https://replicate.com) for AI models
- Database by [Supabase](https://supabase.com)
- Deployed on [Vercel](https://vercel.com)
- Icons by [Lucide](https://lucide.dev)

---

**Made with ❤️ for authors and BookTok creators**