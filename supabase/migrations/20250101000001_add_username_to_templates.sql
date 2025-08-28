-- Add username support to prompt_templates table
ALTER TABLE public.prompt_templates 
ADD COLUMN created_by_username TEXT;

-- Create index for username-based queries
CREATE INDEX idx_prompt_templates_created_by_username ON public.prompt_templates(created_by_username);

-- Create function to automatically populate username when creating templates
CREATE OR REPLACE FUNCTION public.set_template_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Get username from user_profiles table
  SELECT username INTO NEW.created_by_username
  FROM public.user_profiles
  WHERE user_id = NEW.user_id;
  
  -- If no username found, set a default
  IF NEW.created_by_username IS NULL THEN
    NEW.created_by_username = 'unknown_user';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger to auto-populate username on template creation
CREATE TRIGGER set_template_username_trigger
  BEFORE INSERT ON public.prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_template_username();

-- Update existing templates with placeholder username
UPDATE public.prompt_templates 
SET created_by_username = 'legacy_user' 
WHERE created_by_username IS NULL;
