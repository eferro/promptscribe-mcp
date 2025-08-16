import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { User } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: User;
  onSignOut: () => void;
  onCreateNew: () => void;
}

export function DashboardHeader({ user, onSignOut, onCreateNew }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">MCP Prompt Manager</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
            <Button variant="outline" onClick={onSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}