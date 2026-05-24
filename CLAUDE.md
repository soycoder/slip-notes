# SlipNotes — CLAUDE.md

A React Native / Expo app for capturing Thai bank transfer slips via OCR, organising them as notes, and tracking expenses. Works fully offline (local-only mode) or synced via Supabase.

---

## Quick commands

```bash
npm start          # Expo dev server (scan QR with Expo Go)
npm run android    # Launch on Android emulator / device
npm run ios        # Launch on iOS simulator / device
npm test           # Jest test suite
npm run update-types  # Regenerate Supabase TypeScript types (requires PROJECT_ID env var)
```

---

## Repository layout

```
slip-notes/
├── app/                     # Expo Router file-system routes
│   ├── _layout.tsx          # Root layout: providers + Stack navigator
│   ├── settings.tsx         # Settings modal (dark mode, account)
│   ├── (auth)/              # Unauthenticated routes
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (tabs)/              # Main tab navigator (wrapped in NotesProvider)
│   │   ├── _layout.tsx      # Tab bar setup
│   │   ├── index.tsx        # Notes list (search, sort, tag filter)
│   │   ├── archive.tsx      # Archived notes
│   │   ├── trash.tsx        # Soft-deleted notes
│   │   └── expenses.tsx     # Expense dashboard (monthly breakdown, top banks)
│   ├── note/
│   │   ├── new.tsx          # Create note modal
│   │   └── [id].tsx         # Edit note modal
│   └── slip/
│       ├── capture.tsx      # OCR capture flow (camera → parse → preview → save)
│       └── [id].tsx         # Slip detail view
│
├── components/
│   ├── notes/               # NoteCard, ColorPicker, TagChip
│   ├── slips/               # SlipCard, SlipPreview
│   └── ui/                  # FAB, SearchBar, EmptyState, LoadingSkeleton
│
├── context/
│   ├── AuthContext.tsx      # Supabase session state; exposes useAuth()
│   ├── NotesContext.tsx     # Wraps useNotes + useSync; exposes useNotesContext()
│   └── ThemeContext.tsx     # Light/dark toggle; exposes useTheme()
│
├── hooks/
│   ├── useNotes.ts          # Core CRUD + in-memory state + AsyncStorage persistence
│   ├── useSlips.ts          # Slip-specific helpers built on top of useNotes
│   ├── useExpenses.ts       # Derived monthly / bank totals from slip list
│   ├── useSearch.ts         # Full-text search across notes
│   ├── useSync.ts           # Supabase sync on login + AppState foreground events
│   ├── useOCR.ts            # ML Kit OCR → parseSlipText pipeline
│   └── useTheme.ts          # Re-export convenience (alias for useTheme from context)
│
├── lib/
│   ├── storage.ts           # AsyncStorage wrapper (loadNotes, saveNotes, theme, sync timestamps)
│   ├── syncManager.ts       # Supabase pull/push + local↔remote merge by updatedAt
│   ├── slipParser.ts        # Pure function: raw OCR text → ParsedSlip (Thai + English patterns)
│   ├── supabaseClient.ts    # Initialised Supabase JS client
│   └── imageStorage.ts      # Image file helpers
│
├── types/
│   ├── note.ts              # Note, NoteColor, NoteType, SortOrder
│   ├── slip.ts              # SlipData, ParsedSlip, BankCode, ExpenseMonth
│   ├── supabase.ts          # Auto-generated DB types (run update-types to refresh)
│   └── index.ts             # Re-exports
│
├── constants/
│   ├── theme.ts             # SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW tokens
│   ├── colors.ts            # LIGHT / DARK palettes + NOTE_COLORS per-color variant
│   └── banks.ts             # BANKS registry (name, color, regex patterns) + detectBank()
│
├── supabase/migrations/
│   ├── 001_create_notes.sql # notes table + RLS policies
│   └── 002_create_storage.sql
│
├── __tests__/lib/
│   └── slipParser.test.ts   # Unit tests for the OCR parsing pipeline
│
├── _archive/                # Old Next.js artifacts — ignore; do not edit
├── public/lib/tesseract.js/ # Bundled Tesseract source — do not edit
├── app.json                 # Expo config (bundle IDs, permissions, plugins)
├── eas.json                 # EAS Build profiles
└── .env.local.example       # Required env vars template
```

---

## Architecture overview

### Data model

Both notes and slips share the same `Note` type (`types/note.ts`). The `type` field (`'note' | 'slip'`) distinguishes them. Slips carry an optional `slipData: SlipData` payload with parsed OCR fields.

```
Note
├── id            string   (Date.now().toString(36) + random suffix)
├── type          'note' | 'slip'
├── title / content / color / tags
├── isPinned / isArchived / isDeleted / deletedAt
├── slipData?     SlipData   (amount, recipientBank, senderBank, …)
├── slipImageUri? string
├── userId?       string     (Supabase user UUID)
└── createdAt / updatedAt   ISO 8601 strings
```

### State management

- **Single source of truth**: `useNotes` hook holds the `Note[]` array in React state and mirrors it to AsyncStorage on every mutation.
- **Context**: `NotesContext` wraps `useNotes` and layers in `useSync`. All screens consume `useNotesContext()`.
- **No Redux / Zustand** — the entire state is owned by one hook and shared via context.

### Persistence & sync

| Mode | Storage |
|------|---------|
| Local-only (no auth) | `AsyncStorage` key `slipnotes_notes_v2` |
| Signed in | AsyncStorage (primary) + Supabase `notes` table (synced) |

Sync strategy (`lib/syncManager.ts`): last-write-wins by `updatedAt` ISO string comparison. On sign-in, local notes are upserted to Supabase then a full pull merges remote changes. Incremental pulls use `updated_at > lastSync` filtering.

Storage keys:
- `slipnotes_notes_v2` — active notes
- `slipnotes_migrated_v1` — migration status flag (`'local'` or `'supabase'`)
- `slipnotes_theme` — persisted theme preference
- `slipnotes_last_sync` — ISO timestamp of last Supabase sync

### OCR pipeline

1. **`useOCR.processImage(uri)`** — calls `@react-native-ml-kit/text-recognition` on device (no network).
2. **`lib/slipParser.parseSlipText(rawText)`** — pure function that extracts amount, recipient, bank, date, time, and reference number from the raw OCR string using regex patterns for both Thai and English text.
3. Buddhist Era (BE) year conversion: years > 2400 are reduced by 543.
4. Bank detection: `constants/banks.ts` → `detectBank(text)` matches against regex patterns for each of the 9 supported Thai banks / payment methods.

### Routing

Expo Router file-system conventions:
- `(tabs)` — persistent bottom tab bar
- `(auth)` — unauthenticated stack (currently login only; local mode is fully supported without signing in)
- Modal screens (`note/new`, `note/[id]`, `slip/capture`, `slip/[id]`, `settings`) use `presentation: 'modal'` with `slide_from_bottom` animation.

---

## Theming conventions

All styling uses:
1. **`constants/theme.ts`** — spacing / font / radius tokens (use these, not raw numbers).
2. **`constants/colors.ts`** — `LIGHT` and `DARK` semantic color palettes.
3. **`useTheme().colors`** — consume in components via the context hook.

Never hardcode hex colors outside `constants/colors.ts`. Inline `StyleSheet.create` is standard — no CSS-in-JS library.

---

## Environment setup

Copy `.env.local.example` to `.env.local` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

The app works without these vars (local-only mode). Supabase is only required for cross-device sync.

---

## Testing

Tests live in `__tests__/`. Currently `slipParser.test.ts` covers the OCR parsing logic. Run with:

```bash
npm test
```

Jest preset: `jest-expo`. The `_archive/` directory is excluded from test discovery.

When adding new parser logic, add corresponding tests in `__tests__/lib/slipParser.test.ts`.

---

## Database

Supabase migrations are in `supabase/migrations/`. Apply via the Supabase SQL editor or `supabase db push`.

Key table: `notes`
- `type` column: CHECK constraint enforces `'note'` or `'slip'`
- `slip_data`: JSONB, stores the serialised `SlipData` object
- RLS policies: all rows are user-scoped (`auth.uid() = user_id`)
- Auto-purge cron for 30-day-old trash items is commented out in migration 001 (opt-in)

Regenerate TypeScript types after schema changes:
```bash
PROJECT_ID=<your-project-ref> npm run update-types
```

---

## Key conventions

- **Path alias `@/`** maps to the project root (configured in `tsconfig.json`). Always use `@/` imports, never relative `../../`.
- **No comments** unless the why is non-obvious (e.g., Buddhist Era conversion, migration guard).
- **`useCallback` / `useMemo`** are used throughout `useNotes` — maintain memoisation when modifying that hook to avoid infinite render loops.
- **Soft delete**: notes are never permanently removed from AsyncStorage/DB by normal user action; `isDeleted: true` + `deletedAt` timestamp marks them as trashed. Permanent deletion only happens via "Empty Trash".
- **`SlipData.confidence`** is injected after ML Kit processing; it is `0` for manually entered slips.
- **Supabase client** is a singleton in `lib/supabaseClient.ts` — do not instantiate it elsewhere.
- **`_archive/`** contains old Next.js files kept for reference — do not modify or import from them.

---

## Build & deployment

EAS Build profiles (`eas.json`):
- `development` — development client, internal distribution
- `preview` — internal distribution, device (not simulator)
- `production` — auto-increments build number, store submission

Required native permissions declared in `app.json`: Camera, photo library (iOS + Android). These are pre-configured; do not remove them.
