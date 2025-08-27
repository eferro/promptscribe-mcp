import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import useTemplateEditor from '@/hooks/useTemplateEditor';
import { getUser } from "@/services/authService";
import { useTemplateService } from "@/hooks/useServices";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Template } from '@/types/template';
import { User } from '@supabase/supabase-js';
import { TagSelector } from './TagSelector';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { MCPTemplate } from '@/types/template';
import TemplateArgumentsEditor from './TemplateArgumentsEditor';
import TemplateDetailsForm from './TemplateDetailsForm';
import TemplateMessagesEditor from './TemplateMessagesEditor';

interface TemplateEditorProps {
  template?: Template;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: (template: Template) => void;
}


export default function TemplateEditor({ template, onSave, onCancel, onDelete }: TemplateEditorProps) {
  const {
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
  } = useTemplateEditor(template);

  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const templateService = useTemplateService();

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (onDelete && template) {
      onDelete(template);
    }
    setDeleteDialogOpen(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Template name is required"
      });
      return;
    }

    if (messages.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "At least one message is required"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await getUser() as {
        data: { user: User | null } | null;
        error: { message: string } | null;
      };
      const user = data?.user;
      if (error || !user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to save templates"
        });
        return;
      }

      if (template?.id) {
        // Update existing template
        await templateService.update(template.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          messages: messages,
          arguments: arguments_,
          isPublic: isPublic,
          tags: tags.length > 0 ? tags : undefined
        });
      } else {
        // Create new template
        await templateService.create({
          name: name.trim(),
          description: description.trim() || undefined,
          messages: messages,
          arguments: arguments_,
          isPublic: isPublic,
          tags: tags.length > 0 ? tags : undefined,
          userId: user.id
        });
      }

      toast({
        title: "Success",
        description: template?.id ? "Template updated successfully" : "Template created successfully"
      });
      onSave();
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {template?.id && onDelete && (
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
        <h1 className="text-2xl font-bold flex-1">
          {template?.id ? 'Edit Template' : 'New Template'}
        </h1>
      </div>

      <div className="space-y-6">
        <TemplateDetailsForm
          name={name}
          description={description}
          isPublic={isPublic}
          setName={setName}
          setDescription={setDescription}
          setIsPublic={setIsPublic}
        />

        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Tags</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Categorize your template with relevant development tasks (optional, max 5)
            </p>
            <TagSelector
              selectedTags={tags}
              onTagsChange={setTags}
              maxTags={5}
            />
          </div>
        </div>

        <TemplateArgumentsEditor
          arguments_={arguments_}
          addArgument={addArgument}
          removeArgument={removeArgument}
          updateArgument={updateArgument}
        />

        <TemplateMessagesEditor
          messages={messages}
          addMessage={addMessage}
          removeMessage={removeMessage}
          updateMessage={updateMessage}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        template={template as unknown as MCPTemplate || null}
        onConfirm={confirmDelete}
      />
    </div>
  );
}