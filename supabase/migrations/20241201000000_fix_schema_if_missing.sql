-- Migration to ensure all required tables exist
-- This migration is idempotent and safe to run multiple times

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist (using DO block to handle duplicates)
DO $$
BEGIN
  -- Check and create policies only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" 
    ON public.user_profiles 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view public profiles') THEN
    CREATE POLICY "Users can view public profiles" 
    ON public.user_profiles 
    FOR SELECT 
    USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can create their own profile') THEN
    CREATE POLICY "Users can create their own profile" 
    ON public.user_profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" 
    ON public.user_profiles 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can delete their own profile') THEN
    CREATE POLICY "Users can delete their own profile" 
    ON public.user_profiles 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create or replace function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profiles_updated_at_column();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Add constraints if they don't exist
DO $$
BEGIN
  -- Add username length constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_username_length') THEN
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT check_username_length CHECK (length(username) >= 3 AND length(username) <= 20);
  END IF;

  -- Add username format constraint  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_username_format') THEN
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT check_username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$');
  END IF;

  -- Add reserved username constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_username_reserved') THEN
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT check_username_reserved CHECK (
      username NOT IN ('admin', 'root', 'system', 'support', 'help', 'info', 'test', 'demo')
    );
  END IF;
END
$$;

-- Add created_by_username column to prompt_templates if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt_templates' AND column_name = 'created_by_username') THEN
    ALTER TABLE public.prompt_templates ADD COLUMN created_by_username TEXT;
    CREATE INDEX idx_prompt_templates_created_by_username ON public.prompt_templates(created_by_username);
  END IF;
END
$$;

-- Create username trigger function for templates if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_template_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate username when creating templates
  IF NEW.created_by_username IS NULL THEN
    SELECT username INTO NEW.created_by_username 
    FROM user_profiles 
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger for template username (drop first if exists)
DROP TRIGGER IF EXISTS set_template_username_trigger ON public.prompt_templates;
CREATE TRIGGER set_template_username_trigger
  BEFORE INSERT ON public.prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_template_username();
