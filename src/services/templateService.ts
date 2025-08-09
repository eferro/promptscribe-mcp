import { supabase } from '@/integrations/supabase/client';
import { handleRequest } from '@/api/supabaseApi';

export async function fetchUserTemplates(userId: string) {
  return handleRequest(
    supabase
      .from('prompt_templates')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    'Failed to load templates'
  );
}

export async function fetchPublicTemplates() {
  return handleRequest(
    supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false }),
    'Failed to load templates'
  );
}

export async function saveTemplate(payload: any, id?: string) {
  if (id) {
    return handleRequest(
      supabase
        .from('prompt_templates')
        .update(payload)
        .eq('id', id),
      'Failed to save template'
    );
  }
  return handleRequest(
    supabase.from('prompt_templates').insert([payload]),
    'Failed to save template'
  );
}

export async function deleteTemplate(id: string) {
  return handleRequest(
    supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id),
    'Failed to delete template'
  );
}
