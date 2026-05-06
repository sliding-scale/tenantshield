# Onboarding impact score — DB contract

`finalizeOnboarding` expects **exactly six** rows in `onboardingQuestions` with `step` values **`1` through `6` in order** when sorted by `step`.

| `step` | Dimension (signal)        | `option1` → `option4` (severity) |
| ------ | ------------------------- | -------------------------------- |
| 1      | Time pressure             | lowest → highest                 |
| 2      | Financial impact          | lowest → highest                 |
| 3      | Mental load               | lowest → highest                 |
| 4      | Life impact               | lowest → highest                 |
| 5      | Risk severity             | lowest → highest                 |
| 6      | Willingness to pay/urgency| lowest → highest                 |

Numeric weights and per-option scores live in [`impactScore.ts`](./impactScore.ts) (`IMPACT_DIMENSIONS`). If you reorder questions in the dashboard, keep `step` aligned with this table or update the lib to match.
