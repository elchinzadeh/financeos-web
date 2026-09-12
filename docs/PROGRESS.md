# Progress

Bu fayl status lövhəsidir, changelog deyil (dəyişikliklərin tarixçəsi üçün git-ə bax). Mənalı bir iş bitəndə, ya da scope-a dair qərar veriləndə bu faylı yenilə. Qısa yaz — bir sətir kifayətdir, detal lazımdırsa ADR-ə keçid ver.

## Slice statusu

| Slice | Status | Qeyd |
|---|---|---|
| Layihə scaffold-u | Tətbiq olundu | `pnpm create next-app` — Next.js (App Router, TS, Tailwind, ESLint), bax `docs/decisions/0001-frontend-foundation.md` |
| Slice 1: Auth + Dashboard + Accounts | Tətbiq olundu | Login/Register, `AuthContext`, Dashboard (`GET /net-worth`), Accounts (list/open/archive). Bax `docs/PAGES.md` |
| Slice 2: Ledger | Başlanmayıb | Əməliyyat siyahısı + gəlir/xərc/transfer/adjust formaları |
| Slice 3: Categories | Başlanmayıb | |
| Slice 4: Budget | Başlanmayıb | |
| Slice 5: Goals | Başlanmayıb | |
| Slice 6: Settings (FX rates, deaktivasiya/silmə) | Başlanmayıb | |
| AI Assistant client | Başlanmayıb | `financeos-core/docs/MODULES.md` §9 |

## Növbəti addımlar

- [x] Next.js layihəsini scaffold et
- [x] Frontend context sənədləri (`CLAUDE.md`, `.claude/rules/`, `docs/decisions/`, `docs/PAGES.md`)
- [x] `src/lib/api/client.ts` — mərkəzləşdirilmiş fetch wrapper (auth header, xəta formatı)
- [x] `src/lib/auth/auth-context.tsx` — token saxlanması, `/auth/me` ilə doğrulama
- [x] Login/Register səhifələri
- [x] `(app)` qorunan layout + nav
- [x] Dashboard səhifəsi (`GET /net-worth`)
- [x] Accounts səhifəsi (list/open/archive)
- [x] Slice 1 yoxlama: `pnpm build`/`lint` təmiz, backend `:3000` + frontend `:3001` paralel işə salınıb, register→open-account→net-worth axını real sorğularla təsdiqləndi (backend cavabları frontend-in `lib/api` tipləri ilə eynidir), CORS preflight yoxlanıldı, test datası silindi
- [ ] Tam brauzer click-through testi (bu sessiyada API-səviyyəli yoxlama edildi, real brauzer sessiyası hələ yoxlanılmayıb)

## Log

*(ən yenisi əvvəldə — sessiya/qərar başına bir sətir, aidiyyatı olan ADR-ə keçid ver)*

- Slice 1 tətbiq olundu: `lib/api/{client,auth,accounts,net-worth}.ts` (backend DTO-larının əl ilə güzgüsü, bax `docs/decisions/0001-frontend-foundation.md`), `AuthContext` (localStorage token + `/auth/me` doğrulaması, 401-də avtomatik logout), Login/Register formaları (`react-hook-form`+`zod`), qorunan `(app)` shell + nav, Dashboard (`GET /net-worth`), Accounts (list/open/archive, TanStack Query ilə invalidasiya). `pnpm build`/`lint` təmiz. Backend+frontend paralel işə salınıb, real register→open-account→net-worth axını curl ilə (frontend-in çağırdığı eyni endpoint/format) yoxlanıldı, CORS preflight təsdiqləndi, test datası `POST /auth/delete-data` ilə təmizləndi.
- Layihə scaffold edildi (Next.js 16, App Router, TS, Tailwind, ESLint, pnpm), frontend context sənədləri yaradıldı: `CLAUDE.md`, `.claude/rules/api-integration.md`, `.claude/rules/ui-conventions.md`, `docs/decisions/0001-frontend-foundation.md`, `docs/PAGES.md`. Backend-də bu seçimin tələb etdiyi yeganə dəyişiklik (CORS) `financeos-core`-un öz `docs/decisions/0014-cors-for-web-client.md`-də sənədləşdirilib.
