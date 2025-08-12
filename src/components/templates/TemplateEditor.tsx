import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import useTemplateEditor from '@/hooks/useTemplateEditor';
import { getUser } from "@/services/authService";
import { saveTemplate } from "@/services/templateService";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { MCPTemplate, TemplateData } from '@/types/template';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import TemplateArgumentsEditor from './TemplateArgumentsEditor';

interface TemplateEditorProps {
  template?: MCPTemplate;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: (template: MCPTemplate) => void;
}


export default function TemplateEditor({ template, onSave, onCancel, onDelete }: TemplateEditorProps) {
  const {
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
  } = useTemplateEditor(template);

  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

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
      const { data: { user } } = await getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to save templates"
        });
        return;
      }

      // Build the template data object
      const templateData: TemplateData = {
        arguments: arguments_,
        messages: messages
      };

      const templatePayload = {
        name: name.trim(),
        description: description.trim() || null,
        template_data: templateData,
        is_public: isPublic,
        user_id: user.id
      };

      const { error } = await saveTemplate(templatePayload, template?.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: error.message
        });
      } else {
        toast({
          title: "Success",
          description: template?.id ? "Template updated successfully" : "Template created successfully"
        });
        onSave();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
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
        {/* Template Details */}
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>
              Configure your MCP prompt template metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter template name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this template does"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public">Make this template public</Label>
            </div>
          </CardContent>
        </Card>

        <TemplateArgumentsEditor
          arguments_={arguments_}
          addArgument={addArgument}
          removeArgument={removeArgument}
          updateArgument={updateArgument}
        />

        {/* Template Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Define the conversation flow for your template
                </CardDescription>
              </div>
              <Button onClick={addMessage} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Message
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1 mr-4">
                    <Label>Role</Label>
                    <select
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={message.role}
                      onChange={(e) => updateMessage(index, 'role', e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="assistant">Assistant</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeMessage(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Enter message content. Use {{argumentName}} for variables."
                    value={message.content}
                    onChange={(e) => updateMessage(index, 'content', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
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
        template={template || null}
        onConfirm={confirmDelete}
      />
    </div>
  );
}