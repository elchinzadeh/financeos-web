# Səhifələr — Backend endpoint xəritəsi

Hər səhifənin hansı `financeos-core` endpoint(lər)inə bağlı olduğunu göstərir. Yeni səhifə qururkən əvvəlcə burada uyğun sətri, sonra `financeos-core/src/modules/<modul>/dto/*.ts`-dəki dəqiq DTO-nu oxu.

| Səhifə | Route | Backend endpoint(lər) | Status |
|---|---|---|---|
| Login | `/login` | `POST /auth/login` | Planlaşdırılıb (Slice 1) |
| Register | `/register` | `POST /auth/register` | Planlaşdırılıb (Slice 1) |
| Dashboard | `/dashboard` | `GET /net-worth` | Planlaşdırılıb (Slice 1) |
| Accounts | `/accounts` | `GET /accounts`, `POST /accounts`, `POST /accounts/:id/archive` | Planlaşdırılıb (Slice 1) |
| Ledger | `/ledger` | `GET /ledger/entries`, `POST /ledger/record-income`, `POST /ledger/record-expense`, `POST /ledger/transfer`, `POST /ledger/adjust-balance`, `POST /ledger/reconcile`, `GET /categories` (kateqoriya seçimi üçün) | Tətbiq olundu (Slice 2) |
| Categories | `/categories` | `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id` | Tətbiq olundu (Slice 3 + tam CRUD) — iyerarxik ağac göstərilir, silmə 4 strategiya seçdirir (bax `financeos-core/docs/decisions/0018-per-user-categories.md`) |
| Budget | `/budget` | `GET /budgets/templates`, `POST /budgets`, `GET /budgets`, `GET /budgets/:id/check`, `POST /budgets/:id/priority`, `POST /budgets/:id/deactivate` | Tətbiq olundu (Slice 4) — `GET /budgets/:id` (tək büdcə detalı) istifadə olunmur, siyahı kifayətdir |
| Goals | `/goals` | `POST /goals`, `GET /goals`, `POST /goals/:id/complete`, `POST /goals/:id/abandon` | Tətbiq olundu (Slice 5) — `GET /goals/:id` istifadə olunmur, siyahı kifayətdir |
| Net Worth Timeline | `/dashboard` (əlavə tab) | `GET /net-worth/timeline`, `GET /net-worth/category-summary` | Planlaşdırılmayıb (MVP-dən kənar, bax `financeos-core/docs/PROGRESS.md`) |
| Settings | `/settings` | `GET /fx-rates`, `POST /fx-rates`, `POST /auth/deactivate`, `POST /auth/delete-data` | Tətbiq olundu (Slice 6) — hesab məlumatı `AuthContext`-dəki `/auth/me` nəticəsindən göstərilir, ayrıca sorğu yoxdur |
| Statement Import | `/import` | `POST /statement-import/preview` (multipart), `POST /statement-import/commit`, `GET /accounts`, `GET /categories`, `POST /categories` (icmalda "+ Yeni kateqoriya" modalı) | Tətbiq olundu (Slice 7) — yalnız `bankProfile=leobank` (backend-də tək profil), fayl formatı yalnız CSV |

Ümumi (bütün səhifələrdə): `POST /auth/logout` (nav-dan çağırılır).

Dəqiq request/response formatı üçün `financeos-core` repo-suna bax (bu faylda təkrarlanmır ki, köhnəlməsin):
- DTO-lar: `src/modules/<modul>/dto/*.ts`
- Swagger UI (backend işə salınıbsa): `http://localhost:3000/api`
