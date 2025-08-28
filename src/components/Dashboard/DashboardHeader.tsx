import { Button } from "@/components/ui/button";
import { Plus, LogOut, User as UserIcon } from "lucide-react";
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/integrations/supabase/types';

interface DashboardHeaderProps {
  user: User;
  userProfile?: UserProfile;
  onSignOut: () => void;
  onCreateNew: () => void;
  onEditProfile?: () => void;
}

export function DashboardHeader({ user, userProfile, onSignOut, onCreateNew, onEditProfile }: DashboardHeaderProps) {
  const displayName = userProfile?.display_name || userProfile?.username || user.email?.split('@')[0] || 'User';
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">MCP Prompt Manager</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{displayName}</span>
              </p>
              {userProfile?.username && (
                <span className="text-xs text-muted-foreground">@{userProfile.username}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
            {onEditProfile && (
              <Button variant="outline" onClick={onEditProfile}>
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </Button>
            )}
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