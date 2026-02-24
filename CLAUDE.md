# CLAUDE.md — my-todos-web

## Project Overview

A task management web app built around the **Getting Things Done (GTD)** methodology by David Allen. Every feature, UI decision, and data model change must align with GTD principles. When in doubt, ask: *does this help the user capture, clarify, organise, reflect, or engage with their tasks?*

## GTD Methodology

This app implements the GTD workflow. Keep the following concepts in mind at all times:

| GTD Concept | Implementation |
|---|---|
| **Inbox** | `status: "inbox"` — unprocessed captures |
| **Next Action** | `status: "next_action"` — the very next physical step |
| **Waiting For** | `status: "waiting_for"` — delegated, blocked on someone else |
| **Someday / Maybe** | `status: "someday"` — not committed, revisited on weekly review |
| **Reference** | `status: "reference"` — non-actionable, kept for lookup |
| **Done** | `status: "done"` — completed |
| **Project** | `isProject: true` — any outcome requiring >1 step |
| **Context** | `context` field — where/how a task can be done (`deep_work`, `admin`, `home`, `agenda`) |
| **Area** | `area` field — life area (`work`, `personal`, `health`, `learning`) |

**Rules to follow:**
- The main view (`/`) shows **Next Actions and Today tasks only** — not inbox, someday, or reference items
- Projects are not shown in the task list — only their constituent actions
- Duration (`estimatedMinutes`) maps to GTD's time criterion for choosing actions
- Context filter maps to GTD's context criterion
- The "Important" group surfaces today-scheduled/due tasks regardless of status

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | TanStack React Router v1 |
| State | Zustand v5 |
| UI Components | Mantine v8 |
| Styling | Tailwind CSS v4 + Mantine CSS variables |
| i18n | i18next + react-i18next + browser language detector |
| Icons | Lucide React, Tabler Icons |
| Build | Vite 7 |
| Linter/Formatter | Biome |
| Testing | Vitest |

## Project Structure

```
src/
├── components/
│   ├── LangSelect.tsx      # EN/UK language switcher (SegmentedControl)
│   ├── TaskListItem.tsx    # Single task row component
│   └── Toolbar.tsx         # Floating filter bar (context, today, duration)
├── i18n/
│   ├── index.ts            # i18next init (LanguageDetector, localStorage persist)
│   └── locales/
│       ├── en.json         # English strings
│       └── uk.json         # Ukrainian strings
├── routes/
│   ├── __root.tsx          # MantineProvider + ThemeProvider wrapper
│   └── index.tsx           # Main task list page
├── services/
│   ├── TaskService.ts      # ITaskService interface
│   ├── LocalStorageTaskService.ts
│   └── index.ts
├── store/
│   ├── filterStore.ts      # Context/today/duration filters (persisted)
│   ├── taskStore.ts        # Task CRUD via service
│   └── index.ts            # Hooks: useTasks, useTask, useTaskActions, useFilters, useFilterActions
├── types/index.tsx         # Task, TaskStatus, Context, Area types
├── mockData.ts             # Always-loaded mock dataset
├── theme.tsx               # ThemeProvider + useTheme (light/dark, localStorage)
└── styles.css              # Tailwind + Mantine imports, body vars, today-pulse animation
```

## Key Conventions

### Data

- Mock data is **always written to localStorage on startup** (`store/index.ts`) — no persistence of user edits across sessions during development
- Task IDs are stable strings (`task-1`, `proj-1`, etc.) in mock data
- Dates use ISO 8601 strings; `scheduledDate` and `dueDate` are `YYYY-MM-DD`

### Translations

- All user-facing strings must have keys in **both** `en.json` and `uk.json`
- Key naming: `area.work`, `status.inbox`, `context.deep_work`, `duration.lt5` etc.
- Use `t('key', { defaultValue: fallback })` when the key may not exist (e.g. dynamic area names)
- Never hardcode UI strings directly in components

### Theming

- Color scheme is managed by `ThemeProvider` in `src/theme.tsx`, persisted to `localStorage` key `color-scheme`
- Pass `forceColorScheme={colorScheme}` to `MantineProvider` — do not use Mantine's built-in color scheme detection
- Use `var(--mantine-color-body)` and `var(--mantine-color-text)` for adaptive backgrounds/text
- Orange (`var(--mantine-color-orange-6)`) is reserved for **today / important** highlights

### Styling

- **Prefer Tailwind CSS utility classes** for layout and spacing (`flex`, `gap-*`, `p-*`, `mb-*`, etc.)
- Use Mantine components and CSS variables (`var(--mantine-color-*)`) for anything that needs dark mode support — colours, backgrounds, borders
- Inline styles are acceptable for fine-grained or dynamic values that Tailwind cannot express (e.g. computed colours, conditional `border` strings)
- The `Header.tsx` component exists but is **not rendered** — do not use it

### Filters (Toolbar)

Duration filter steps are defined in `filterStore.ts`: `[null, 5, 15, 45, 60, 120]` minutes.
The toolbar is a floating panel fixed to the bottom centre of the screen.

## Development Commands

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # Production build
npm run lint      # Biome lint
npm run format    # Biome format
npm run test      # Vitest
```

## Adding New Features — Checklist

1. **Does it align with GTD?** If not, reconsider the approach
2. Add types to `src/types/index.tsx` if new data fields are needed
3. Add translation keys to **both** `en.json` and `uk.json`
4. Use `useTheme()` for any color that should differ between light/dark
5. Use Mantine CSS variables for colours where possible
6. Keep components small and focused — extract to `src/components/` when reused
7. Mock data in `mockData.ts` should cover the new feature with realistic GTD examples
