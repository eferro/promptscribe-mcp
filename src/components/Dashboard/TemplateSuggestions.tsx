import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Template } from '@/types/template';

interface TemplateSuggestionsProps {
  currentTemplate?: Template;
  allTemplates: Template[];
  onView: (template: Template) => void;
}

export function TemplateSuggestions({ currentTemplate, allTemplates, onView }: TemplateSuggestionsProps) {
  const getRelatedTemplates = () => {
    if (!currentTemplate?.tags) return [];
    
    return allTemplates
      .filter(t => t.id !== currentTemplate.id)
      .filter(t => t.tags?.some(tag => currentTemplate.tags!.includes(tag)))
      .slice(0, 3);
  };

  const relatedTemplates = getRelatedTemplates();
  
  if (relatedTemplates.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-muted rounded-lg">
      <h3 className="font-semibold mb-3">Related Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {relatedTemplates.map(template => (
          <div key={template.id} className="p-3 bg-background rounded border">
            <h4 className="font-medium line-clamp-1">{template.name}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {template.description || "No description provided"}
            </p>
            {template.tags && (
              <div className="mt-2 flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag.replace(/-/g, ' ')}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => onView(template)}
            >
              View Template
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}