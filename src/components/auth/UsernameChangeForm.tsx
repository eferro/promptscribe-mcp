import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface UsernameChangeFormProps {
  currentUsername: string;
  onUsernameChanged: (newUsername: string) => void;
  onCancel: () => void;
}

export default function UsernameChangeForm({ 
  currentUsername, 
  onUsernameChanged, 
  onCancel 
}: UsernameChangeFormProps) {
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const { toast } = useToast();

  // Check username availability with debouncing
  const checkUsernameAvailability = React.useCallback(async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    if (usernameToCheck === currentUsername) {
      setUsernameAvailable(true);
      return;
    }

    setCheckingUsername(true);
    try {
      const { UserProfileService } = await import('@/services/userProfileService');
      const { data: isAvailable } = await UserProfileService.isUsernameAvailable(usernameToCheck);
      setUsernameAvailable(isAvailable);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, [currentUsername]);

  // Debounced username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newUsername.trim()) {
        checkUsernameAvailability(newUsername.trim());
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newUsername, currentUsername, checkUsernameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername.trim()) {
      toast({
        variant: "destructive",
        title: "Username required",
        description: "Please enter a new username"
      });
      return;
    }

    if (newUsername.trim() === currentUsername) {
      toast({
        title: "No changes",
        description: "New username is the same as current username"
      });
      return;
    }

    if (newUsername.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Username too short",
        description: "Username must be at least 3 characters long"
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        variant: "destructive",
        title: "Username unavailable",
        description: "Please choose a different username"
      });
      return;
    }

    setLoading(true);

    try {
      const { UserProfileService } = await import('@/services/userProfileService');
      const { error } = await UserProfileService.updateUsername(currentUsername, newUsername.trim());

      if (error) {
        toast({
          variant: "destructive",
          title: "Username change failed",
          description: error.message
        });
      } else {
        toast({
          title: "Username updated",
          description: "Your username has been successfully changed"
        });
        onUsernameChanged(newUsername.trim());
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while changing username"
      });
    } finally {
      setLoading(false);
    }
  };

  const isValidUsername = (username: string) => {
    return /^[a-zA-Z0-9_-]+$/.test(username);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Change Username</CardTitle>
        <CardDescription>
          Choose a new username for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-username">Current Username</Label>
            <Input
              id="current-username"
              type="text"
              value={currentUsername}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-username">New Username</Label>
            <Input
              id="new-username"
              type="text"
              placeholder="Enter new username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_-]+"
              title="Username can only contain letters, numbers, underscores, and hyphens"
            />
            {newUsername.length > 0 && (
              <div className="text-sm">
                {checkingUsername ? (
                  <span className="text-muted-foreground">Checking availability...</span>
                ) : usernameAvailable === true ? (
                  <span className="text-green-600">✓ Username available</span>
                ) : usernameAvailable === false ? (
                  <span className="text-red-600">✗ Username already taken</span>
                ) : newUsername.length < 3 ? (
                  <span className="text-muted-foreground">Username must be at least 3 characters</span>
                ) : !isValidUsername(newUsername) ? (
                  <span className="text-red-600">✗ Invalid characters</span>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading || usernameAvailable === false || !isValidUsername(newUsername)}
            >
              {loading ? "Updating..." : "Update Username"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
