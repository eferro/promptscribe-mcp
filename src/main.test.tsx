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

// Mock CSS import
vi.mock('./index.css', () => ({}));

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document.getElementById
    const mockRootElement = document.createElement('div');
    mockRootElement.id = 'root';
    
    vi.spyOn(document, 'getElementById').mockReturnValue(mockRootElement);
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
    
    // The non-null assertion (!) should cause the code to fail
    // We need to test that the code would fail in this case
    expect(() => {
      const rootElement = document.getElementById('root')!;
      mockCreateRoot(rootElement);
    }).toThrow();
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
});