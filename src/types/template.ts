export interface TemplateMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TemplateArgument {
  name: string;
  description: string;
  required: boolean;
  type?: string;
}

export interface TemplateData {
  arguments?: TemplateArgument[];
  messages?: TemplateMessage[];
}

export interface MCPTemplate {
  id: string;
  name: string;
  description: string | null;
  template_data: TemplateData | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}
