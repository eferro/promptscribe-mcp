-- Create username_history table (SKIP - no audit trail needed)
-- This table is created for future use but not populated with triggers
CREATE TABLE public.username_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_username TEXT NOT NULL,
  new_username TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.username_history ENABLE ROW LEVEL SECURITY;

-- Create basic policies (minimal since this is not actively used)
CREATE POLICY "Users can view their own username history" 
ON public.username_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_username_history_user_id ON public.username_history(user_id);
CREATE INDEX idx_username_history_changed_at ON public.username_history(changed_at);

-- Note: No triggers or automatic population - this table is for future manual use
