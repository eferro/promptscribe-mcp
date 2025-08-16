import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTemplateService } from "@/hooks/useServices";
import TemplateEditor from "@/components/templates/TemplateEditor";
import TemplateViewer from "@/components/templates/TemplateViewer";
import DeleteConfirmDialog from "@/components/templates/DeleteConfirmDialog";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { TemplateGrid } from "@/components/Dashboard/TemplateGrid";
import { TemplateSearch } from "@/components/Dashboard/TemplateSearch";
import { useTemplateSearch } from "@/hooks/useTemplateSearch";
import { User } from '@supabase/supabase-js';
import { Template } from '@/types/template';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

type ViewMode = 'dashboard' | 'editor' | 'viewer';

export default function Dashboard({ user, onSignOut }: DashboardProps) {
  // Essential state only
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  
  // Data fetching and services
  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const templateService = useTemplateService();
  
  // Filtered data using custom hook
  const filteredMyTemplates = useTemplateSearch(myTemplates, searchQuery);
  const filteredPublicTemplates = useTemplateSearch(publicTemplates, searchQuery);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Fetch user's templates
      const userTemplates = await templateService.findByUser(user.id);
      
      // Fetch public templates
      const publicData = await templateService.findPublic();

      setMyTemplates(userTemplates || []);
      setPublicTemplates(publicData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load templates"
      });
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete template"
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
      <TemplateEditor
        template={selectedTemplate || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    );
  }

  if (viewMode === 'viewer' && selectedTemplate) {
    return (
      <TemplateViewer
        template={selectedTemplate}
        user={user}
        onBack={handleCancel}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onSignOut={onSignOut} onCreateNew={handleCreateNew} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <TemplateSearch value={searchQuery} onChange={setSearchQuery} />

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
        template={templateToDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}