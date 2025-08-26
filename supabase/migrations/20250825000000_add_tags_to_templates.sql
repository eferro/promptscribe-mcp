-- Add tags column to prompt_templates table
ALTER TABLE public.prompt_templates 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for tag searches
CREATE INDEX idx_prompt_templates_tags ON public.prompt_templates USING GIN(tags);

-- Add constraint to ensure tags are limited to 5
ALTER TABLE public.prompt_templates 
ADD CONSTRAINT check_tags_length CHECK (array_length(tags, 1) <= 5);

-- Add constraint to ensure tags are not empty strings
ALTER TABLE public.prompt_templates 
ADD CONSTRAINT check_tags_content CHECK (
  array_length(tags, 1) IS NULL OR 
  (array_length(tags, 1) > 0 AND NOT ('' = ANY(tags)))
);