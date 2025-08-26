// Testing Task Tags
export const TESTING_TASK_TAGS = [
  'write-unit-test',
  'write-integration-test',
  'write-acceptance-test',
  'fix-failing-test',
  'improve-test-coverage',
  'refactor-test-code',
  'mock-dependencies',
  'test-edge-cases',
  'performance-testing',
  'security-testing'
] as const;

// Code Quality Task Tags
export const QUALITY_TASK_TAGS = [
  'remove-duplicate-code',
  'extract-method',
  'extract-class',
  'simplify-conditional',
  'improve-naming',
  'reduce-method-size',
  'remove-dead-code',
  'fix-code-smells',
  'improve-readability',
  'add-documentation'
] as const;

// Refactoring Task Tags
export const REFACTORING_TASK_TAGS = [
  'extract-interface',
  'introduce-parameter-object',
  'replace-magic-numbers',
  'move-method',
  'move-field',
  'inline-method',
  'replace-conditional-with-polymorphism',
  'compose-method',
  'encapsulate-field',
  'replace-inheritance-with-delegation'
] as const;

// Agile Development Task Tags
export const AGILE_TASK_TAGS = [
  'pair-programming',
  'code-review',
  'continuous-integration',
  'small-refactor',
  'simple-design',
  'collective-ownership',
  'sustainable-pace',
  'technical-debt',
  'spike-solution',
  'refactor-before-adding'
] as const;

// Lean Development Task Tags
export const LEAN_TASK_TAGS = [
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
export type TaskTag = 
  | typeof TESTING_TASK_TAGS[number]
  | typeof QUALITY_TASK_TAGS[number]
  | typeof REFACTORING_TASK_TAGS[number]
  | typeof AGILE_TASK_TAGS[number]
  | typeof LEAN_TASK_TAGS[number];

// Tag categories for organization
export interface TagCategories {
  testing: typeof TESTING_TASK_TAGS;
  quality: typeof QUALITY_TASK_TAGS;
  refactoring: typeof REFACTORING_TASK_TAGS;
  agile: typeof AGILE_TASK_TAGS;
  lean: typeof LEAN_TASK_TAGS;
}

export const TAG_CATEGORIES: TagCategories = {
  testing: TESTING_TASK_TAGS,
  quality: QUALITY_TASK_TAGS,
  refactoring: REFACTORING_TASK_TAGS,
  agile: AGILE_TASK_TAGS,
  lean: LEAN_TASK_TAGS
};