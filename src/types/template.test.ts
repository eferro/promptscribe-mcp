import { describe, it, expectTypeOf } from 'vitest';
import { TemplateData, TemplateArgument, TemplateMessage, MCPTemplate } from './template';

describe('TemplateData type', () => {
  it('has arguments and messages arrays', () => {
    expectTypeOf<TemplateData>().toHaveProperty('arguments').toEqualTypeOf<TemplateArgument[] | undefined>();
    expectTypeOf<TemplateData>().toHaveProperty('messages').toEqualTypeOf<TemplateMessage[] | undefined>();
  });

  it('is used in MCPTemplate', () => {
    expectTypeOf<MCPTemplate>().toHaveProperty('template_data').toEqualTypeOf<TemplateData | null>();
  });
});
