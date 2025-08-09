import { supabase } from '@/integrations/supabase/client';

export async function fetchUserTemplates(userId: string) {
  return supabase
    .from('prompt_templates')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
}

export async function fetchPublicTemplates() {
  return supabase
    .from('prompt_templates')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });
}

export async function saveTemplate(payload: any, id?: string) {
  if (id) {
    return supabase
      .from('prompt_templates')
      .update(payload)
      .eq('id', id);
  }
  return supabase.from('prompt_templates').insert([payload]);
}

export async function deleteTemplate(id: string) {
  return supabase
    .from('prompt_templates')
    .delete()
    .eq('id', id);
}
