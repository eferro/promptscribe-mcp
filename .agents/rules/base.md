# Test-Driven Development and Kent Beck Methodology

## 1. Core TDD Cycle - Always Follow Red → Green → Refactor

### Red Phase
- Write the simplest failing test first that defines a small increment of functionality
- Use meaningful test names that describe behavior (e.g., "shouldSumTwoPositiveNumbers")
- Make test failures clear and informative
- Only write ONE test at a time - never multiple tests simultaneously

### Green Phase  
- Implement the minimum code needed to make the test pass - no more
- Write just enough code to make the test pass
- Resist the urge to implement additional functionality beyond what the test requires

### Refactor Phase
- Refactor only after tests are passing
- Make structural improvements while maintaining behavior
- Run tests after each refactoring step to ensure behavior is preserved

## 2. Plan.md Integration

- Always follow the instructions in plan.md
- When instructed to "go", find the next unmarked test in plan.md
- Implement that specific test, then implement only enough code to make it pass
- Mark completed tests in plan.md before proceeding

## 3. Tidy First Approach - Separate Structural from Behavioral Changes

### Two Distinct Types of Changes

**STRUCTURAL CHANGES (Tidy First):**
- Rearranging code without changing behavior
- Renaming variables, methods, classes
- Extracting methods or classes
- Moving code to different locations
- Improving code organization

**BEHAVIORAL CHANGES:**
- Adding new functionality
- Modifying existing functionality
- Changing how the system behaves

### Tidy First Rules
- **Never mix structural and behavioral changes in the same commit**
- Always make structural changes first when both types are needed
- Validate structural changes do not alter behavior by running ALL tests before and after
- Commit structural changes separately from behavioral changes

## 4. Commit Discipline - Only Commit When Ready

### Commit Prerequisites
Only commit when ALL of the following are true:
1. ALL tests are passing
2. ALL compiler/linter warnings have been resolved  
3. The change represents a single logical unit of work
4. Commit message clearly states whether the commit contains structural or behavioral changes

### Commit Practices
- Use small, frequent commits rather than large, infrequent ones
- Each commit should represent a complete TDD cycle or a complete structural improvement
- Write clear commit messages that distinguish between structural and behavioral changes

## 5. Code Quality Standards - Non-Negotiable Requirements

### Quality Principles
- Eliminate duplication ruthlessly - DRY principle
- Express intent clearly through naming and structure
- Make dependencies explicit and visible
- Keep methods small and focused on a single responsibility
- Minimize state and side effects where possible
- Use the simplest solution that could possibly work

### Refactoring Guidelines
- Refactor only when tests are passing (Green phase)
- Use established refactoring patterns with their proper names
- Make one refactoring change at a time
- Run tests after each refactoring step
- Prioritize refactorings that remove duplication or improve clarity

## 6. Test Execution Requirements

### Test Running Protocol
- Always run ALL tests (except long-running tests) after each change
- Run tests before and after structural changes to verify behavior preservation
- Never proceed to the next step if any tests are failing
- Use the project's make targets for test execution (e.g., `make test-unit`)

### Test Quality Standards
- One test at a time - never write multiple tests simultaneously
- Tests should be small, focused, and test one specific behavior
- Test names should clearly describe the expected behavior
- Tests should be independent and not rely on execution order

## 7. Development Workflow Example

### Step-by-Step Process
1. **Read plan.md** - Find the next unmarked test to implement
2. **Write failing test** - Create one simple test for a small increment
3. **Run tests** - Confirm the new test fails (Red)
4. **Implement minimum code** - Write just enough to make the test pass
5. **Run all tests** - Confirm all tests pass (Green)
6. **Refactor if needed** - Make structural improvements (Tidy First)
7. **Run tests again** - Ensure refactoring didn't break anything
8. **Commit changes** - Separate commits for structural vs behavioral changes
9. **Mark test complete** - Update plan.md to show progress
10. **Repeat** - Move to next unmarked test in plan.md

### Workflow Discipline
- Never skip the Red phase - always start with a failing test
- Never implement more functionality than required by the current test
- Never refactor when tests are failing
- Never mix structural and behavioral changes in the same commit
- Always run the full test suite after changes

## 8. Anti-Patterns to Avoid

### Common Mistakes
- Writing multiple tests before implementing any code
- Implementing functionality beyond what the current test requires
- Refactoring while tests are failing
- Mixing structural and behavioral changes in one commit
- Skipping test runs between changes
- Writing tests that are too broad or test multiple behaviors
- Proceeding when any tests are failing

### Quality Violations
- Methods longer than necessary for their single responsibility
- Duplicate code that should be extracted
- Unclear naming that doesn't express intent
- Hidden dependencies or side effects
- Overly complex solutions when simpler ones would work

## 9. Success Metrics

### Development Health Indicators
- All tests consistently passing
- Small, frequent commits with clear messages
- Clean separation between structural and behavioral changes
- Steady progress through plan.md items
- Code that is easy to read and understand
- Minimal duplication across the codebase
- Methods that are small and focused

## 10. Language Policy

- Communication with the user may be in Spanish or English.
- All code artifacts must be in English:
  - Identifiers (variables, functions, classes), comments, and in-code strings (unless explicitly specified otherwise by product requirements).
  - Commit messages, branch names, PR titles/descriptions.
  - Documentation, READMEs, ADRs, and any developer-facing text.
- If user-provided examples arrive in Spanish, translate/adapt them to English when integrating into code or docs.

This methodology ensures high-quality, well-tested code through disciplined development practices and clear separation of concerns.