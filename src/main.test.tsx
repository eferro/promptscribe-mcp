import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react-dom/client
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender
}));

vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot
}));

// Mock the App component
vi.mock('./App.tsx', () => ({
  default: () => 'App Component'
}));

// Mock the ErrorBoundary component
vi.mock('./components/ErrorBoundary.tsx', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children
}));

// Mock CSS import
vi.mock('./index.css', () => ({}));

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document.getElementById
    const mockRootElement = document.createElement('div');
    mockRootElement.id = 'root';
    
    vi.spyOn(document, 'getElementById').mockReturnValue(mockRootElement);
    
    // Reset the module cache to allow re-execution
    vi.resetModules();
  });

  it('creates root and renders App component', async () => {
    // Import main.tsx to execute the code
    await import('./main.tsx');
    
    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(mockCreateRoot).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    expect(mockRender).toHaveBeenCalledWith(expect.anything());
  });

  it('throws error if root element is not found', async () => {
    // Mock getElementById to return null
    vi.spyOn(document, 'getElementById').mockReturnValue(null);
    
    // Mock createRoot to throw error when called with null (as it would in reality)
    mockCreateRoot.mockImplementation((element) => {
      if (!element) {
        throw new Error('Cannot read properties of null');
      }
      return { render: mockRender };
    });
    
    // Importing main.tsx should throw an error when root element is null
    await expect(() => import('./main.tsx')).rejects.toThrow('Cannot read properties of null');
  });

  it('uses correct root element selector', async () => {
    await import('./main.tsx');
    
    expect(document.getElementById).toHaveBeenCalledWith('root');
  });

  it('calls createRoot with the found element', async () => {
    const mockElement = document.createElement('div');
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
    
    await import('./main.tsx');
    
    expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);
  });

  it('renders the App component after creating root', async () => {
    await import('./main.tsx');
    
    expect(mockCreateRoot).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
    
    // Verify the order of operations
    expect(mockCreateRoot).toHaveBeenCalledBefore(mockRender);
  });

  it('wraps App component with ErrorBoundary', async () => {
    await import('./main.tsx');
    
    expect(mockRender).toHaveBeenCalled();
    
    // Get the rendered component
    const renderedComponent = mockRender.mock.calls[0][0];
    
    // Should be wrapped with ErrorBoundary (mocked as identity function)
    // Since ErrorBoundary is mocked to return children directly, 
    // we check that it was called with the correct structure
    expect(renderedComponent.type.name).toBe('ErrorBoundary');
    expect(renderedComponent.props).toHaveProperty('children');
    expect(renderedComponent.props.children.type).toBeDefined();
  });
});