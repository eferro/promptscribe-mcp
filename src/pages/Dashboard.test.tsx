import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { fetchUserTemplates, fetchPublicTemplates, deleteTemplate } from '@/services/templateServiceAdapter';

vi.mock('@/services/templateServiceAdapter', () => ({
  fetchUserTemplates: vi.fn(),
  fetchPublicTemplates: vi.fn(),
  deleteTemplate: vi.fn(),
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

// Mock the template components
vi.mock('@/components/templates/TemplateEditor', () => ({
  default: ({ onSave, onCancel }: any) => (
    <div data-testid="template-editor">
      <button onClick={onSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

vi.mock('@/components/templates/TemplateViewer', () => ({
  default: ({ onBack, onEdit }: any) => (
    <div data-testid="template-viewer">
      <button onClick={onBack}>Back</button>
      <button onClick={() => onEdit(mockTemplate)}>Edit</button>
    </div>
  )
}));

vi.mock('@/components/templates/TemplateCard', () => ({
  default: ({ template, onEdit, onDelete, onView }: any) => (
    <div data-testid={`template-card-${template.id}`}>
      <h3>{template.name}</h3>
      <button onClick={() => onView(template)}>View</button>
      {onEdit && <button onClick={() => onEdit(template)}>Edit</button>}
      {onDelete && <button onClick={() => onDelete(template)}>Delete</button>}
    </div>
  )
}));

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z'
};

const mockTemplate = {
  id: 'template-1',
  name: 'Test Template',
  description: 'A test template',
  template_data: { arguments: [], messages: [] },
  is_public: true,
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  user_id: 'user-123'
};

const mockOnSignOut = vi.fn();

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchUserTemplates).mockResolvedValue({ data: [mockTemplate], error: null });
    vi.mocked(fetchPublicTemplates).mockResolvedValue({ data: [mockTemplate], error: null });
    vi.mocked(deleteTemplate).mockResolvedValue({ error: null });
  });

  it('renders dashboard header with user email', async () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    expect(screen.getByText('MCP Prompt Manager')).toBeInTheDocument();
    expect(screen.getByText(`Welcome, ${mockUser.email}`)).toBeInTheDocument();
    expect(screen.getByText('New Template')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
  });

  it('renders tabs for my templates and public templates', async () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    await waitFor(() => {
      expect(screen.getByText(/My Templates/)).toBeInTheDocument();
      expect(screen.getByText(/Public Templates/)).toBeInTheDocument();
    });
  });

  it('handles new template creation', () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    fireEvent.click(screen.getByText('New Template'));
    expect(screen.getByTestId('template-editor')).toBeInTheDocument();
  });

  it('filters templates by search query', async () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    await waitFor(() => {
      expect(screen.getByTestId(`template-card-${mockTemplate.id}`)).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByPlaceholderText('Search templates...'), {
      target: { value: 'nonexistent' }
    });
    
    expect(screen.queryByTestId(`template-card-${mockTemplate.id}`)).not.toBeInTheDocument();
  });

  it('handles template editing', async () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    await waitFor(() => {
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
    });
    
    expect(screen.getByTestId('template-editor')).toBeInTheDocument();
  });

  it('handles template viewing', async () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    await waitFor(() => {
      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);
    });
    
    expect(screen.getByTestId('template-viewer')).toBeInTheDocument();
  });

  it('handles template deletion with confirmation', async () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: 'Delete Template' });
      fireEvent.click(confirmButton);
    });

    expect(deleteTemplate).toHaveBeenCalled();
  });

  it('cancels template deletion when user declines confirmation', async () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
    });

    expect(deleteTemplate).not.toHaveBeenCalled();
  });

  it('handles sign out', () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockOnSignOut).toHaveBeenCalled();
  });

  it('returns to dashboard from editor', async () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    fireEvent.click(screen.getByText('New Template'));
    expect(screen.getByTestId('template-editor')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('template-editor')).not.toBeInTheDocument();
      expect(screen.getByText('MCP Prompt Manager')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    // During initial render, loading skeleton should be visible
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });


  it('handles save action correctly', async () => {
    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);
    
    // Navigate to editor
    fireEvent.click(screen.getByText('New Template'));
    expect(screen.getByTestId('template-editor')).toBeInTheDocument();
    
    // Trigger save (lines 120-122)
    fireEvent.click(screen.getByText('Save'));
    
    // Should return to dashboard and refetch templates
    await waitFor(() => {
      expect(screen.queryByTestId('template-editor')).not.toBeInTheDocument();
      expect(screen.getByText('MCP Prompt Manager')).toBeInTheDocument();
    });
  });
  it('handles delete template errors', async () => {
    vi.mocked(deleteTemplate).mockResolvedValue({ error: new Error('Database connection failed') });

    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: 'Delete Template' });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete template",
      });
    });
  });

  it('handles template fetch errors on initialization', async () => {
    vi.mocked(fetchUserTemplates).mockResolvedValue({ data: null, error: new Error('Network timeout') });

    render(<Dashboard user={mockUser} onSignOut={mockOnSignOut} />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Error",
        description: "Failed to load templates",
      });
    });
  });
});
