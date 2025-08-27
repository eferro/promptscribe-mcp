import { useState, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskTag, formatTagDisplay, searchTags } from '@/types/tags';

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
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TaskTag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = searchTags(inputValue).filter(tag => !selectedTags.includes(tag));
      setSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions for better UX
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, selectedTags]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleTagSelect = (tag: TaskTag) => {
    if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleTagRemove = (tag: TaskTag) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleTagSelect(suggestions[0]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const isAtMaxTags = selectedTags.length >= maxTags;

  return (
    <div className="space-y-3">
      {/* Input with autocomplete */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isAtMaxTags ? "Maximum tags reached" : "Type to search tags..."}
          disabled={isAtMaxTags}
          className="pr-8"
        />
        
        {/* Tag count indicator */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
          {selectedTags.length}/{maxTags}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map(tag => (
              <button
                key={tag}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground text-sm"
                onClick={() => handleTagSelect(tag)}
              >
                {formatTagDisplay(tag)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Tags</Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-xs"
                onClick={() => handleTagRemove(tag)}
              >
                {formatTagDisplay(tag)} ×
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        {isAtMaxTags 
          ? "Maximum tags reached. Remove some tags to add new ones."
          : "Type to search and select tags. Press Enter to select the first suggestion."
        }
      </p>
    </div>
  );
}