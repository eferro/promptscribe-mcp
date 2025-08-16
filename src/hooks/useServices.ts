import { TemplateService } from '../services/templateService';
import { supabase } from '../integrations/supabase/client';

// Create a singleton instance of TemplateService
let templateServiceInstance: TemplateService | null = null;

export const useTemplateService = (): TemplateService => {
  if (!templateServiceInstance) {
    templateServiceInstance = new TemplateService(supabase);
  }
  return templateServiceInstance;
};