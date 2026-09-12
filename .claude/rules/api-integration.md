# Core API ilə inteqrasiya qaydaları

## Tək giriş nöqtəsi: `src/lib/api/`

Heç bir komponent (`src/app/**`, `src/components/**`) birbaşa `fetch()` çağırmır. Bütün HTTP çağırışları `src/lib/api/client.ts`-dəki mərkəzləşdirilmiş `apiFetch()` wrapper-i vasitəsilə, modul başına bir fayldan gedir (`src/lib/api/auth.ts`, `accounts.ts`, `net-worth.ts`, ...). Yeni endpoint çağırışı lazım olanda, əvvəlcə uyğun modul faylının olub-olmadığına bax, yoxdursa yenisini eyni pattern-lə yarat.

Komponentlərdə data TanStack Query-nin `useQuery`/`useMutation`-ı ilə, birbaşa `src/lib/api/*` funksiyalarını çağıraraq alınır — `useEffect`+`fetch` yoxdur.

## Auth header

`apiFetch()` avtomatik `Authorization: Bearer <token>` header-i əlavə edir (`AuthContext`-dən oxunan token). Sorğunu göndərən kod bunu əl ilə etməməlidir.

## Xəta formatı

Backend (NestJS default exception filter) xətaları bu formatda qaytarır:

```json
{ "statusCode": 400, "message": "...", "error": "Bad Request" }
```

`apiFetch()` uğursuz cavabı bu formatı oxuyub tipli `ApiError` (`message`, `statusCode`) kimi `throw` edir — çağıran tərəf (`onError` handler, TanStack Query-nin `error` state-i) bunu göstərir. Xəta mətnini əl ilə formatlama/parse etmə, `ApiError.message`-i birbaşa istifadə et (backend Azərbaycan dilində mənalı mesajlar qaytarır, məs. "Hesab deaktivdir").

`401` cavabı xüsusi hal: `apiFetch()` bunu tutub token-i təmizləyir və `/login`-ə yönləndirir (sessiya ləğv olunub deməkdir — məs. `/auth/deactivate` başqa yerdən çağırılıb).

## Tiplər DTO-ların əl ilə saxlanılan güzgüsüdür

`src/lib/api/*.ts`-dəki TypeScript interfeys-ləri `financeos-core/src/modules/*/dto/*.ts`-dəki response DTO-ların **əl ilə** saxlanılan güzgüsüdür (kod generasiyası hələ qurulmayıb — bax `docs/decisions/0001-frontend-foundation.md`-dakı "baxılan alternativlər"). Bu o deməkdir:

- Backend-də bir DTO sahə əlavə/silsə/adını dəyişsə, bura əl ilə sinxronlaşdırılmalıdır — avtomatik yoxlama yoxdur.
- Yeni bir endpoint inteqrasiya edərkən, HƏMİŞƏ əvvəlcə backend-dəki müvafiq DTO faylını (və ya işə salınmış backend-in `/api-json` Swagger sxemini) oxu, təxmin etmə.
- Pul sahələri backend-də `Decimal` → JSON-da **string** kimi gəlir (məs. `"749.50"`), `number` yox. Görüntüləmək üçün birbaşa göstər, riyazi əməliyyat lazımdırsa diqqətli ol (float dəqiqlik itkisi) — kritik hesablamalar həmişə backend-də olmalıdır, frontend yalnız göstərir.

## Base URL

`process.env.NEXT_PUBLIC_API_URL` (bax `.env.local.example`). Client component-lərdə işlədiyi üçün `NEXT_PUBLIC_` prefiksi məcburidir.
