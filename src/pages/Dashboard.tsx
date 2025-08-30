import { useState, useEffect, useCallback, Suspense, lazy, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTemplateService } from "@/hooks/useServices";
// Lazy load heavy components to improve initial load
const TemplateEditor = lazy(() => import("@/components/templates/TemplateEditor"));
const TemplateViewer = lazy(() => import("@/components/templates/TemplateViewer"));
import DeleteConfirmDialog from "@/components/templates/DeleteConfirmDialog";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { TemplateGrid } from "@/components/Dashboard/TemplateGrid";
import { TemplateSearch } from "@/components/Dashboard/TemplateSearch";
import UsernameChangeForm from "@/components/auth/UsernameChangeForm";
import { useTemplateSearch } from "@/hooks/useTemplateSearch";
import { User } from '@supabase/supabase-js';
import { Template, MCPTemplate } from '@/types/template';
import { TaskTag, ALL_TASK_TAGS } from '@/types/tags';
import { UserProfile } from '@/integrations/supabase/types';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

type ViewMode = 'dashboard' | 'editor' | 'viewer' | 'change-username';

export default function Dashboard({ user, onSignOut }: DashboardProps) {
  // Essential state only
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<TaskTag | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Data fetching and services
  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const templateService = useTemplateService();
  
  // Fetch templates function
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user's templates
      const userTemplates = await templateService.findByUser(user.id);
      
      // Fetch public templates
      const publicData = await templateService.findPublic();

      setMyTemplates(userTemplates || []);
      setPublicTemplates(publicData || []);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load templates"
      });
    } finally {
      setLoading(false);
    }
  }, [templateService, user.id, toast]);

  // First apply text search using the hook
  const textFilteredMyTemplates = useTemplateSearch(myTemplates, searchQuery);
  const textFilteredPublicTemplates = useTemplateSearch(publicTemplates, searchQuery);

  // Then apply tag filtering
  const filteredMyTemplates = useMemo(() => {
    if (selectedTagFilter) {
      return textFilteredMyTemplates.filter(template => 
        template.tags?.includes(selectedTagFilter)
      );
    }
    return textFilteredMyTemplates;
  }, [textFilteredMyTemplates, selectedTagFilter]);

  const filteredPublicTemplates = useMemo(() => {
    if (selectedTagFilter) {
      return textFilteredPublicTemplates.filter(template => 
        template.tags?.includes(selectedTagFilter)
      );
    }
    return textFilteredPublicTemplates;
  }, [textFilteredPublicTemplates, selectedTagFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { UserProfileService } = await import('@/services/userProfileService');
        const { data } = await UserProfileService.getProfileByUserId(user.id);
        if (data) setUserProfile(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load profile"
        });
      }
    };
    loadProfile();
  }, [user.id, toast]);

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setViewMode('editor');
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setViewMode('editor');
  };

  const handleView = (template: Template) => {
    setSelectedTemplate(template);
    setViewMode('viewer');
  };

  const handleDelete = (template: Template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      await templateService.delete(templateToDelete.id);

      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
      
      // Navigate back to dashboard if we're currently viewing/editing the deleted template
      if (selectedTemplate?.id === templateToDelete.id) {
        setViewMode('dashboard');
        setSelectedTemplate(null);
      }
      
      fetchTemplates();
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete template"
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSave = () => {
    setViewMode('dashboard');
    fetchTemplates();
  };

  const handleCancel = () => {
    setViewMode('dashboard');
    setSelectedTemplate(null);
  };

  if (viewMode === 'editor') {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      }>
        <TemplateEditor
          template={selectedTemplate || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      </Suspense>
    );
  }

  if (viewMode === 'viewer' && selectedTemplate) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading viewer...</p>
          </div>
        </div>
      }>
        <TemplateViewer
          template={selectedTemplate as unknown as MCPTemplate}
          user={user}
          onBack={handleCancel}
          onEdit={handleEdit as unknown as (t: MCPTemplate) => void}
          onDelete={handleDelete as unknown as (t: MCPTemplate) => void}
        />
      </Suspense>
    );
  }

  if (viewMode === 'change-username') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <UsernameChangeForm
          user={{ id: user.id, username: userProfile?.username || '' }}
          onUsernameChanged={(newUsername) => {
            setUserProfile(prev => prev ? { ...prev, username: newUsername } : prev);
            setViewMode('dashboard');
          }}
          onCancel={() => setViewMode('dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        user={user}
        userProfile={userProfile || undefined}
        onSignOut={onSignOut}
        onCreateNew={handleCreateNew}
        onChangeUsername={() => setViewMode('change-username')}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <TemplateSearch value={searchQuery} onChange={setSearchQuery} />

        {/* Tag Filter */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Filter by Tag</Label>
          <select 
            value={selectedTagFilter || ''} 
            onChange={(e) => setSelectedTagFilter(e.target.value as TaskTag || null)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm min-w-48"
          >
            <option value="">All Tags</option>
            {ALL_TASK_TAGS.map(tag => (
              <option key={tag} value={tag}>
                {tag.replace(/-/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Templates */}
        <Tabs defaultValue="my-templates" className="w-full">
          <TabsList>
            <TabsTrigger value="my-templates">
              My Templates ({myTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="public-templates">
              Public Templates ({publicTemplates.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-templates" className="mt-6">
            <TemplateGrid
              templates={filteredMyTemplates}
              currentUserId={user.id}
              loading={loading}
              emptyMessage={searchQuery ? 'No templates match your search.' : "You haven't created any templates yet."}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </TabsContent>
          
          <TabsContent value="public-templates" className="mt-6">
            <TemplateGrid
              templates={filteredPublicTemplates}
              currentUserId={user.id}
              loading={loading}
              emptyMessage={searchQuery ? 'No public templates match your search.' : 'No public templates available yet.'}
              onView={handleView}
            />
          </TabsContent>
        </Tabs>
      </main>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        template={templateToDelete as unknown as MCPTemplate | null}
        onConfirm={confirmDelete}
      />
    </div>
  );
}