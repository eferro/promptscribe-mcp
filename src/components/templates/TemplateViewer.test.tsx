import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TemplateViewer from './TemplateViewer';
import { useToast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';

// Mock dependencies
vi.mock("@/hooks/use-toast");

const mockToast = vi.fn();
const mockOnBack = vi.fn();
const mockOnEdit = vi.fn();

const mockUser: User = {
  id: 'user123',
  email: 'test@example.com'
} as User;

const mockTemplate = {
  id: '123',
  name: 'Test Template',
  description: 'Test description for the template',
  template_data: {
    name: 'Test Template',
    description: 'Test description',
    arguments: [
      { name: 'topic', description: 'The topic to discuss', required: true, type: 'string' },
      { name: 'style', description: 'Writing style', required: false }
    ],
    messages: [
      { role: 'user', content: 'Tell me about {{topic}} in {{style}} style' },
      { role: 'assistant', content: 'I will discuss {{topic}} using a {{style}} approach.' }
    ]
  },
  is_public: true,
  created_at: '2023-01-15T10:30:00Z',
  updated_at: '2023-01-16T14:45:00Z',
  user_id: 'user123'
};

const mockTemplateOtherUser = {
  ...mockTemplate,
  user_id: 'other_user'
};

const mockPrivateTemplate = {
  ...mockTemplate,
  is_public: false
};

const mockTemplateNoArguments = {
  ...mockTemplate,
  template_data: {
    ...mockTemplate.template_data,
    arguments: []
  }
};

const mockTemplateMinimal = {
  id: '456',
  name: 'Minimal Template',
  description: null,
  template_data: {
    name: 'Minimal Template',
    description: '',
    arguments: [],
    messages: [
      { role: 'user', content: 'Simple message' }
    ]
  },
  is_public: false,
  created_at: '2023-02-01T08:00:00Z',
  updated_at: '2023-02-01T08:00:00Z',
  user_id: 'user123'
};

// Mock clipboard API
const writeTextMock = vi.fn().mockImplementation(() => Promise.resolve());
Object.assign(navigator, {
  clipboard: {
    writeText: writeTextMock,
  },
});

describe('TemplateViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeTextMock.mockClear();
    vi.mocked(useToast).mockReturnValue({ toast: mockToast });
  });

  it('renders template viewer with all components', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('Test description for the template')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Template Info')).toBeInTheDocument();
    expect(screen.getByText('Arguments')).toBeInTheDocument();
    expect(screen.getByText('Template JSON')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    await user.click(screen.getByText('Back'));
    expect(mockOnBack).toHaveBeenCalledOnce();
  });

  it('shows edit button for template owner', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('hides edit button for non-owner', () => {
    render(
      <TemplateViewer 
        template={mockTemplateOtherUser}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    await user.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTemplate);
  });

  it('does not show edit button when onEdit is not provided', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
      />
    );
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('displays private badge for private templates', () => {
    render(
      <TemplateViewer 
        template={mockPrivateTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.queryByText('Public')).not.toBeInTheDocument();
  });

  it('displays formatted creation date', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText(/January 15, 2023/)).toBeInTheDocument();
  });

  it('displays formatted update date', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText(/January 16, 2023/)).toBeInTheDocument();
  });

  it('displays argument statistics correctly', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('Arguments: 2')).toBeInTheDocument();
    expect(screen.getByText('Messages: 2')).toBeInTheDocument();
  });

  it('displays argument details', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('topic')).toBeInTheDocument();
    expect(screen.getByText('The topic to discuss')).toBeInTheDocument();
    expect(screen.getByText('style')).toBeInTheDocument();
    expect(screen.getByText('Writing style')).toBeInTheDocument();
    expect(screen.getByText('string')).toBeInTheDocument();
  });

  it('hides arguments section when template has no arguments', () => {
    render(
      <TemplateViewer 
        template={mockTemplateNoArguments}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
    expect(screen.getByText('Arguments: 0')).toBeInTheDocument();
  });

  it('displays template JSON correctly', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    const jsonDisplay = screen.getByText(/"name": "Test Template"/);
    expect(jsonDisplay).toBeInTheDocument();
  });

  it('shows success toast when copy button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    await user.click(screen.getByText('Copy'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Copied!",
        description: "Template JSON copied to clipboard"
      });
    });
  });

  it('displays messages preview', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('Messages Preview')).toBeInTheDocument();
    expect(screen.getByText('Tell me about {{topic}} in {{style}} style')).toBeInTheDocument();
    expect(screen.getByText('I will discuss {{topic}} using a {{style}} approach.')).toBeInTheDocument();
  });

  it('displays message roles correctly', () => {
    render(
      <TemplateViewer 
        template={mockTemplate}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    // Look specifically for role badges
    const userRoleLabels = screen.getAllByText('user');
    const assistantRoleLabels = screen.getAllByText('assistant');
    expect(userRoleLabels.length + assistantRoleLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('handles template with null description', () => {
    render(
      <TemplateViewer 
        template={mockTemplateMinimal}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('No description provided')).toBeInTheDocument();
  });

  it('handles template with minimal data', () => {
    render(
      <TemplateViewer 
        template={mockTemplateMinimal}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('Minimal Template')).toBeInTheDocument();
    expect(screen.getByText('Arguments: 0')).toBeInTheDocument();
    expect(screen.getByText('Messages: 1')).toBeInTheDocument();
    expect(screen.getByText('Simple message')).toBeInTheDocument();
  });

  it('handles template data without arguments array', () => {
    const templateWithoutArgs = {
      ...mockTemplate,
      template_data: {
        name: 'Test Template',
        messages: [{ role: 'user', content: 'Test message' }]
      }
    };

    render(
      <TemplateViewer 
        template={templateWithoutArgs}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('Arguments: 0')).toBeInTheDocument();
  });

  it('handles template data without messages array', () => {
    const templateWithoutMessages = {
      ...mockTemplate,
      template_data: {
        name: 'Test Template',
        arguments: []
      }
    };

    render(
      <TemplateViewer 
        template={templateWithoutMessages}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('Messages: 0')).toBeInTheDocument();
  });

  it('handles argument without type field', () => {
    const templateWithArgNoType = {
      ...mockTemplate,
      template_data: {
        ...mockTemplate.template_data,
        arguments: [
          { name: 'topic', description: 'The topic to discuss', required: true }
        ]
      }
    };

    render(
      <TemplateViewer 
        template={templateWithArgNoType}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('topic')).toBeInTheDocument();
    expect(screen.getByText('The topic to discuss')).toBeInTheDocument();
    // Should not show any type badge
    expect(screen.queryByText('string')).not.toBeInTheDocument();
  });

  it('handles argument without description', () => {
    const templateWithArgNoDesc = {
      ...mockTemplate,
      template_data: {
        ...mockTemplate.template_data,
        arguments: [
          { name: 'topic', required: true, type: 'string' }
        ]
      }
    };

    render(
      <TemplateViewer 
        template={templateWithArgNoDesc}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.getByText('topic')).toBeInTheDocument();
    expect(screen.getByText('string')).toBeInTheDocument();
    // Description should not be displayed
  });

  it('hides messages preview when template has no messages', () => {
    const templateWithoutMessages = {
      ...mockTemplate,
      template_data: {
        ...mockTemplate.template_data,
        messages: []
      }
    };

    render(
      <TemplateViewer 
        template={templateWithoutMessages}
        user={mockUser}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
      />
    );
    
    expect(screen.queryByText('Messages Preview')).not.toBeInTheDocument();
  });
});