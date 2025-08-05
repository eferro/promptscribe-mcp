import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Globe, Lock } from "lucide-react";

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

interface TemplateCardProps {
  template: MCPTemplate;
  isOwner: boolean;
  onEdit?: (template: MCPTemplate) => void;
  onDelete?: (template: MCPTemplate) => void;
  onView: (template: MCPTemplate) => void;
}

export default function TemplateCard({ template, isOwner, onEdit, onDelete, onView }: TemplateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const argumentCount = template.template_data?.arguments?.length || 0;
  const messageCount = template.template_data?.messages?.length || 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or dropdown
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="menuitem"]')) {
      return;
    }
    onView(template);
  };

  return (
    <Card className="template-card cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {template.description || "No description provided"}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={template.is_public ? "default" : "secondary"} className="text-xs">
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
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(template)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(template)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(template)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex gap-4">
            <span>{argumentCount} args</span>
            <span>{messageCount} messages</span>
          </div>
          <span>{formatDate(template.updated_at)}</span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            onView(template);
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Template
        </Button>
      </CardContent>
    </Card>
  );
}