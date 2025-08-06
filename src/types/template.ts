export interface MCPTemplate {
  id: string;
  name: string;
  description: string | null;
  template_data: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TemplateMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TemplateArgument {
  name: string;
  description: string;
  required: boolean;
}