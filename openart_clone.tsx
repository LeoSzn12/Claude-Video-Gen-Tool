'use client';

import React, { useState } from 'react';
import { Sparkles, BookOpen, Zap, Crown, Film, Layout, Hash, Video, Plus, Trash2, Copy, Play, Download, Share2, Clock, CheckCircle2, Camera, Lightbulb, Target, Mic2, Upload, Settings, Music, User, Image, Wand2, ChevronRight, Eye, Palette, Volume2, FileText, Shuffle, TrendingUp, AlertCircle, BarChart, Repeat, Activity } from 'lucide-react';

interface Scene {
  id: number;
  type: string;
  description: string;
  duration: number;
  text?: string;
  cameraAngle: string;
  lighting: string;
  transition: string;
}

interface Video {
  id: string;
  title: string;
  platform: string;
  duration: number;
  preset: string;
  videoModel: string;
  imageModel: string;
  timestamp: string;
  hasCharacterLock: boolean;
  videoUrl?: string;
  characterImageUrl?: string;
  voiceUrl?: string;
}

interface Preset {
  id: string;
  name: string;
  type: string;
  desc: string;
  videoModel: string;
  imageModel: string;
  prompt: {
    scene: string;
    visuals: string;
    camera: string;
    audio: string;
  };
}

const BookTrailerStudio = () => {

  const [selectedTool, setSelectedTool] = useState('one-click');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<Video[]>([]);
  
  // Book Info
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [bookGenre, setBookGenre] = useState('fantasy');
  const [bookSynopsis, setBookSynopsis] = useState('');
  const [keyQuote, setKeyQuote] = useState('');
  const [targetAudience, setTargetAudience] = useState('young-adult');
  
  // Platform & Settings
  const [platform, setPlatform] = useState('tiktok');
  const [videoDuration, setVideoDuration] = useState(30);
  const [pacing, setPacing] = useState('fast');
  const [musicIntensity, setMusicIntensity] = useState(7);
  const [includeText, setIncludeText] = useState(true);
  const [includeCaptions, setIncludeCaptions] = useState(true);
  
  // Character Lock
  const [useCharacterLock, setUseCharacterLock] = useState(false);
  const [characterDescription, setCharacterDescription] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');
  
  // Cinematic Presets
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState('');
  const [showExpandedPrompt, setShowExpandedPrompt] = useState(false);
  
  // Storyboard
  const [storyboardScenes, setStoryboardScenes] = useState<Scene[]>([
    { id: 1, type: 'hook', description: '', duration: 3, text: '', cameraAngle: 'close-up', lighting: 'dramatic', transition: 'quick-cut' }
  ]);
  
  // Voice & Music
  const [selectedVoice, setSelectedVoice] = useState('bella');
  const [musicGenre, setMusicGenre] = useState('cinematic');
  
  // Hashtags & Publishing
  const [autoHashtags, setAutoHashtags] = useState<string[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  
  // Camera & Lighting
  const [selectedLighting, setSelectedLighting] = useState('dramatic');
  const [selectedCameraAngle, setSelectedCameraAngle] = useState('close-up');
  const [selectedEffect, setSelectedEffect] = useState('none');

  const bookGenres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Thriller', 'Romance', 'Horror', 'Historical', 'Adventure', 'Young Adult', 'Contemporary'];
  
  const targetAudiences = [
    { id: 'young-adult', name: 'Young Adult (13-18)', emoji: '🎓' },
    { id: 'new-adult', name: 'New Adult (18-25)', emoji: '🎯' },
    { id: 'adult', name: 'Adult (25+)', emoji: '📚' }
  ];

  const platforms = [
    { id: 'tiktok', name: 'TikTok', maxDuration: 60 },
    { id: 'youtube', name: 'YouTube Shorts', maxDuration: 60 },
    { id: 'instagram', name: 'Instagram Reels', maxDuration: 90 },
    { id: 'all', name: 'All Platforms', maxDuration: 60 }
  ];

  const cinematicPresets = [
    {
      id: 'hbo-gothic',
      name: 'HBO Gothic Cinematic',
      type: 'Custom',
      desc: 'Dark, moody, prestige TV aesthetic',
      videoModel: 'Runway Gen-3 Alpha',
      imageModel: 'DALL-E 3',
      prompt: {
        scene: 'A haunting gothic scene with cinematic prestige television quality',
        visuals: 'Rembrandt-style chiaroscuro - deep shadows with strategic highlights, cool blue moonlight mixed with warm candlelight. Desaturated with pops of deep burgundy, slate blue. Hyperrealistic textures, film grain.',
        camera: 'Slow push-in from Wide to Medium Close-Up. Eye-level with slight dutch angle. Smooth gimbal work.',
        audio: 'Rich, layered ambient sound. Minimal, tension-building strings and low drones. Sparse piano notes.'
      }
    },
    {
      id: 'cinematic',
      name: 'Cinematic Blockbuster',
      type: 'Preset',
      desc: 'Classic Hollywood epic feel',
      videoModel: 'Pika Labs 1.5',
      imageModel: 'Midjourney V6',
      prompt: {
        scene: 'Epic cinematic trailer scene with Hollywood production values',
        visuals: 'Golden hour magic hour lighting. Rich, saturated colors - deep oranges, azure blues. Crisp detail, dynamic range, lens flares.',
        camera: 'Dynamic mix - aerial establishing shots to intense close-ups. Sweeping crane shots, fast whip pans, dramatic crash zooms.',
        audio: 'Epic and expansive ambient sound. Full orchestral score - soaring strings, pounding percussion, brass fanfares. Hans Zimmer style.'
      }
    },
    {
      id: 'film-noir',
      name: 'Film Noir',
      type: 'Preset',
      desc: 'Classic detective mystery',
      videoModel: 'Stable Video Diffusion',
      imageModel: 'SDXL',
      prompt: {
        scene: 'Moody detective mystery in classic film noir style',
        visuals: 'Hard, directional key lights creating stark shadows. Venetian blind patterns. High contrast black and white. Cigarette smoke, rain.',
        camera: 'Low angles, extreme close-ups on eyes. Dutch angles, shadows cast on walls. Slow dolly moves, sudden whip pans.',
        audio: 'City ambience - rain, distant sirens. Smoky jazz - saxophone, upright bass, brushed drums. Melancholic trumpet.'
      }
    },
    {
      id: 'motion-chapters',
      name: 'Motion Chapters Style',
      type: 'Custom',
      desc: 'BookTok viral animated text style',
      videoModel: 'Runway Gen-3 Alpha Turbo',
      imageModel: 'DALL-E 3',
      prompt: {
        scene: 'Dynamic BookTok trailer with kinetic typography and quick cuts',
        visuals: 'Animated text overlays with bold typography. Book cover zoom and reveal animations. High contrast, vibrant colors.',
        camera: 'Quick cuts every 3-5 seconds. Snap zooms, dynamic text animations. Phone-optimized vertical format.',
        audio: 'Trending audio or dramatic music synced with text reveals. Sound effects for text pops and transitions.'
      }
    }
  ];

  const voices = [
    { id: 'bella', name: 'Bella', style: 'Warm Narrator', gender: 'Female', best: 'Romance, YA' },
    { id: 'adam', name: 'Adam', style: 'Deep Dramatic', gender: 'Male', best: 'Thriller, Fantasy' },
    { id: 'rachel', name: 'Rachel', style: 'Conversational', gender: 'Female', best: 'Contemporary' },
    { id: 'drew', name: 'Drew', style: 'Authoritative', gender: 'Male', best: 'Mystery' },
    { id: 'emily', name: 'Emily', style: 'Calm Elegant', gender: 'Female', best: 'Historical' },
    { id: 'josh', name: 'Josh', style: 'Energetic', gender: 'Male', best: 'Action' }
  ];

  const lightingPresets = [
    { id: 'dramatic', name: 'Dramatic', emoji: '⚡' },
    { id: 'soft', name: 'Soft Dreamy', emoji: '🌙' },
    { id: 'golden', name: 'Golden Hour', emoji: '🌅' },
    { id: 'moody', name: 'Dark Moody', emoji: '🌑' },
    { id: 'bright', name: 'Bright Airy', emoji: '☀️' },
    { id: 'neon', name: 'Neon Glow', emoji: '🔮' }
  ];

  const cameraAngles = [
    { id: 'close-up', name: 'Close-Up', desc: 'Emotional impact' },
    { id: 'wide', name: 'Wide Shot', desc: 'Scene establisher' },
    { id: 'overhead', name: 'Overhead', desc: 'Artistic view' },
    { id: 'dutch', name: 'Dutch Angle', desc: 'Tension' },
    { id: 'tracking', name: 'Tracking', desc: 'Follow action' },
    { id: 'pov', name: 'POV', desc: 'First-person' }
  ];

  const visualEffects = [
    { id: 'none', name: 'None' },
    { id: 'film-grain', name: 'Film Grain' },
    { id: 'light-leaks', name: 'Light Leaks' },
    { id: 'color-grade', name: 'Color Grade' },
    { id: 'vignette', name: 'Vignette' },
    { id: 'glow', name: 'Glow' },
    { id: 'text-animation', name: 'Animated Text' }
  ];

  const sceneTypes = [
    { id: 'hook', name: 'Hook', desc: 'First 3 seconds', icon: '🎣' },
    { id: 'world', name: 'World Setup', desc: 'Setting', icon: '🌍' },
    { id: 'character', name: 'Character', desc: 'Protagonist', icon: '👤' },
    { id: 'conflict', name: 'Conflict', desc: 'Problem', icon: '⚔️' },
    { id: 'stakes', name: 'Stakes', desc: 'Risk', icon: '🔥' },
    { id: 'cta', name: 'Call-to-Action', desc: 'Where to buy', icon: '📢' }
  ];

  const tools = [
    { id: 'one-click', name: '⚡ One-Click Generator', icon: Zap },
    { id: 'storyboard', name: '🎬 Storyboard Builder', icon: Layout },
    { id: 'camera-lighting', name: '📷 Camera & Lighting', icon: Camera },
    { id: 'effects', name: '✨ Visual Effects', icon: Sparkles },
    { id: 'script', name: '📜 Script Generator', icon: FileText },
    { id: 'music-voice', name: '🎵 Music & Voice', icon: Music },
    { id: 'publishing', name: '📤 Publishing & Hashtags', icon: Hash },
    { id: 'my-trailers', name: '🎥 My Trailers', icon: Video, badge: generatedVideos.length }
  ];

  const addScene = () => {
    setStoryboardScenes([...storyboardScenes, {
      id: Date.now(),
      type: 'intrigue',
      description: '',
      duration: 5,
      text: '',
      cameraAngle: 'wide',
      lighting: 'dramatic',
      transition: 'fade'
    }]);
  };

  const updateScene = (id: number, field: keyof Scene, value: any) => {
    setStoryboardScenes(storyboardScenes.map((scene: Scene) =>
      scene.id === id ? { ...scene, [field]: value } : scene
    ));
  };

  const deleteScene = (id: number) => {
    if (storyboardScenes.length > 1) {
      setStoryboardScenes(storyboardScenes.filter((s: Scene) => s.id !== id));
    }
  };


  const generateHashtags = () => {
    const genreTag = bookGenre.toLowerCase().replace(' ', '');
    const tags = [
      '#booktok', '#booktrailer', `#${genreTag}books`, '#bookrecommendations',
      '#booktube', '#readersoftiktok', '#bookstagram', '#mustread',
      '#newrelease', '#bookworm', '#authorsoftiktok', '#bookish'
    ];
    setAutoHashtags(tags);
  };

  const handleGenerate = async () => {
    if (!bookTitle || !bookSynopsis) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookTitle,
          bookSynopsis,
          keyQuote,
          genre: bookGenre,
          preset: selectedPreset?.id || 'cinematic',
          characterDescription,
          sceneDescription,
          useCharacterLock,
          videoDuration,
          platform
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newVideo: Video = {
          id: data.trailer.id,
          title: bookTitle || 'My Book Trailer',
          platform: platform,
          duration: videoDuration,
          preset: selectedPreset?.name || 'Standard',
          videoModel: selectedPreset?.videoModel || 'Runway Gen-3',
          imageModel: selectedPreset?.imageModel || 'DALL-E 3',
          timestamp: new Date(data.trailer.timestamp).toLocaleString(),
          hasCharacterLock: useCharacterLock,
          videoUrl: data.trailer.videoUrl,
          characterImageUrl: data.trailer.characterImageUrl,
          voiceUrl: data.trailer.voiceUrl
        };
        
        setGeneratedVideos([newVideo, ...generatedVideos]);
        generateHashtags();
        setSelectedTool('my-trailers'); // Switch to view result
      } else {
        alert('Failed to generate trailer: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating the trailer.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    const p = preset.prompt;
    const formatted = `## ${preset.name}: ${bookTitle || 'Your Book'}

**Video Model:** ${preset.videoModel}
**Image Model:** ${preset.imageModel}

**Scene:** ${p.scene}

**Visuals:** ${p.visuals}

**Camera:** ${p.camera}

**Audio:** ${p.audio}`;
    
    setExpandedPrompt(formatted);
    setShowExpandedPrompt(true);
  };

  const OneClickSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/50">
        <h2 className="text-3xl font-bold mb-3">One-Click Book Trailer Generator</h2>
        <p className="text-gray-300">AI-powered with Runway Gen-3, DALL-E 3, Pika Labs. Character Lock for consistency.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Book Information</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Book Title *</label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookTitle(e.target.value)}
                    placeholder="The Shadow King"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthorName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Genre *</label>
                  <select
                    value={bookGenre}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBookGenre(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {bookGenres.map((genre: string) => (
                      <option key={genre} value={genre.toLowerCase()}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {targetAudiences.map((aud: any) => (
                      <option key={aud.id} value={aud.id}>{aud.emoji} {aud.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Book Synopsis *</label>
                <textarea
                  value={bookSynopsis}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBookSynopsis(e.target.value)}
                  placeholder="A young warrior discovers she is the last dragon rider..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hook Quote *</label>
                <input
                  type="text"
                  value={keyQuote}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyQuote(e.target.value)}
                  placeholder="In a world where magic is forbidden..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-6 h-6 text-purple-400" />
                Character Lock-In
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCharacterLock}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUseCharacterLock(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">Enable</span>
              </label>
            </div>

            {useCharacterLock && (
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">Uses Stable Diffusion ControlNet + Face ID for consistent character appearance across all scenes</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm text-gray-400">Upload Character</p>
                  </div>
                  <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <Wand2 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm text-gray-400">AI Generate</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Character Description</label>
                  <textarea
                    value={characterDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCharacterDescription(e.target.value)}
                    placeholder="A young woman with long dark hair, green eyes, leather jacket, fantasy warrior..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Scene Environment</label>
                  <input
                    type="text"
                    value={sceneDescription}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSceneDescription(e.target.value)}
                    placeholder="Dark fantasy castle interior with torches..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Platform & Settings</h3>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {platforms.map((plat: any) => (
                <button
                  key={plat.id}
                  onClick={() => setPlatform(plat.id)}
                  className={`p-3 rounded-xl transition-all ${
                    platform === plat.id
                      ? 'bg-purple-600 ring-2 ring-purple-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <Video className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">{plat.name}</div>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration: {videoDuration}s</label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  value={videoDuration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoDuration(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-2">Pacing</label>
                  <select
                    value={pacing}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPacing(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                  >
                    <option value="slow">Slow</option>
                    <option value="medium">Medium</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2">Music: {musicIntensity}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={musicIntensity}
                    onChange={(e) => setMusicIntensity(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={includeText}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeText(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Animated Text
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={includeCaptions}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeCaptions(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Captions
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Cinematic Presets</h3>
            <div className="space-y-2">
              {cinematicPresets.map((preset: any) => (
                <div key={preset.id}>
                  <button
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selectedPreset?.id === preset.id
                        ? 'bg-purple-600 ring-2 ring-purple-400'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{preset.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-900/50 rounded">{preset.type}</span>
                        </div>
                        <div className="text-xs text-gray-300">{preset.desc}</div>
                        <div className="text-xs text-gray-400 mt-1">{preset.videoModel}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </div>
                  </button>

                  {selectedPreset?.id === preset.id && showExpandedPrompt && (
                    <div className="mt-2 p-3 bg-gray-900 rounded-lg border border-purple-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Expanded Prompt
                        </h4>
                        <button
                          onClick={() => setShowExpandedPrompt(false)}
                          className="text-xs text-gray-400"
                        >
                          Hide
                        </button>
                      </div>
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                        {expandedPrompt}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Voice Narrator</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {voices.map((voice: any) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`w-full p-2 rounded-lg text-left transition-all text-sm ${
                    selectedVoice === voice.id
                      ? 'bg-purple-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{voice.name} - {voice.style}</div>
                  <div className="text-xs text-gray-300">Best: {voice.best}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Powered by ElevenLabs API</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-5 border border-green-500/30">
            <h4 className="font-semibold mb-3">AI Models Used</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                <span>Video: Runway Gen-3, Pika Labs, Stable Video</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                <span>Images: DALL-E 3, Midjourney, SDXL</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                <span>Voice: ElevenLabs Text-to-Speech</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                <span>Music: Artlist AI Music Generator</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                <span>Character: Stable Diffusion ControlNet</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || isPlanning || !bookTitle || !bookSynopsis}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/50 disabled:shadow-none"
          >
            {isPlanning ? (
              <>
                <Sparkles className="w-6 h-6 animate-pulse text-yellow-400" />
                <span>Director Planning...</span>
              </>
            ) : isGenerating ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Assets...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                <span>Generate Trailer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const StoryboardSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Storyboard Builder</h2>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Total: {storyboardScenes.reduce((acc: number, s: Scene) => acc + s.duration, 0)}s
        </div>
        <button onClick={addScene} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Scene
        </button>
      </div>

      <div className="space-y-4">
        {storyboardScenes.map((scene: Scene, index: number) => (
          <div key={scene.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Scene {index + 1}</h3>
              <button onClick={() => deleteScene(scene.id)} className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Scene Type</label>
                <select
                  value={scene.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateScene(scene.id, 'type', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                >
                  {sceneTypes.map((type: any) => (
                    <option key={type.id} value={type.id}>{type.icon} {type.name} - {type.desc}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={scene.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateScene(scene.id, 'description', e.target.value)}
                  placeholder="Describe the visuals..."
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration: {scene.duration}s</label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={scene.duration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateScene(scene.id, 'duration', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Camera Angle</label>
                <select
                  value={scene.cameraAngle}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateScene(scene.id, 'cameraAngle', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                >
                  {cameraAngles.map((angle: any) => (
                    <option key={angle.id} value={angle.id}>{angle.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold flex items-center justify-center gap-2"
      >
        <Film className="w-5 h-5" />
        Generate from Storyboard
      </button>
    </div>
  );

  const CameraLightingSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Camera & Lighting Controls</h2>
      
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Camera Angles</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {cameraAngles.map(angle => (
            <button
              key={angle.id}
              onClick={() => setSelectedCameraAngle(angle.id)}
              className={`p-4 rounded-lg text-left ${
                selectedCameraAngle === angle.id
                  ? 'bg-purple-600 ring-2 ring-purple-400'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="font-semibold mb-1">{angle.name}</div>
              <div className="text-xs text-gray-300">{angle.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Lighting Presets</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {lightingPresets.map((light: any) => (
            <button
              key={light.id}
              onClick={() => setSelectedLighting(light.id)}
              className={`p-4 rounded-lg text-center ${
                selectedLighting === light.id
                  ? 'bg-purple-600 ring-2 ring-purple-400'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">{light.emoji}</div>
              <div className="font-semibold text-sm">{light.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const EffectsSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visual Effects</h2>
      
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Post-Processing Effects</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {visualEffects.map((effect: any) => (
            <button
              key={effect.id}
              onClick={() => setSelectedEffect(effect.id)}
              className={`p-4 rounded-lg ${
                selectedEffect === effect.id
                  ? 'bg-purple-600 ring-2 ring-purple-400'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="font-semibold">{effect.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const PublishingSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Publishing & Optimization</h2>
      
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Hashtag Generator</h3>
        <button
          onClick={generateHashtags}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium mb-4"
        >
          Generate Hashtags
        </button>

        {autoHashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {autoHashtags.map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-purple-600/30 border border-purple-500 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Video Metadata</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Video Title</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoTitle(e.target.value)}
              placeholder="You NEED to read this book!"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={videoDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVideoDescription(e.target.value)}
              placeholder="Write an engaging description..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const MyTrailersSection = () => {
    const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Generated Trailers</h2>
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
            dbStatus === 'connected' ? 'bg-green-900/40 text-green-400' : 
            dbStatus === 'error' ? 'bg-red-900/40 text-red-400' : 'bg-gray-800 text-gray-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              dbStatus === 'connected' ? 'bg-green-500' : 
              dbStatus === 'error' ? 'bg-red-500' : 'bg-gray-500 animate-pulse'
            }`} />
            DB: {dbStatus === 'checking' ? 'Checking Connection...' : dbStatus === 'connected' ? 'Connected' : 'Table Not Found'}
          </div>
        </div>
        
        {dbStatus === 'error' && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-100">Supabase Table Missing</h3>
                <p className="text-sm text-red-200/70 mb-4">Your videos are being generated but cannot be saved permanently because the 'trailers' table does not exist in your Supabase project.</p>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-40 mb-4 border border-red-500/20">
                  <pre>{`CREATE TABLE trailers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_title TEXT NOT NULL,
  book_synopsis TEXT,
  genre TEXT,
  preset TEXT,
  video_url TEXT,
  character_image_url TEXT,
  scene_images JSONB,
  voice_url TEXT,
  platform TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}</pre>
                </div>
                <p className="text-xs text-red-200/50">Copy the code above and run it in your Supabase SQL Editor to fix this.</p>
              </div>
            </div>
          </div>
        )}

        {generatedVideos.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-700">
          <Film className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold mb-2">No trailers yet</h3>
          <p className="text-gray-400">Generate your first trailer to see it here</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedVideos.map(video => (
            <div key={video.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group">
              <div className="relative h-64 bg-black flex items-center justify-center">
                {video.videoUrl ? (
                  <video 
                    src={video.videoUrl} 
                    className="w-full h-full object-cover"
                    controls
                    poster={video.characterImageUrl}
                  />
                ) : (
                  <>
                    <Play className="w-16 h-16 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-purple-900/30 -z-10" />
                  </>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs pointer-events-none">
                  {video.duration}s
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 rounded text-xs capitalize">
                  {video.platform}
                </div>
                {video.hasCharacterLock && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-600 rounded text-xs flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Char Lock
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold mb-1">{video.title}</h3>
                <p className="text-xs text-purple-400 mb-1">{video.preset}</p>
                <p className="text-xs text-gray-400 mb-2">
                  {video.videoModel} + {video.imageModel}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Clock className="w-3 h-3" />
                  {video.timestamp}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium flex items-center justify-center gap-2 text-sm">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    );
  };

  const renderContent = () => {
    switch(selectedTool) {
      case 'one-click': return <OneClickSection />;
      case 'storyboard': return <StoryboardSection />;
      case 'camera-lighting': return <CameraLightingSection />;
      case 'effects': return <EffectsSection />;
      case 'publishing': return <PublishingSection />;
      case 'my-trailers': return <MyTrailersSection />;
      default: return <OneClickSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <header className="border-b border-gray-800 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BookTok Trailer Studio</h1>
              <p className="text-xs text-gray-400">AI-Powered Cinematic Trailers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">40 Credits</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Go Pro</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {tools.map((tool: any) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedTool === tool.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tool.name}</span>
                {tool.badge > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default BookTrailerStudio;
            