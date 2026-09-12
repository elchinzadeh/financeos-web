# UI konvensiyaları

## Qovluq strukturu

- `src/app/` — Next.js App Router route-ları. `(auth)` route group-u qorunmayan səhifələr (login/register), `(app)` route group-u qorunan shell (nav + auth yoxlaması).
- `src/lib/api/` — backend çağırışları (bax `.claude/rules/api-integration.md`).
- `src/lib/auth/` — `AuthContext`, `useAuth()` hook-u.
- `src/lib/query-client.tsx` — TanStack `QueryClientProvider` wrapper-i.
- `src/components/ui/` — minimal, stil-yönümlü primitiv-lər (Button, Input, Card, ErrorText). Biznes məntiqi/data-fetching yoxdur.
- `src/components/layout/` — nav, səhifə shell-i kimi tərtibat komponentləri.

Modul-spesifik komponentlər (məs. hesab kartı, əməliyyat sətri) uyğun səhifənin qovluğunda (`src/app/(app)/accounts/`) qalır, `src/components/`-a yalnız 2+ modul arasında paylaşılan primitiv-lər gedir.

## Qorunan route-lar

`(app)/layout.tsx` client component-dir, `useAuth()`-dan token oxuyur, yoxdursa `/login`-ə redirect edir. Token `localStorage`-da olduğu üçün Next.js middleware (server-side) ilə qorunma mümkün deyil — bu bilərəkdən qəbul edilmiş məhdudiyyətdir (bax `docs/decisions/0001-frontend-foundation.md`). Yeni qorunan səhifə `(app)` qrupuna əlavə olunur, ayrıca auth yoxlaması yazmır.

## Formlar

Hər form `react-hook-form` + `zod` schema ilə. Zod schema-sı backend-in DTO-sundakı `class-validator` qaydalarını güzgüləməlidir (məs. minimum uzunluq, enum dəyərləri) — dəqiq qayda üçün backend DTO-suna bax, təxmin etmə.

## Stil

Tailwind utility class-ları birbaşa JSX-də. Ayrıca CSS faylı yalnız `globals.css`-də qlobal token-lər üçün. Xarici komponent kitabxanası (shadcn/Radix və s.) əlavə etməzdən əvvəl `docs/decisions/`-a bax/yeni qərar yaz — hazırda bilərəkdən yoxdur (minimal başlanğıc).

## Data fetching

Hər səhifə/komponent server state-i üçün TanStack Query `useQuery`/`useMutation` istifadə edir, `src/lib/api/*`-dəki funksiyaları çağıraraq. Mutasiyadan sonra aidiyyatlı query key-ləri `invalidateQueries` ilə təzələnir (məs. hesab arxivləndikdən sonra `['accounts']`).
