import { Container } from './Container';
import { TemplateRepository } from '../../domain/repositories/TemplateRepository';
import { SupabaseTemplateRepository } from '../repositories/SupabaseTemplateRepository';
import { TemplateApplicationService } from '../../application/services/TemplateApplicationService';
import { supabase } from '../../integrations/supabase/client';

export const createAppContainer = (): Container => {
  const container = new Container();

  // Register Repository
  container.register<TemplateRepository>(
    'TemplateRepository',
    () => new SupabaseTemplateRepository(supabase)
  );

  // Register Application Service
  container.register<TemplateApplicationService>(
    'TemplateApplicationService',
    (c) => new TemplateApplicationService(
      c.resolve<TemplateRepository>('TemplateRepository')
    )
  );

  return container;
};

// Singleton instance for the application
export const appContainer = createAppContainer();