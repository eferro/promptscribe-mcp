import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TemplateDetailsFormProps {
  name: string;
  description: string;
  isPublic: boolean;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setIsPublic: (value: boolean) => void;
}

export default function TemplateDetailsForm({
  name,
  description,
  isPublic,
  setName,
  setDescription,
  setIsPublic,
}: TemplateDetailsFormProps) {
  return (
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
  );
}
