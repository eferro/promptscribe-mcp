import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Globe, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MCPTemplate {
  id: string;
  name: string;
  description: string | null;
  template_data: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface TemplateViewerProps {
  template: MCPTemplate;
  onBack: () => void;
}

export default function TemplateViewer({ template, onBack }: TemplateViewerProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(template.template_data, null, 2));
    toast({
      title: "Copied!",
      description: "Template JSON copied to clipboard"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{template.name}</h1>
        <Badge variant={template.is_public ? "default" : "secondary"}>
          {template.is_public ? (
            <>
              <Globe className="w-3 h-3 mr-1" />
              Public
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 mr-1" />
              Private
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Description</h4>
                <p className="text-sm mt-1">
                  {template.description || "No description provided"}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Created</h4>
                <p className="text-sm mt-1">{formatDate(template.created_at)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Last Updated</h4>
                <p className="text-sm mt-1">{formatDate(template.updated_at)}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Statistics</h4>
                <div className="text-sm mt-1 space-y-1">
                  <p>Arguments: {template.template_data?.arguments?.length || 0}</p>
                  <p>Messages: {template.template_data?.messages?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arguments */}
          {template.template_data?.arguments?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Arguments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.template_data.arguments.map((arg: any, index: number) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm">
                      <div className="font-semibold">{arg.name}</div>
                      {arg.description && (
                        <div className="text-muted-foreground">{arg.description}</div>
                      )}
                      {arg.type && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {arg.type}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* JSON Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Template JSON</CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="code-editor p-4 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                {JSON.stringify(template.template_data, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Messages Preview */}
          {template.template_data?.messages?.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Messages Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.template_data.messages.map((message: any, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {message.role}
                        </Badge>
                      </div>
                      <pre className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}