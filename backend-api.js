// api/generate.js - Vercel Serverless Function
import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      bookTitle,
      bookSynopsis,
      keyQuote,
      genre,
      preset,
      characterDescription,
      sceneDescription,
      useCharacterLock,
      videoDuration,
      platform
    } = req.body;

    console.log('Generating trailer for:', bookTitle);

    // Step 1: Generate character image if Character Lock is enabled
    let characterImageUrl = null;
    if (useCharacterLock && characterDescription) {
      console.log('Generating character image...');
      const characterOutput = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: `${characterDescription}, highly detailed, professional portrait, 4k, sharp focus`,
            negative_prompt: "blurry, low quality, distorted, ugly, deformed",
            width: 1024,
            height: 1024,
          }
        }
      );
      characterImageUrl = characterOutput[0];
      console.log('Character image generated:', characterImageUrl);
    }

    // Step 2: Generate scene images based on preset and synopsis
    console.log('Generating scene images...');
    const scenePrompts = generateScenePrompts(bookSynopsis, keyQuote, preset, genre);
    
    const sceneImages = [];
    for (const scenePrompt of scenePrompts.slice(0, 4)) {
      const sceneOutput = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: scenePrompt + (characterDescription ? `, featuring ${characterDescription}` : ''),
            negative_prompt: "blurry, low quality, text, watermark",
            width: 768,
            height: 1344, // 9:16 aspect ratio for vertical video
          }
        }
      );
      sceneImages.push(sceneOutput[0]);
      console.log('Scene image generated:', sceneOutput[0]);
    }

    // Step 3: Generate video from images using Stable Video Diffusion
    console.log('Generating video...');
    const videoOutput = await replicate.run(
      "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          cond_aug: 0.02,
          decoding_t: 14,
          input_image: sceneImages[0],
          video_length: "14_frames_with_svd",
          sizing_strategy: "maintain_aspect_ratio",
          motion_bucket_id: 127,
          frames_per_second: 6,
        }
      }
    );
    console.log('Video generated:', videoOutput);

    // Step 4: Generate voiceover using Bark (text-to-speech)
    console.log('Generating voiceover...');
    const voiceScript = generateVoiceScript(bookTitle, bookSynopsis, keyQuote);
    const voiceOutput = await replicate.run(
      "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787",
      {
        input: {
          prompt: voiceScript,
          text_temp: 0.7,
          output_full: false,
          waveform_temp: 0.7,
        }
      }
    );
    console.log('Voice generated:', voiceOutput);

    // Step 5: Store in Supabase
    console.log('Saving to database...');
    const { data: trailer, error: dbError } = await supabase
      .from('trailers')
      .insert({
        book_title: bookTitle,
        book_synopsis: bookSynopsis,
        genre: genre,
        preset: preset,
        video_url: videoOutput,
        character_image_url: characterImageUrl,
        scene_images: sceneImages,
        voice_url: voiceOutput?.audio_out,
        platform: platform,
        duration: videoDuration,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Trailer saved:', trailer.id);

    // Return success response
    return res.status(200).json({
      success: true,
      trailer: {
        id: trailer.id,
        videoUrl: videoOutput,
        characterImageUrl: characterImageUrl,
        sceneImages: sceneImages,
        voiceUrl: voiceOutput?.audio_out,
        timestamp: trailer.created_at,
      }
    });

  } catch (error) {
    console.error('Error generating trailer:', error);
    return res.status(500).json({ 
      error: 'Failed to generate trailer',
      message: error.message 
    });
  }
}

// Helper function to generate scene prompts
function generateScenePrompts(synopsis, quote, preset, genre) {
  const presetStyles = {
    'hbo-gothic': 'dark gothic atmosphere, chiaroscuro lighting, dramatic shadows, HBO prestige TV style',
    'cinematic': 'epic cinematic, golden hour lighting, Hollywood blockbuster style',
    'film-noir': 'film noir, high contrast black and white, venetian blinds, moody detective atmosphere',
    'motion-chapters': 'vibrant colors, dynamic composition, BookTok viral style',
  };

  const style = presetStyles[preset] || 'cinematic, professional quality';
  
  return [
    `${quote}, ${style}, ${genre} book cover aesthetic, dramatic composition`,
    `${synopsis.substring(0, 100)}, ${style}, establishing shot, cinematic framing`,
    `Main character from ${synopsis.substring(0, 80)}, ${style}, character portrait, emotional depth`,
    `Climactic scene, ${style}, ${genre} atmosphere, epic moment`,
  ];
}

// Helper function to generate voice script
function generateVoiceScript(title, synopsis, quote) {
  return `${quote}. ${title}. ${synopsis.substring(0, 150)}. Available now.`;
}
