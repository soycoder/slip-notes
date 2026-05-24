# SlipNotes

A React Native app (Expo) for photographing Thai bank transfer slips, automatically extracting the amount, recipient, and date via on-device OCR, and tracking expenses over time.

Works fully offline — Supabase sync is optional and only needed for cross-device access.

---

## Features

- Capture bank transfer slips with the camera or import from the photo library
- On-device OCR via ML Kit — no data leaves the device during recognition
- Parses Thai and English slip formats: amount, recipient name, bank, date, reference number
- Supports 9 Thai banks/payment methods: KBank, SCB, KTB, BBL, Krungsri, ttb, GSB, PromptPay, TrueMoney
- Buddhist Era (BE) year conversion handled automatically
- Notes with colour labels, tags, pin, archive, and trash (soft delete)
- Monthly expense breakdown and per-bank totals
- Light / dark mode
- Optional Supabase sync with Row-Level Security (data is always yours)

---

## Getting started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- iOS Simulator / Android Emulator, or a physical device with [Expo Go](https://expo.dev/go)

### Install dependencies

```bash
npm install
```

### Environment variables (optional — for sync)

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

The app runs in local-only mode without these values — no sign-in required.

### Run

```bash
npm start          # Expo dev server
npm run android    # Android emulator / device
npm run ios        # iOS simulator / device
npm run web        # Web (limited — OCR requires native)
```

---

## Project structure

```
slip-notes/
├── app/                  # Expo Router file-system routes
│   ├── _layout.tsx       # Root layout (providers, Stack)
│   ├── settings.tsx      # Settings modal
│   ├── (auth)/           # Login screen
│   ├── (tabs)/           # Bottom tab navigator
│   │   ├── index.tsx     # Notes list
│   │   ├── archive.tsx   # Archived notes
│   │   ├── trash.tsx     # Trash
│   │   └── expenses.tsx  # Expense dashboard
│   ├── note/             # new.tsx, [id].tsx
│   └── slip/             # capture.tsx, [id].tsx
├── components/           # notes/, slips/, ui/
├── context/              # AuthContext, NotesContext, ThemeContext
├── hooks/                # useNotes, useSlips, useExpenses, useOCR, useSync, useSearch
├── lib/                  # storage, syncManager, slipParser, supabaseClient
├── constants/            # theme tokens, color palettes, bank registry
├── types/                # note.ts, slip.ts, supabase.ts
└── supabase/migrations/  # SQL schema + RLS policies
```

---

## Testing

```bash
npm test
```

Uses Jest with `jest-expo`. Tests live in `__tests__/`.

---

## Database setup (Supabase)

Apply migrations via the Supabase SQL editor or `supabase db push`:

```
supabase/migrations/001_create_notes.sql   # notes table + RLS
supabase/migrations/002_create_storage.sql # storage bucket
```

After any schema change, regenerate TypeScript types:

```bash
PROJECT_ID=<your-project-ref> npm run update-types
```

---

## Build

This project uses [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
eas build --profile development   # Dev client (internal)
eas build --profile preview       # Internal distribution
eas build --profile production    # App store submission
```

---

## License

MIT
