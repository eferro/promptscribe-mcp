import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { fetchUserTemplates, fetchPublicTemplates, deleteTemplate } from "@/services/templateService";
import { Plus, Search, LogOut } from "lucide-react";
import TemplateCard from "@/components/templates/TemplateCard";
import TemplateEditor from "@/components/templates/TemplateEditor";
import TemplateViewer from "@/components/templates/TemplateViewer";
import DeleteConfirmDialog from "@/components/templates/DeleteConfirmDialog";
import { User } from '@supabase/supabase-js';
import { MCPTemplate } from '@/types/template';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

type ViewMode = 'dashboard' | 'editor' | 'viewer';

export default function Dashboard({ user, onSignOut }: DashboardProps) {
  const [myTemplates, setMyTemplates] = useState<MCPTemplate[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<MCPTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<MCPTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<MCPTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Fetch user's templates
      const { data: userTemplates, error: userError } = await fetchUserTemplates(user.id);

      if (userError) throw userError;

      // Fetch public templates (including user's own)
      const { data: publicData, error: publicError } = await fetchPublicTemplates();

      if (publicError) throw publicError;

      setMyTemplates(userTemplates || []);
      setPublicTemplates(publicData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load templates"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setViewMode('editor');
  };

  const handleEdit = (template: MCPTemplate) => {
    setSelectedTemplate(template);
    setViewMode('editor');
  };

  const handleView = (template: MCPTemplate) => {
    setSelectedTemplate(template);
    setViewMode('viewer');
  };

  const handleDelete = (template: MCPTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      const { error } = await deleteTemplate(templateToDelete.id);

      if (error) throw error;

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
        description: "Failed to delete template"
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

  const filteredMyTemplates = myTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPublicTemplates = publicTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">MCP Prompt Manager</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateNew}>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredMyTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMyTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isOwner={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No templates match your search.' : 'You haven\'t created any templates yet.'}
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="public-templates" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredPublicTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPublicTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isOwner={template.user_id === user.id}
                    onEdit={template.user_id === user.id ? handleEdit : undefined}
                    onDelete={template.user_id === user.id ? handleDelete : undefined}
                    onView={handleView}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No public templates match your search.' : 'No public templates available yet.'}
                </p>
              </div>
            )}
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