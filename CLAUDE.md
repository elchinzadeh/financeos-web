@AGENTS.md

# FinanceOS Web — Layihə Konteksti

Bu, `financeos-core` core API-sinin **veb client-idir** (Next.js). Fərdi/freelancer maliyyə platformasının backend-i ayrıca repo-dadır: `C:\Projects\financeos-core` (və ya bu maşında fərqli yoldadırsa, `docs/decisions/0001-frontend-foundation.md`-a bax). Bu repo heç bir biznes məntiqi/hesablama saxlamır — yalnız core API-nin REST endpoint-lərini çağırır və nəticəni göstərir.

## Əsas qayda: bu bir "client"-dir, "source of truth" deyil

`financeos-core`-un memarlıq qaydası (`.claude/rules/architecture.md` orada): heç bir client birbaşa data dəyişdirmir, hər dəyişiklik core API-nin bir **command** endpoint-inə (`POST /ledger/record-expense`, `POST /accounts` və s.) sorğudur. Bu repo-da:

- Balans/limit/tərəqqi kimi hesablamaları **frontend-də təkrar hesablama** — backend-in DTO-sunda gələn dəyəri birbaşa göstər (məs. `AccountWithBalanceResponseDto.balance`, `GoalResponseDto.progress`).
- Yeni "biznes qaydası" lazım olsa (məs. limit hesablanması fərqli olmalıdır), bu, `financeos-core`-da dəyişməlidir — frontend-də hack etmə.
- API cavab formatı ilə bağlı sual yaranarsa, `financeos-core`-dakı DTO-ya (`src/modules/*/dto/*.ts`) və ya işə salınmış backend-in `/api-json` (Swagger) sxeminə bax — bu repo-dakı `src/lib/api/*.ts` tipləri onların əl ilə saxlanılan güzgüsüdür (bax `.claude/rules/api-integration.md`).

## Modullar = səhifələr

Backend-in modulları (`Identity, Accounts, Ledger, Categories, Currency & FX, Net Worth, Budget, Goals, AI Assistant`) bu repoda `src/app/(app)/<modul>/` səhifələrinə uyğun gəlir. Hansı səhifə hansı endpoint-ə bağlıdır, tam siyahı: `docs/PAGES.md`.

## MVP əhatəsi

Backend-in bütün əsas modulları hazırdır (bax `financeos-core/docs/PROGRESS.md`). Bu repo-nun işi **tədricən, slice-slice** qurulur — bax `docs/PROGRESS.md`. Bir sessiyada bütün səhifələri qurmağa çalışma, bir slice bitib yoxlanılmadan növbətiyə keçmə.

## İşə başlamazdan əvvəl

1. `docs/PROGRESS.md`-i oxu — hansı slice harada qalıb.
2. Toxunacağın səhifə üçün `docs/PAGES.md`-də uyğun sətri oxu — hansı endpoint(lər)ə bağlıdır.
3. Endpoint-in dəqiq request/response formatını `financeos-core`-dakı DTO-dan (yol yuxarıda) yoxla — güzgü tiplər köhnəlmiş ola bilər, backend dəyişəndə bura sinxronlaşdırılmalıdır.

## Qərarları yazılı saxla

Yeni kitabxana seçimi, qovluq strukturu dəyişikliyi, auth/data-fetching yanaşması kimi qərarlar üçün `docs/decisions/TEMPLATE.md`-dən `docs/decisions/000N-qisa-ad.md` yarat. İşə başlamazdan əvvəl `docs/decisions/`-a bax ki, artıq qərar verilmiş bir şeyə zidd getməyəsən.

## Texnologiya stack-i

- **Framework:** Next.js (App Router, TypeScript) — bax `docs/decisions/0001-frontend-foundation.md`
- **Data fetching / server state:** TanStack Query — heç bir komponent birbaşa `fetch` çağırmır, hamısı `src/lib/api/*.ts` funksiyaları vasitəsilə (bax `.claude/rules/api-integration.md`)
- **Formlar:** `react-hook-form` + `zod`
- **Stil:** Tailwind CSS. Xarici UI komponent kitabxanası (shadcn və s.) hələ qoşulmayıb — `src/components/ui/`-dəki minimal primitiv-lərdən istifadə et, yenisini əlavə etməzdən əvvəl `docs/decisions/`-a bax.
- **Auth:** Bearer token, `localStorage`-da saxlanılır, `src/lib/auth/auth-context.tsx` vasitəsilə (bax `docs/decisions/0001-frontend-foundation.md`). Backend-in auth məntiqi dəyişmir, yalnız CORS aktivləşdirilib (bax `financeos-core/docs/decisions/0014-cors-for-web-client.md`).
- **Paket meneceri:** pnpm

## Dev mühiti

- Backend `:3000`-də işləməlidir (`financeos-core`-da `pnpm run start`), bu repo `:3001`-də (`pnpm dev` — bax `package.json`).
- `.env.local` (git-ə düşmür): `NEXT_PUBLIC_API_URL=http://localhost:3000` — nümunə üçün `.env.local.example`-a bax.
- Backend-də CORS yalnız `:3001`-ə açıqdır (`CORS_ORIGIN` env dəyişəni ilə backend tərəfdə tənzimlənir) — fərqli portda işə salırsansa, əvvəlcə backend-in `CORS_ORIGIN`-i ilə uyğunlaşdır.

## Bu faylı necə saxlamaq lazımdır

Bu faylı ~150 sətirdən uzun etmə. Detallı qaydalar `.claude/rules/`-a, uzun istinad materialı `docs/`-a gedir.
