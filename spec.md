# Employee Performance Dashboard

## Current State
Full-stack app with Dashboard, Employees (table + profile), Sales Trends, Feedback, and Settings modules. Backend has Employee, Performance, SWOT, SalesRecord, Attendance, FeedbackEntry types. No TopPerformer entity or uploads module exists yet.

## Requested Changes (Diff)

### Add
- `TopPerformer` type in backend: rank, fiplCode, name, accessories, extendedWarranty, totalSales
- `batchTopPerformersUpload` endpoint: accepts array of TopPerformer records, validates FIPL exists, upserts by rank, returns success/failure counts
- `getTopPerformers` query: returns all stored TopPerformer records sorted by totalSales descending
- Frontend "Top Performers" (uploads) module page with:
  - Table showing top 10 performers with columns: Rank, Name, FIPL Code, Accessories Units, Extended Warranty Units, Total Sales Amount (₹), Region (fetched from employee data)
  - Gold/silver/bronze row highlights for ranks 1/2/3
  - File upload area accepting .xlsx and .csv
  - Preview table after file parsing, red-highlighted invalid rows with error reasons
  - "Confirm & Save" button for batch upload
  - Post-upload toast: "X rows uploaded successfully, Y failed"
  - Empty state when no data
- Sidebar updated to include "Top Performers" navigation item

### Modify
- Sidebar: add "uploads" as a Module type and nav item (Trophy icon)
- App.tsx: add case for "uploads" rendering TopPerformers module

### Remove
- Nothing

## Implementation Plan
1. Add TopPerformer type and batchTopPerformersUpload + getTopPerformers to Motoko backend
2. Frontend TopPerformers module: xlsx/csv parsing via SheetJS (xlsx package), strict column validation, preview with error rows, batch save, display table with rank highlights and region lookup
3. Wire into Sidebar and App.tsx routing
