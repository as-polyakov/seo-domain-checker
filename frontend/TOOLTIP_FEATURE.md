# Critical Violations Tooltip Feature

## Overview

When a domain has a **"Reject"** status, hovering over the status badge will display a tooltip showing which rules triggered the rejection (rules with `critical_violation` set to true).

## How It Works

### 1. Data Collection (App.tsx)
When fetching analysis results from the API:
- Scans all rules in `rules_results` for each domain
- Identifies rules where `critical_violation === true`
- Converts rule names from camelCase to readable format
- Stores them in the `criticalViolations` array

**Example transformation:**
```
DomainRatingRule → Domain Rating
ForbiddenWordsBacklinksRule → Forbidden Words Backlinks
SpamWordsAnchorsRule → Spam Words Anchors
```

### 2. Tooltip Display (AnalysisResults.tsx)
When hovering over a "Reject" status badge:
- A dark tooltip appears above the badge
- Lists all critical violations with bullet points
- Styled with rose/red accent colors for emphasis
- Positioned with a small arrow pointing to the badge

## Visual Example

```
┌─────────────────────────────────────┐
│  Critical Violations:               │
│  • Domain Rating                    │
│  • Forbidden Words Backlinks        │
│  • Spam Words Anchors              │
└─────────────────┬───────────────────┘
                  ▼
              [ Reject ]  ← hover here
```

## Technical Details

### Type Definition (types.ts)
```typescript
export interface DomainData {
  // ... other fields
  criticalViolations?: string[]; // Rules that triggered rejection
}
```

### Data Transformation (App.tsx)
```typescript
// Find all rules with critical violations
const criticalViolations: string[] = [];
Object.entries(dr.rules_results).forEach(([ruleName, ruleData]: [string, any]) => {
  if (ruleData.critical_violation) {
    const readableName = ruleName
      .replace(/Rule$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    criticalViolations.push(readableName);
  }
});
```

### Tooltip Component (AnalysisResults.tsx)
```tsx
<div className="relative group inline-block">
  <Badge tone="rose">Reject</Badge>
  {d.status === 'Reject' && d.criticalViolations && (
    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 w-64">
      <div className="bg-slate-900 text-white text-xs rounded-lg shadow-xl p-3">
        <div className="font-semibold mb-2 text-rose-300">Critical Violations:</div>
        <ul>
          {d.criticalViolations.map(rule => (
            <li>• {rule}</li>
          ))}
        </ul>
      </div>
    </div>
  )}
</div>
```

## Styling

- **Background**: Dark slate-900 for contrast
- **Text**: White with rose accents
- **Border**: Subtle slate-700
- **Shadow**: XL shadow for depth
- **Arrow**: Small triangle pointing down to badge
- **Width**: Fixed 256px (w-64) for consistent sizing
- **Z-index**: 50 to ensure it appears above other elements

## Benefits

✅ **Immediate Insight**: Users can see why a domain was rejected without digging through details  
✅ **Hover Interaction**: Non-intrusive, appears only when needed  
✅ **Multiple Violations**: Shows all critical violations at once  
✅ **Readable Names**: Converts technical rule names to human-friendly format  
✅ **Visual Hierarchy**: Rose/red colors emphasize severity  
✅ **No Extra Clicks**: Information available without expanding rows  

## Usage

1. Navigate to the Analysis Results page
2. Find a domain with "Reject" status (red badge)
3. Hover your mouse over the "Reject" badge
4. View the tooltip showing which rules caused the rejection

## Example Scenarios

**Scenario 1: Single Violation**
```
Reject badge hover shows:
• Forbidden Words Backlinks
```

**Scenario 2: Multiple Violations**
```
Reject badge hover shows:
• Domain Rating
• Spam Words Anchors
• Forbidden Words Organic Keywords
```

**Scenario 3: No Violations (should not happen)**
```
If status is "Reject" but no critical violations are found,
the tooltip will not display (defensive programming)
```

## Future Enhancements

Potential improvements:
- Click to lock tooltip open
- Show violation details/values
- Link to expand domain row for more info
- Mobile-friendly touch interaction
- Different colors for different violation types

