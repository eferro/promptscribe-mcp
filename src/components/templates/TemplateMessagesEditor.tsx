import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { TemplateMessage } from '@/types/template';

interface TemplateMessagesEditorProps {
  messages: TemplateMessage[];
  addMessage: () => void;
  removeMessage: (index: number) => void;
  updateMessage: (
    index: number,
    field: keyof TemplateMessage,
    value: string
  ) => void;
}

export default function TemplateMessagesEditor({
  messages,
  addMessage,
  removeMessage,
  updateMessage,
}: TemplateMessagesEditorProps) {
  return (
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
  );
}
