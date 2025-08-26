import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  TESTING_TASK_TAGS, 
  QUALITY_TASK_TAGS, 
  REFACTORING_TASK_TAGS, 
  AGILE_TASK_TAGS, 
  LEAN_TASK_TAGS,
  TaskTag,
  TAG_CATEGORIES
} from '@/types/tags';

interface TagSelectorProps {
  selectedTags: TaskTag[];
  onTagsChange: (tags: TaskTag[]) => void;
  maxTags?: number;
}

export function TagSelector({ 
  selectedTags, 
  onTagsChange, 
  maxTags = 5 
}: TagSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof TAG_CATEGORIES>('testing');
  
  const handleTagToggle = (tag: TaskTag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatTagDisplay = (tag: string) => {
    return tag.replace(/-/g, ' ');
  };

  return (
    <div className="space-y-4">
      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(TAG_CATEGORIES).map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category as keyof typeof TAG_CATEGORIES)}
          >
            {getCategoryDisplayName(category)}
          </Button>
        ))}
      </div>

      {/* Tags in Active Category */}
      <div className="flex flex-wrap gap-2">
        {TAG_CATEGORIES[activeCategory].map(tag => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            size="sm"
            onClick={() => handleTagToggle(tag)}
            disabled={!selectedTags.includes(tag) && selectedTags.length >= maxTags}
            className="text-xs"
          >
            {formatTagDisplay(tag)}
          </Button>
        ))}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Tags ({selectedTags.length}/{maxTags})</Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleTagToggle(tag)}
              >
                {formatTagDisplay(tag)} ×
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}