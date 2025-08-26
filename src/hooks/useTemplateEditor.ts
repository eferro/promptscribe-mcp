import { useState } from 'react';
import { Template, TemplateArgument, TemplateMessage } from '@/types/template';
import { TaskTag } from '@/types/tags';
import useArrayField from './useArrayField';

export function useTemplateEditor(initial?: Template) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [tags, setTags] = useState<TaskTag[]>(initial?.tags ?? []);

  const {
    items: arguments_,
    addItem: addArgument,
    removeItem: removeArgument,
    updateItem: updateArgument,
  } = useArrayField<TemplateArgument>(
    initial?.arguments ?? [],
    () => ({ name: '', description: '', required: false })
  );

  const {
    items: messages,
    addItem: addMessage,
    removeItem: removeMessage,
    updateItem: updateMessage,
  } = useArrayField<TemplateMessage>(
    initial?.messages ?? [{ role: 'user', content: '{{prompt}}' }],
    () => ({ role: 'user', content: '' })
  );

  return {
    name,
    setName,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    tags,
    setTags,
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
