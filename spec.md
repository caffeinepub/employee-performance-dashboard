# Employee Performance Dashboard

## Current State
Dashboard shows Issues and Suggestions from a static TypeScript file (`staticIssuesSuggestions.ts`). To add entries, the developer must manually edit that file and redeploy.

## Requested Changes (Diff)

### Add
- `SuggestionsIssues` module: full-page view with two panels (Suggestions + Issues)
- "Add Suggestion" dialog: Title (required), Description fields, Save button (brown/gold)
- "Add Issue" dialog: Title (required), Category dropdown (FSE General Issues, Brand Issues, Operational Issues, Other), Description fields, Save button (red)
- localStorage persistence for both Suggestions and Issues (keyed `app_suggestions` / `app_issues`)
- Toast feedback on save success/failure
- Empty states per spec
- Sidebar navigation entry for the new module

### Modify
- Dashboard Issues/Suggestions panels: read from localStorage (merged with existing static seed data on first load)
- Header to show "Suggestions & Issues" label for the new module

### Remove
- Nothing removed; static seed data kept as initial localStorage seed

## Implementation Plan
1. Create `src/frontend/src/modules/SuggestionsIssues.tsx` with two panels, dialogs, localStorage CRUD, toasts
2. Update `App.tsx` to add `suggestions` module case
3. Update `Sidebar.tsx` to add navigation item
4. Update `Header.tsx` to handle module label
5. Update `Dashboard.tsx` to read Issues/Suggestions from localStorage
