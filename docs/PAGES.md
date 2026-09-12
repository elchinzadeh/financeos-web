# Səhifələr — Backend endpoint xəritəsi

Hər səhifənin hansı `financeos-core` endpoint(lər)inə bağlı olduğunu göstərir. Yeni səhifə qururkən əvvəlcə burada uyğun sətri, sonra `financeos-core/src/modules/<modul>/dto/*.ts`-dəki dəqiq DTO-nu oxu.

| Səhifə | Route | Backend endpoint(lər) | Status |
|---|---|---|---|
| Login | `/login` | `POST /auth/login` | Planlaşdırılıb (Slice 1) |
| Register | `/register` | `POST /auth/register` | Planlaşdırılıb (Slice 1) |
| Dashboard | `/dashboard` | `GET /net-worth` | Planlaşdırılıb (Slice 1) |
| Accounts | `/accounts` | `GET /accounts`, `POST /accounts`, `POST /accounts/:id/archive` | Planlaşdırılıb (Slice 1) |
| Ledger | `/ledger` | `GET /ledger/entries`, `POST /ledger/record-income`, `POST /ledger/record-expense`, `POST /ledger/transfer`, `POST /ledger/adjust-balance`, `POST /ledger/reconcile`, `GET /categories` (kateqoriya seçimi üçün) | Tətbiq olundu (Slice 2) |
| Categories | `/categories` | `GET /categories`, `POST /categories` | Növbəti slice |
| Budget | `/budget` | `GET /budgets/templates`, `POST /budgets`, `GET /budgets`, `GET /budgets/:id`, `GET /budgets/:id/check`, `POST /budgets/:id/priority`, `POST /budgets/:id/deactivate` | Növbəti slice |
| Goals | `/goals` | `POST /goals`, `GET /goals`, `GET /goals/:id`, `POST /goals/:id/complete`, `POST /goals/:id/abandon` | Növbəti slice |
| Net Worth Timeline | `/dashboard` (əlavə tab) | `GET /net-worth/timeline`, `GET /net-worth/category-summary` | Növbəti slice |
| FX Rates | `/settings/fx-rates` | `GET /fx-rates`, `POST /fx-rates` | Növbəti slice |
| Settings — hesab | `/settings` | `GET /auth/me`, `POST /auth/deactivate`, `POST /auth/delete-data` | Növbəti slice |

Ümumi (bütün səhifələrdə): `POST /auth/logout` (nav-dan çağırılır).

Dəqiq request/response formatı üçün `financeos-core` repo-suna bax (bu faylda təkrarlanmır ki, köhnəlməsin):
- DTO-lar: `src/modules/<modul>/dto/*.ts`
- Swagger UI (backend işə salınıbsa): `http://localhost:3000/api`
