import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { TemplateArgument } from '@/types/template';

interface TemplateArgumentsEditorProps {
  arguments_: TemplateArgument[];
  addArgument: () => void;
  removeArgument: (index: number) => void;
  updateArgument: (
    index: number,
    field: keyof TemplateArgument,
    value: string | boolean
  ) => void;
}

export default function TemplateArgumentsEditor({
  arguments_,
  addArgument,
  removeArgument,
  updateArgument,
}: TemplateArgumentsEditorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Arguments</CardTitle>
            <CardDescription>
              Define the variables that users can customize in this template
            </CardDescription>
          </div>
          <Button onClick={addArgument} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Argument
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {arguments_.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No arguments defined. Arguments allow users to customize your template with variables like {"{{name}}"} or {"{{topic}}"}.
          </p>
        ) : (
          arguments_.map((arg, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="e.g., topic, name, style"
                  value={arg.name}
                  onChange={(e) => updateArgument(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Describe this argument"
                  value={arg.description}
                  onChange={(e) => updateArgument(index, 'description', e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={arg.required}
                    onCheckedChange={(checked) => updateArgument(index, 'required', checked)}
                  />
                  <Label>Required</Label>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeArgument(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
