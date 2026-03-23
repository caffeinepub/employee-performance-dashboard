# Employee Performance Dashboard

## Current State
The app has 5 modules: Dashboard, Employees, Sales Trends, Feedback, Settings.
The Employees module currently shows employee cards with inline expanded detail panels (tabs for Performance, SWOT, Sales, Attendance, Feedback). Navigation is all within the Employees component.

## Requested Changes (Diff)

### Add
- Employee list as a scrollable TABLE with columns: Name + FIPL Code, Region, Efficiency Score (average of salesInfluenceIndex, operationalDiscipline, productKnowledgeScore, softSkillsScore, and reviewCount as a normalized score), Attendance % (daysOff ratio from attendance records), Total Sales (₹), Category (fseCategory badge)
- Search bar filtering by name or FIPL Code
- Filter dropdown for category (fseCategory)
- Row click → navigate to Employee Profile page
- Employee Profile page (new component: EmployeeProfile.tsx)
  - Top section: Avatar (initials-based), Name, FIPL Code, Efficiency Score, Category badge, Region
  - SWOT Analysis section
  - Performance Metrics section
  - Sales accordion (collapsed by default) → table of sales records
  - Attendance accordion (collapsed by default) → table of attendance records
  - Sales Trend chart (monthly bar/line chart)
  - Attendance chart (lapses vs days off bar chart)
- Back button on profile page to return to employees table

### Modify
- Employees.tsx: replace card/detail panel layout with the new table layout; keep existing add/edit/delete employee forms
- App.tsx: support routing between employee list and employee profile (via local state, no router library)

### Remove
- Inline expanded card detail panels from the employees list view (detail moved to profile page)

## Implementation Plan
1. Create EmployeeProfile.tsx with all sections: top card, SWOT, Performance Metrics, Sales accordion, Attendance accordion, Sales Trend chart, Attendance chart
2. Rewrite Employees.tsx to show a table with search + category filter, row click navigates to profile
3. Update App.tsx to handle selectedEmployee state and render EmployeeProfile when one is selected
4. Efficiency Score = average of (salesInfluenceIndex + operationalDiscipline + productKnowledgeScore + softSkillsScore + reviewCount normalized) from Performance data. If no perf data, show N/A.
5. Attendance % = (total days - total daysOff) / total days * 100. Computed from attendance records.
6. Total Sales = sum of amount from SalesRecord for that FIPL.
