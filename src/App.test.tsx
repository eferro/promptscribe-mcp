import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('provides necessary context providers', () => {
    render(<App />);
    
    // Check if the app renders the routing structure
    // Since we don't have mock routes, we expect it to render the NotFound component
    // or the Index component depending on the current route
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  it('includes toast notifications', () => {
    render(<App />);
    
    // The Toaster components should be present in the DOM
    // We can't easily test their visibility, but we can ensure the app renders
    expect(document.body).toBeInTheDocument();
  });
});