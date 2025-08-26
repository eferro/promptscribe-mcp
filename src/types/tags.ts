// All available task tags in a flat list
export const ALL_TASK_TAGS = [
  // Testing Task Tags
  'write-unit-test',
  'write-integration-test',
  'write-acceptance-test',
  'fix-failing-test',
  'improve-test-coverage',
  'refactor-test-code',
  'mock-dependencies',
  'test-edge-cases',
  'performance-testing',
  'security-testing',
  
  // Code Quality Task Tags
  'remove-duplicate-code',
  'extract-method',
  'extract-class',
  'simplify-conditional',
  'improve-naming',
  'reduce-method-size',
  'remove-dead-code',
  'fix-code-smells',
  'improve-readability',
  'add-documentation',
  
  // Refactoring Task Tags
  'extract-interface',
  'introduce-parameter-object',
  'replace-magic-numbers',
  'move-method',
  'move-field',
  'inline-method',
  'replace-conditional-with-polymorphism',
  'compose-method',
  'encapsulate-field',
  'replace-inheritance-with-delegation',
  
  // Agile Development Task Tags
  'pair-programming',
  'code-review',
  'continuous-integration',
  'small-refactor',
  'simple-design',
  'collective-ownership',
  'sustainable-pace',
  'technical-debt',
  'spike-solution',
  'refactor-before-adding',
  
  // Lean Development Task Tags
  'eliminate-waste',
  'amplify-learning',
  'decide-late',
  'deliver-fast',
  'empower-team',
  'build-integrity',
  'see-whole',
  'continuous-improvement',
  'value-stream',
  'pull-system'
] as const;

// Combined type for all tags
export type TaskTag = typeof ALL_TASK_TAGS[number];

// Helper function to format tag display
export const formatTagDisplay = (tag: string): string => {
  return tag.replace(/-/g, ' ');
};

// Helper function to search tags
export const searchTags = (query: string): TaskTag[] => {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, '-');
  return ALL_TASK_TAGS.filter(tag => 
    tag.toLowerCase().includes(normalizedQuery) ||
    formatTagDisplay(tag).toLowerCase().includes(query.toLowerCase())
  );
};