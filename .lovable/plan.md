

## Plan: Professional Invites, More Professional Types, and AI Usage Strategy

This plan covers three distinct features requested by the user.

---

### 1. Add More Professional Types

**Current state**: The `PROFESSIONAL_TYPES` array in `ProfessionalsManager.tsx` only has 4 types: Enfermeira, Cuidador, Terapeuta, Outro.

**Change**: Expand the list to include Fonoaudiólogo, Psicólogo, Fisioterapeuta, and Pedagogo. This is a simple UI-only change in `src/components/ProfessionalsManager.tsx` -- just add new entries to the `PROFESSIONAL_TYPES` array with appropriate icons.

---

### 2. Professional Email Invite System

**Goal**: When a parent registers a professional with an email, allow sending an invite so the professional can create their own account and access the child's data.

**Database changes** (migration):
- Add `invitation_status` column to `professionals` table (text, default `'pending'`, nullable) to track invite state (`pending`, `sent`, `accepted`)
- Add `invitation_token` column (text, nullable) for unique invite tokens
- Add `invited_at` column (timestamptz, nullable)
- Update RLS: allow professionals to view records where `user_id = auth.uid()` (already exists in SELECT policy)

**New edge function**: `supabase/functions/invite-professional/index.ts`
- Receives `professional_id` from the parent
- Generates a unique invitation token, stores it in the `professionals` row
- Calls the Lovable AI Gateway to generate a personalized invite email (or uses a simple template)
- Actually: Since we don't have transactional email capability beyond auth emails, the invite will work as follows:
  - Generate an invitation link with token
  - The parent shares the link manually (WhatsApp, email copy) or the system creates a magic-link style flow
  - When the professional signs up and enters the token, their account is linked

**Frontend changes** in `ProfessionalsManager.tsx`:
- Add "Enviar Convite" button next to each professional that has an email
- Show invitation status badge (Pendente, Enviado, Aceito)
- Copy invite link functionality

**Auth flow for professionals**:
- On the Auth page, detect invite token in URL params
- After signup, automatically link the professional record by updating `user_id` to the new user's ID

---

### 3. AI Usage Plan -- On-Demand Only

**Current state**: 
- `SmartReminders` component auto-loads AI analysis on first render (`useEffect` calls `loadSmartReminders` automatically)
- `src/lib/gemini.ts` has a placeholder `generateInsight` function (unused effectively)
- The `smart-reminders` edge function already uses Lovable AI Gateway correctly

**Change**: Make AI strictly on-demand:
- Remove the auto-load in `SmartReminders.tsx` (remove the `useEffect` that calls `loadSmartReminders` on mount)
- Keep the manual "Analisar Padrões" button as the only trigger
- Remove `src/lib/gemini.ts` since it's unused (the app uses the edge function via Lovable AI Gateway)
- No new AI features will be added unless explicitly requested by the user

---

### Summary of Files to Change

| File | Change |
|------|--------|
| `src/components/ProfessionalsManager.tsx` | Add professional types + invite button + invite status |
| `src/components/SmartReminders.tsx` | Remove auto-load useEffect |
| `src/lib/gemini.ts` | Delete (unused) |
| `supabase/functions/invite-professional/index.ts` | New edge function for invite flow |
| `src/pages/Auth.tsx` | Handle invite token on signup |
| Database migration | Add invitation columns to `professionals` table |

