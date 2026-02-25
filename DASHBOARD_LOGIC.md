# Dashboard Personalization Logic

The student dashboard now dynamically adapts based on the user's profile collected during the compulsory signup phase.

## Data Source
All personalization uses the `userProfile` object stored in `localStorage`.

## 1. Welcome Banner
- **Avatar:** Displays the first letter of the `username` (or `name` as fallback).
- **Greeting:** Displays the full `username`.
- **Tags:** The first tag is now the **Target Exam** selected by the user.

## 2. Target Exam Card
- **Exam Name:** Dynamically displays the user's selected `targetExam`.
- **Fallback:** If "Others" was selected, it displays the `customTargetExam` input.

## 3. Journey Stats
- **Total Journey Days:**
  - Calculated using `differenceInDays(today, preparationStartDate)`.
  - If you registered today, it shows 0.
  - If you selected a past date (e.g., started prep 2 months ago), it accurately reflects that duration.

## 4. Exam Category
- Used to filter relevant content (logic prepared in `StudentDashboard.tsx`).
- Variables `targetExamName` and `examCategoryName` are available for component use.

## Code Reference
```typescript
// src/pages/student/StudentDashboard.tsx

const [userProfile] = useLocalStorage<UserProfile>('userProfile', null);

// Journey Calculation
const journeyDays = userProfile?.preparationStartDate 
  ? differenceInDays(new Date(), new Date(userProfile.preparationStartDate))
  : 0;

// Dynamic Exam Name
const targetExamName = userProfile?.targetExam === 'others'
  ? userProfile?.customTargetExam
  : userProfile?.targetExam;
```
