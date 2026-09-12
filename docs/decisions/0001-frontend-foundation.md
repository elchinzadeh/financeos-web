# ADR-0001: Frontend təməli — Next.js, data-fetching, auth saxlanması

Tarix: 2026-09-12
Status: accepted

## Kontekst

`financeos-core`-un backend-i (MVP-nin bütün əsas modulları) hazırdır, REST+OpenAPI ilə sənədləşdirilib (bax `financeos-core/docs/decisions/0007-repo-api-tooling.md`). Bu repo həmin API-nin veb client-i kimi sıfırdan qurulur — framework, ayrı-repo, auth strategiyası seçimi bu ADR-in mövzusudur. Bu seçimin backend-də tələb etdiyi yeganə dəyişiklik (CORS) `financeos-core`-un öz ADR-ində sənədləşdirilib: `financeos-core/docs/decisions/0014-cors-for-web-client.md`.

## Qərar

1. **Next.js App Router + TypeScript**, `pnpm create next-app` ilə scaffold edilib (Tailwind, ESLint, `src/` directory).
2. **Server state / data-fetching:** TanStack Query. Səbəb: caching, invalidation, loading/error state idarəsi hazır gəlir — REST API-yə əl ilə `useEffect`+`fetch` yazmaqdan daha etibarlıdır.
3. **Formlar:** `react-hook-form` + `zod`. Səbəb: yığcam validasiya + backend-in `class-validator` qaydalarını güzgüləmək asandır.
4. **API tipləri:** backend DTO-larının **əl ilə saxlanılan güzgüsü** (`src/lib/api/*.ts`), OpenAPI-dən avtomatik kod generasiyası **yoxdur** hələlik.
5. **Auth:** token `localStorage`-da, React Context (`AuthContext`) vasitəsilə paylaşılır. Bax `.claude/rules/api-integration.md` və `.claude/rules/ui-conventions.md`.
6. **Dev port:** `3001` (backend `3000`-i tutur).

## Baxılan alternativlər

- **OpenAPI-dən avtomatik tip generasiyası (`openapi-typescript` və s.)** — cəlbedicidir (backend artıq `/api-json` Swagger sxemini verir, bax ADR-0007), amma Slice 1-i sürətlə qurmaq üçün indi əl ilə saxlanılan tiplərlə başlanıldı. Frontend böyüdükcə (bir neçə modul, tez-tez DTO dəyişikliyi) bu, yenidən nəzərdən keçiriləcək — ilk namizəd.
- **SWR (TanStack Query əvəzinə)** — oxşar imkanlar, amma TanStack Query-nin mutasiya/invalidation API-si daha yetkindir, komanda daha tanışdır.
- **Zustand/Redux qlobal state üçün** — rədd edildi: hazırkı ehtiyac (auth token + server state) Context + TanStack Query ilə tam ödənilir, əlavə kitabxana artıqdır.
- **HttpOnly cookie auth** — backend tərəfdə rədd edildi (bax `financeos-core` ADR-0014), bu ADR yalnız nəticəni (localStorage+Context) qəbul edir.

## Nəticələr

- DTO sinxronizasiyası əl ilə olduğu üçün backend-də DTO dəyişikliyi bu repo-da səssiz bug yarada bilər — hər yeni endpoint inteqrasiyasında backend DTO-suna baxmaq məcburidir (bax `CLAUDE.md`, `.claude/rules/api-integration.md`).
- Route qorunması yalnız client-side (middleware yoxdur) — ilk yüklənmədə qısa "flash" mümkündür, MVP üçün qəbul edilib.
- Gələcəkdə OpenAPI codegen-ə keçid qərarı ayrıca ADR kimi yazılacaq, bu ADR "superseded" ediləcək.
