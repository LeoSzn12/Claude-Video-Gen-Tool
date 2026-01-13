import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
    } = body;

    console.log('Generating trailer for:', bookTitle);

    // Step 1: Generate character image if Character Lock is enabled
    let characterImageUrl = null;
    if (useCharacterLock && characterDescription) {
      console.log('Generating character image...');
      const characterOutput: any = await replicate.run(
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

    // Step 0: The Director (LLM Scene Planning)
    console.log('AI Director is planning scenes...');
    const directorPrompt = `You are a world-class cinematic director and prompt engineer.
    Plan 4 highly cinematic scenes for a book trailer.
    
    BOOK DETAILS:
    Title: ${bookTitle}
    Genre: ${genre}
    Synopsis: ${bookSynopsis}
    Hook: ${keyQuote}
    Preset Mood: ${preset}
    ${characterDescription ? `Protagonist Appearance: ${characterDescription}` : ''}

    STYLING RULES:
    - Scenes must be visually stunning and follow a narrative arc (Hook, World, Character, Climax).
    - Prompts must be optimized for Stable Diffusion XL (SDXL).
    - Include lighting, camera angles (cinematic, wide, close-up), and texture details.
    
    OUTPUT FORMAT:
    Return ONLY a raw JSON array containing 4 strings (the prompts). No preamble, no explanation.
    Example: ["prompt 1", "prompt 2", "prompt 3", "prompt 4"]`;

    let scenePrompts;
    try {
      const directorOutput: any = await replicate.run(
        "meta/meta-llama-3-70b-instruct",
        {
          input: {
            prompt: directorPrompt,
            max_new_tokens: 1000,
            prompt_template: "{prompt}",
          }
        }
      );
      
      const llmText = Array.isArray(directorOutput) ? directorOutput.join('') : directorOutput;
      const jsonStart = llmText.indexOf('[');
      const jsonEnd = llmText.lastIndexOf(']') + 1;
      scenePrompts = JSON.parse(llmText.substring(jsonStart, jsonEnd));
      console.log('AI Director planned scenes:', scenePrompts);
    } catch (llmError) {
      console.warn('AI Director failed, falling back to basic logic:', llmError);
      scenePrompts = generateScenePrompts(bookSynopsis, keyQuote, preset, genre);
    }
    
    const sceneImages = [];
    for (let i = 0; i < scenePrompts.slice(0, 4).length; i++) {
      const scenePrompt = scenePrompts[i];
      console.log(`Generating scene ${i+1}...`);
      const sceneOutput: any = await replicate.run(
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
    const videoOutput: any = await replicate.run(
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
    const voiceOutput: any = await replicate.run(
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
    let trailerId = Date.now().toString();
    let timestamp = new Date().toISOString();

    try {
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
          created_at: timestamp,
        })
        .select()
        .single();

      if (dbError) {
        console.warn('Database save failed, but video was generated:', dbError.message);
        console.log('Ensure you have run the SQL schema in Supabase!');
      } else {
        trailerId = trailer.id;
        timestamp = trailer.created_at;
        console.log('Trailer saved successfully:', trailerId);
      }
    } catch (dbError) {
      console.warn('Error saving to Supabase:', dbError);
    }

    return NextResponse.json({
      success: true,
      trailer: {
        id: trailerId,
        videoUrl: videoOutput,
        characterImageUrl: characterImageUrl,
        sceneImages: sceneImages,
        voiceUrl: voiceOutput?.audio_out,
        timestamp: timestamp,
      }
    });

  } catch (error: any) {
    console.error('Error generating trailer:', error);
    return NextResponse.json({ 
      error: 'Failed to generate trailer',
      message: error.message 
    }, { status: 500 });
  }
}

function generateScenePrompts(synopsis: string, quote: string, preset: string, genre: string) {
  const presetStyles: Record<string, string> = {
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

function generateVoiceScript(title: string, synopsis: string, quote: string) {
  return `${quote}. ${title}. ${synopsis.substring(0, 150)}. Available now.`;
}
