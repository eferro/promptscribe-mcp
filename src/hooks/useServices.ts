import { TemplateApplicationService } from '../application/services/TemplateApplicationService';
import { appContainer } from '../infrastructure/di/AppContainer';

export const useTemplateService = (): TemplateApplicationService => {
  return appContainer.resolve<TemplateApplicationService>('TemplateApplicationService');
};