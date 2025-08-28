import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Globe, Lock } from "lucide-react";
import { Template } from '@/types/template';
import { formatDate } from '@/lib/utils';

interface TemplateCardProps {
  template: Template;
  isOwner: boolean;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onView: (template: Template) => void;
}

export default function TemplateCard({ template, isOwner, onEdit, onDelete, onView }: TemplateCardProps) {

  const argumentCount = template.arguments?.length || 0;
  const messageCount = template.messages?.length || 0;

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
            {template.tags && template.tags.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="text-xs px-2 py-1"
                    >
                      {tag.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={template.isPublic ? "default" : "secondary"} className="text-xs">
              {template.isPublic ? (
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
            {template.createdByUsername && (
              <span>by @{template.createdByUsername}</span>
            )}
          </div>
          <span>{formatDate(template.updatedAt)}</span>
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