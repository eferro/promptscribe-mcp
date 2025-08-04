import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save } from "lucide-react";

interface MCPTemplate {
  id?: string;
  name: string;
  description: string | null;
  template_data: any;
  is_public: boolean;
  user_id: string;
}

interface TemplateEditorProps {
  template?: MCPTemplate;
  onSave: () => void;
  onCancel: () => void;
}

const defaultTemplate = {
  name: "",
  description: "",
  arguments: [],
  messages: [
    {
      role: "user",
      content: "{{prompt}}"
    }
  ]
};

export default function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [isPublic, setIsPublic] = useState(template?.is_public || false);
  const [templateData, setTemplateData] = useState(
    JSON.stringify(template?.template_data || defaultTemplate, null, 2)
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Template name is required"
      });
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(templateData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: "Please check your template JSON syntax"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to save templates"
        });
        return;
      }

      const templatePayload = {
        name: name.trim(),
        description: description.trim() || null,
        template_data: parsedData,
        is_public: isPublic,
        user_id: user.id
      };

      let error;
      if (template?.id) {
        // Update existing template
        const { error: updateError } = await supabase
          .from('prompt_templates')
          .update(templatePayload)
          .eq('id', template.id);
        error = updateError;
      } else {
        // Create new template
        const { error: insertError } = await supabase
          .from('prompt_templates')
          .insert([templatePayload]);
        error = insertError;
      }

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
        <h1 className="text-2xl font-bold">
          {template?.id ? 'Edit Template' : 'New Template'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* JSON Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Template JSON</CardTitle>
            <CardDescription>
              Define your MCP template structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="template-json">Template Data</Label>
              <Textarea
                id="template-json"
                className="code-editor font-mono text-sm min-h-96 resize-none"
                value={templateData}
                onChange={(e) => setTemplateData(e.target.value)}
                placeholder="Enter your MCP template JSON"
              />
            </div>
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
    </div>
  );
}