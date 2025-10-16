# Frontend Structure

The frontend has been refactored for better maintainability. Here's the new structure:

## Directory Layout

```
frontend/src/
├── App.tsx                          # Main app - routing & API logic
├── types.ts                         # Shared TypeScript interfaces
├── utils.ts                         # Helper functions
├── components/
│   ├── UIComponents.tsx             # Reusable UI components (Badge, Button, Input, etc.)
│   └── Sparkline.tsx                # Chart component
└── pages/
    ├── AnalysisDashboard.tsx        # Dashboard page with analysis list
    └── AnalysisResults.tsx          # Results page with domain analysis table
```

## Key Files

### App.tsx (Main Entry Point)
- **Purpose**: Application routing and API coordination
- **Responsibilities**:
  - View state management (dashboard vs results)
  - API calls to backend (`/api/analyses`, `/api/analyses-results/{id}`, `/api/startAnalysis`)
  - Data transformation from API to frontend format
  - Polling logic (only on dashboard view)

### types.ts
- **Purpose**: Centralized type definitions
- **Exports**:
  - `AnalysisStatus`, `DomainStatus` - Status enums
  - `DomainInput`, `Analysis`, `DomainData` - Data interfaces

### utils.ts
- **Purpose**: Helper functions used across the app
- **Exports**:
  - `cls()` - Utility for conditional classNames
  - `getSemaphoreColor()` - Score-to-color mapping (>60=green, 30-60=yellow, <30=red)
  - `priceNum()` - Parse price strings
  - `priceDecision()` - Pricing analysis

### components/UIComponents.tsx
- **Purpose**: Reusable UI building blocks
- **Exports**:
  - `Badge` - Status/info badges
  - `Button` - Styled buttons with variants
  - `Input` - Form inputs
  - `Checkbox` - Checkboxes
  - `VerseoLogo` - App logo component
  - `cls` - ClassName utility

### components/Sparkline.tsx
- **Purpose**: Traffic history visualization
- **Dependencies**: recharts library

### pages/AnalysisDashboard.tsx
- **Purpose**: Main dashboard showing all analyses
- **Features**:
  - Analysis list with status/progress
  - Stats overview (total, running, completed)
  - New analysis modal
  - Double-click to view results

### pages/AnalysisResults.tsx
- **Purpose**: Detailed domain analysis results
- **Features**:
  - Domain table with scores and metrics
  - Filtering and sorting
  - Expandable rows with detailed stats
  - Preview sidebar
  - Keyboard shortcuts (A=OK, S=Review, D=Reject, O=Open)
  - Dark mode toggle

## Data Flow

1. **Dashboard Load**:
   ```
   App → fetchAnalyses() → /api/analyses → AnalysisDashboard
   ```

2. **View Results**:
   ```
   AnalysisDashboard (click) → App.handleSelectAnalysis() → 
   fetchAnalysisResults() → /api/analyses-results/{id} → AnalysisResults
   ```

3. **Create Analysis**:
   ```
   AnalysisDashboard (modal) → App.handleNewAnalysis() → 
   POST /api/startAnalysis → fetchAnalyses()
   ```

## Benefits of This Structure

✅ **Separation of Concerns**: Pages, components, types, and utilities are clearly separated
✅ **Reusability**: UI components and utilities can be easily reused
✅ **Maintainability**: Each file has a single, clear purpose
✅ **Type Safety**: Centralized types ensure consistency
✅ **Testability**: Components can be tested in isolation
✅ **Scalability**: Easy to add new pages or components

## Future Improvements

- Add `components/modals/` for complex modals
- Add `hooks/` for custom React hooks
- Add `api/` for API client functions
- Add `constants/` for app-wide constants
- Consider state management library (Redux/Zustand) if app grows


