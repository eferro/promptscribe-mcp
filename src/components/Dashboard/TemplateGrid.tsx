import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Template } from '@/types/template';
import TemplateCard from "@/components/templates/TemplateCard";

interface TemplateGridProps {
  templates: Template[];
  currentUserId: string;
  loading?: boolean;
  emptyMessage?: string;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onView: (template: Template) => void;
}

export function TemplateGrid({ 
  templates, 
  currentUserId, 
  loading = false,
  emptyMessage = "No templates found",
  onEdit, 
  onDelete, 
  onView 
}: TemplateGridProps) {
  if (loading) {
    return <LoadingGrid />;
  }

  if (templates.length === 0) {
    return <EmptyState message={emptyMessage} onCreateNew={onEdit} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isOwner={template.userId === currentUserId}
          onEdit={template.userId === currentUserId ? onEdit : undefined}
          onDelete={template.userId === currentUserId ? onDelete : undefined}
          onView={onView}
        />
      ))}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  onCreateNew?: (template: Template) => void;
}

function EmptyState({ message, onCreateNew }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">{message}</p>
      {onCreateNew && (
        <Button onClick={() => onCreateNew({} as Template)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Template
        </Button>
      )}
    </div>
  );
}