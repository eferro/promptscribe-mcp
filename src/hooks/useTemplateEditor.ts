import { useState } from 'react';
import { MCPTemplate, TemplateArgument, TemplateMessage, TemplateData } from '@/types/template';

export function useTemplateEditor(initial?: MCPTemplate) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? false);

  const initialData: TemplateData = (initial?.template_data ?? {}) as TemplateData;
  const [arguments_, setArguments] = useState<TemplateArgument[]>(
    initialData.arguments ?? []
  );
  const [messages, setMessages] = useState<TemplateMessage[]>(
    initialData.messages ?? [{ role: 'user', content: '{{prompt}}' }]
  );

  const addArgument = () => {
    setArguments([...arguments_, { name: '', description: '', required: false }]);
  };

  const removeArgument = (index: number) => {
    setArguments(arguments_.filter((_, i) => i !== index));
  };

  const updateArgument = (
    index: number,
    field: keyof TemplateArgument,
    value: string | boolean
  ) => {
    const updated = [...arguments_];
    updated[index] = { ...updated[index], [field]: value };
    setArguments(updated);
  };

  const addMessage = () => {
    setMessages([...messages, { role: 'user', content: '' }]);
  };

  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const updateMessage = (
    index: number,
    field: keyof TemplateMessage,
    value: string
  ) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    setMessages(updated);
  };

  return {
    name,
    setName,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    arguments_,
    addArgument,
    removeArgument,
    updateArgument,
    messages,
    addMessage,
    removeMessage,
    updateMessage,
  };
}

export default useTemplateEditor;
