-- Run this in Supabase SQL Editor
-- This creates the database table to store your trailers

CREATE TABLE IF NOT EXISTS trailers (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own trailers
CREATE POLICY "Users can view their own trailers"
  ON trailers
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy to allow users to insert trailers
CREATE POLICY "Users can insert trailers"
  ON trailers
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS trailers_created_at_idx ON trailers(created_at DESC);
CREATE INDEX IF NOT EXISTS trailers_user_id_idx ON trailers(user_id);

-- Add comments
COMMENT ON TABLE trailers IS 'Stores generated book trailers';
COMMENT ON COLUMN trailers.scene_images IS 'Array of scene image URLs in JSON format';
