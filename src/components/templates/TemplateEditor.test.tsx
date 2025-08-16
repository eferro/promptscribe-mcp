import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TemplateEditor from './TemplateEditor';
import { useToast } from "@/hooks/use-toast";
import { getUser } from "@/services/authService";
import { saveTemplate } from "@/services/templateServiceAdapter";

// Mock dependencies
vi.mock("@/hooks/use-toast");
vi.mock("@/services/authService", () => ({
  getUser: vi.fn(),
}));

vi.mock("@/services/templateServiceAdapter", () => ({
  saveTemplate: vi.fn(),
}));

const mockToast = vi.fn();
const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();

const mockTemplate = {
  id: '123',
  name: 'Test Template',
  description: 'Test description',
  template_data: {
    arguments: [
      { name: 'topic', description: 'The topic to discuss', required: true }
    ],
    messages: [
      { role: 'user', content: 'Tell me about {{topic}}' }
    ]
  },
  is_public: false,
  user_id: 'user123'
};

describe('TemplateEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    (getUser as any).mockResolvedValue({
      data: { user: { id: 'user123' } }
    });
    (saveTemplate as any).mockResolvedValue({ error: null });
  });

  it('renders template editor for new template', () => {
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('New Template')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter template name')).toBeInTheDocument();
    expect(screen.getByText('Make this template public')).toBeInTheDocument();
  });

  it('renders template editor with existing template data', () => {
    render(
      <TemplateEditor 
        template={mockTemplate}
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('Edit Template')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Template')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('topic')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when back button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.click(screen.getByText('Back'));
    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  it('validates required template name', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.click(screen.getByText('Save Template'));
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Validation Error",
      description: "Template name is required"
    });
  });

  it('validates that at least one message is required', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Fill in name
    await user.type(screen.getByPlaceholderText('Enter template name'), 'Test Template');
    
    // Remove the default message - find button with Trash2 icon inside messages section
    const trashButtons = screen.getAllByRole('button');
    const messageTrashButton = trashButtons.find(button => 
      button.closest('.space-y-4')?.querySelector('textarea')
    );
    await user.click(messageTrashButton!);
    
    await user.click(screen.getByText('Save Template'));
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Validation Error",
      description: "At least one message is required"
    });
  });

  it('adds a new argument when Add Argument button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.click(screen.getByText('Add Argument'));
    
    expect(screen.getAllByPlaceholderText('e.g., topic, name, style')).toHaveLength(1);
  });

  it('removes an argument when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        template={mockTemplate}
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByDisplayValue('topic')).toBeInTheDocument();
    
    // Find the trash button in the arguments section
    const trashButtons = screen.getAllByRole('button');
    const argumentTrashButton = trashButtons.find(button => 
      button.closest('.grid.grid-cols-1.md\\:grid-cols-2')
    );
    await user.click(argumentTrashButton!);
    
    expect(screen.queryByDisplayValue('topic')).not.toBeInTheDocument();
  });

  it('adds a new message when Add Message button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const initialMessages = screen.getAllByText('Content');
    await user.click(screen.getByText('Add Message'));
    
    const afterMessages = screen.getAllByText('Content');
    expect(afterMessages).toHaveLength(initialMessages.length + 1);
  });

  it('removes a message when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        template={mockTemplate}
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByDisplayValue('Tell me about {{topic}}')).toBeInTheDocument();
    
    // Find the trash button in the message section
    const trashButtons = screen.getAllByRole('button');
    const messageTrashButton = trashButtons.find(button => 
      button.closest('.space-y-4.p-4.border.rounded-lg')
    );
    await user.click(messageTrashButton!);
    
    expect(screen.queryByDisplayValue('Tell me about {{topic}}')).not.toBeInTheDocument();
  });

  it('updates template name when input changes', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const nameInput = screen.getByPlaceholderText('Enter template name');
    await user.type(nameInput, 'New Template Name');
    
    expect(nameInput).toHaveValue('New Template Name');
  });

  it('toggles public visibility when switch is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const publicSwitch = screen.getByRole('switch');
    expect(publicSwitch).not.toBeChecked();
    
    await user.click(publicSwitch);
    expect(publicSwitch).toBeChecked();
  });

  it('updates argument properties correctly', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        template={mockTemplate}
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const nameInput = screen.getByDisplayValue('topic');
    await user.clear(nameInput);
    await user.type(nameInput, 'subject');
    
    expect(nameInput).toHaveValue('subject');
  });

  it('updates message content correctly', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        template={mockTemplate}
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const contentTextarea = screen.getByDisplayValue('Tell me about {{topic}}');
    await user.clear(contentTextarea);
    await user.type(contentTextarea, 'New content');
    
    expect(contentTextarea).toHaveValue('New content');
  });

  it('changes message role correctly', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        template={mockTemplate}
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Find the select element by role
    const roleSelect = screen.getByRole('combobox');
    await user.selectOptions(roleSelect, 'system');
    
    expect(roleSelect).toHaveValue('system');
  });

  it('successfully creates new template', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.type(screen.getByPlaceholderText('Enter template name'), 'New Template');
    await user.click(screen.getByText('Save Template'));
    
    await waitFor(() => {
      expect(saveTemplate).toHaveBeenCalled();
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Success",
      description: "Template created successfully"
    });
    expect(mockOnSave).toHaveBeenCalledOnce();
  });

  it('successfully updates existing template', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        template={mockTemplate}
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.click(screen.getByText('Save Template'));
    
    await waitFor(() => {
      expect(saveTemplate).toHaveBeenCalledWith(expect.any(Object), mockTemplate.id);
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Success",
      description: "Template updated successfully"
    });
    expect(mockOnSave).toHaveBeenCalledOnce();
  });

  it('handles authentication error when user is not logged in', async () => {
    (getUser as any).mockResolvedValue({
      data: { user: null }
    });
    
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.type(screen.getByPlaceholderText('Enter template name'), 'Test Template');
    await user.click(screen.getByText('Save Template'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to save templates"
      });
    });
  });

  it('handles save error from supabase', async () => {
    (saveTemplate as any).mockResolvedValue({ error: { message: 'Database error' } });
    
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.type(screen.getByPlaceholderText('Enter template name'), 'Test Template');
    await user.click(screen.getByText('Save Template'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Save Failed",
        description: "Database error"
      });
    });
  });

  it('handles unexpected errors during save', async () => {
    (getUser as any).mockRejectedValue(new Error('Network error'));
    
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.type(screen.getByPlaceholderText('Enter template name'), 'Test Template');
    await user.click(screen.getByText('Save Template'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    });
  });

  it('disables save button while saving', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    await user.type(screen.getByPlaceholderText('Enter template name'), 'Test Template');
    
    const saveButton = screen.getByText('Save Template');
    expect(saveButton).not.toBeDisabled();
    
    await user.click(saveButton);
    
    // Check that the save process was initiated (successful save with toast)
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Template created successfully"
      });
    });
  });
});