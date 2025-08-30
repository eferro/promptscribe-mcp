import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from '@/integrations/supabase/types';
import { useUsernameAvailability } from '@/hooks/useUsernameAvailability';
import { isValidUsername, MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH, USERNAME_REGEX } from '@/lib/username';

interface UserProfileFormProps {
  profile: UserProfile;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

export default function UserProfileForm({ 
  profile, 
  onProfileUpdated, 
  onCancel 
}: UserProfileFormProps) {
  const [formData, setFormData] = useState({
    username: profile.username,
    displayName: profile.display_name || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatar_url || ''
  });
  const [loading, setLoading] = useState(false);
  const { usernameAvailable, checkingUsername } = useUsernameAvailability(
    formData.username,
    profile.user_id,
    profile.username
  );
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Check if form has changes
  useEffect(() => {
    const changed =
      formData.username !== profile.username ||
      formData.displayName !== (profile.display_name || '') ||
      formData.bio !== (profile.bio || '') ||
      formData.avatarUrl !== (profile.avatar_url || '');

    setHasChanges(changed);
  }, [formData, profile]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast({
        variant: "destructive",
        title: "Username required",
        description: "Please enter a username"
      });
      return;
    }

    if (formData.username.trim().length < MIN_USERNAME_LENGTH) {
      toast({
        variant: "destructive",
        title: "Username too short",
        description: `Username must be at least ${MIN_USERNAME_LENGTH} characters long`
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

      let currentProfile: UserProfile | null = null;

      if (formData.username !== profile.username) {
        const { data, error } = await UserProfileService.updateUsername(
          profile.user_id,
          formData.username.trim()
        );

        if (error) {
          toast({
            variant: "destructive",
            title: "Profile update failed",
            description: error.message
          });
          return;
        }

        currentProfile = data;
      }

      const updates: Partial<UserProfile> = {} as Partial<UserProfile>;
      if (formData.displayName !== (profile.display_name || '')) {
        updates.display_name = formData.displayName.trim() || null;
      }
      if (formData.bio !== (profile.bio || '')) {
        updates.bio = formData.bio.trim() || null;
      }
      if (formData.avatarUrl !== (profile.avatar_url || '')) {
        updates.avatar_url = formData.avatarUrl.trim() || null;
      }

      if (Object.keys(updates).length > 0) {
        const { data, error } = await UserProfileService.updateProfile(
          profile.user_id,
          updates
        );

        if (error) {
          toast({
            variant: "destructive",
            title: "Profile update failed",
            description: error.message
          });
          return;
        }

        currentProfile = data;
      }

      if (currentProfile) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated"
        });
        onProfileUpdated(currentProfile);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating profile"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: profile.username,
      displayName: profile.display_name || '',
      bio: profile.bio || '',
      avatarUrl: profile.avatar_url || ''
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your profile information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                minLength={MIN_USERNAME_LENGTH}
                maxLength={MAX_USERNAME_LENGTH}
                pattern={USERNAME_REGEX.source}
                title="Username can only contain letters, numbers, underscores, and hyphens"
              />
              {formData.username.length > 0 && (
                <div className="text-sm">
                  {checkingUsername ? (
                    <span className="text-muted-foreground">Checking availability...</span>
                  ) : usernameAvailable === true ? (
                    <span className="text-green-600">✓ Username available</span>
                  ) : usernameAvailable === false ? (
                    <span className="text-red-600">✗ Username already taken</span>
                  ) : formData.username.length < MIN_USERNAME_LENGTH ? (
                    <span className="text-muted-foreground">Username must be at least {MIN_USERNAME_LENGTH} characters</span>
                  ) : !isValidUsername(formData.username) ? (
                    <span className="text-red-600">✗ Invalid characters</span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter display name"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                maxLength={50}
              />
              <div className="text-sm text-muted-foreground">
                This is how your name will appear to others
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              maxLength={500}
              rows={4}
            />
            <div className="text-sm text-muted-foreground">
              {formData.bio.length}/500 characters
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatarUrl}
              onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              Optional: URL to your profile picture
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex-1"
            >
              Reset
            </Button>
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
              disabled={loading || usernameAvailable === false || !isValidUsername(formData.username) || !hasChanges}
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
