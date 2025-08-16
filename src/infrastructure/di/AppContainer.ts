import { Container } from './Container';
import { TemplateRepository } from '../../domain/repositories/TemplateRepository';
import { SupabaseTemplateRepository } from '../repositories/SupabaseTemplateRepository';
import { supabase } from '../../integrations/supabase/client';

export const createAppContainer = (): Container => {
  const container = new Container();

  // Register Repository (keeping for backward compatibility during migration)
  container.register<TemplateRepository>(
    'TemplateRepository',
    () => new SupabaseTemplateRepository(supabase)
  );

  return container;
};

// Singleton instance for the application
export const appContainer = createAppContainer();