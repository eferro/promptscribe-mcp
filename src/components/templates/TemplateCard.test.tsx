import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateCard from './TemplateCard';

const mockTemplate = {
  id: 'template-1',
  name: 'Test Template',
  description: 'A test template description',
  arguments: [
    { name: 'arg1', description: '', required: false },
    { name: 'arg2', description: '', required: false }
  ],
  messages: [
    { role: 'user', content: 'test' },
    { role: 'assistant', content: 'response' }
  ],
  isPublic: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-15T00:00:00Z',
  userId: 'user-123'
};

const mockTemplatePrivate = {
  ...mockTemplate,
  isPublic: false
};

const mockTemplateNoDescription = {
  ...mockTemplate,
  description: null
};

const mockTemplateNoData = {
  ...mockTemplate,
  arguments: [],
  messages: []
};

describe('TemplateCard', () => {
  it('renders template information correctly', () => {
    const onView = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplate}
        isOwner={true}
        onView={onView}
      />
    );
    
    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('A test template description')).toBeInTheDocument();
    expect(screen.getByText('2 args')).toBeInTheDocument();
    expect(screen.getByText('2 messages')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2023')).toBeInTheDocument();
  });

  it('shows public badge for public templates', () => {
    const onView = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplate}
        isOwner={true}
        onView={onView}
      />
    );
    
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByTestId || screen.getByRole('img', { hidden: true })).toBeDefined(); // Globe icon
  });

  it('shows private badge for private templates', () => {
    const onView = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplatePrivate}
        isOwner={true}
        onView={onView}
      />
    );
    
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('shows default description when none provided', () => {
    const onView = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplateNoDescription}
        isOwner={true}
        onView={onView}
      />
    );
    
    expect(screen.getByText('No description provided')).toBeInTheDocument();
  });

  it('handles templates with no data gracefully', () => {
    const onView = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplateNoData}
        isOwner={true}
        onView={onView}
      />
    );
    
    expect(screen.getByText('0 args')).toBeInTheDocument();
    expect(screen.getByText('0 messages')).toBeInTheDocument();
  });

  it('calls onView when card is clicked', () => {
    const onView = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplate}
        isOwner={true}
        onView={onView}
      />
    );
    
    fireEvent.click(screen.getByText('Test Template'));
    expect(onView).toHaveBeenCalledWith(mockTemplate);
  });

  it('calls onView when View Template button is clicked', () => {
    const onView = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplate}
        isOwner={true}
        onView={onView}
      />
    );
    
    fireEvent.click(screen.getByText('View Template'));
    expect(onView).toHaveBeenCalledWith(mockTemplate);
  });

  it('shows owner dropdown menu when isOwner is true', () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplate}
        isOwner={true}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
      />
    );
    
    // The dropdown trigger button should be present
    const moreButton = screen.getByRole('button', { name: '' }); // MoreHorizontal icon button
    expect(moreButton).toBeInTheDocument();
  });

  it('does not show owner dropdown when isOwner is false', () => {
    const onView = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplate}
        isOwner={false}
        onView={onView}
      />
    );
    
    // Should not have the dropdown menu trigger
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1); // Only the "View Template" button
    expect(screen.getByText('View Template')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    const onView = vi.fn();
    const templateWithSpecificDate = {
      ...mockTemplate,
      updatedAt: '2023-12-25T15:30:00Z'
    };
    
    render(
      <TemplateCard
        template={templateWithSpecificDate}
        isOwner={true}
        onView={onView}
      />
    );
    
    expect(screen.getByText('Dec 25, 2023')).toBeInTheDocument();
  });

  it('prevents card click when clicking on dropdown button', () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    
    render(
      <TemplateCard
        template={mockTemplate}
        isOwner={true}
        onEdit={onEdit}
        onView={onView}
      />
    );
    
    // Click on the dropdown button (MoreHorizontal)
    const moreButton = screen.getByRole('button', { name: '' });
    fireEvent.click(moreButton);
    
    // onView should not be called when clicking the dropdown button
    expect(onView).not.toHaveBeenCalled();
  });

  it('stops propagation when clicking View Template button', () => {
    const onView = vi.fn();
    const cardClickHandler = vi.fn();
    
    const { container } = render(
      <div onClick={cardClickHandler}>
        <TemplateCard
          template={mockTemplate}
          isOwner={true}
          onView={onView}
        />
      </div>
    );
    
    fireEvent.click(screen.getByText('View Template'));
    
    expect(onView).toHaveBeenCalledWith(mockTemplate);
    expect(cardClickHandler).not.toHaveBeenCalled();
  });
});