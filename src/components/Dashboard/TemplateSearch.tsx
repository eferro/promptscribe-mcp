import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TemplateSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplateSearch({ value, onChange }: TemplateSearchProps) {
  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search templates..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}