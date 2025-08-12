import { useState } from 'react';
import { MCPTemplate, TemplateArgument, TemplateMessage, TemplateData } from '@/types/template';
import useArrayField from './useArrayField';

export function useTemplateEditor(initial?: MCPTemplate) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? false);

  const initialData: TemplateData = (initial?.template_data ?? {}) as TemplateData;

  const {
    items: arguments_,
    addItem: addArgument,
    removeItem: removeArgument,
    updateItem: updateArgument,
  } = useArrayField<TemplateArgument>(
    initialData.arguments ?? [],
    () => ({ name: '', description: '', required: false })
  );

  const {
    items: messages,
    addItem: addMessage,
    removeItem: removeMessage,
    updateItem: updateMessage,
  } = useArrayField<TemplateMessage>(
    initialData.messages ?? [{ role: 'user', content: '{{prompt}}' }],
    () => ({ role: 'user', content: '' })
  );

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
