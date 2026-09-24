# FinanceOS — Google Stitch prompts

Short, business-only prompts. They describe **what the product does and what each screen must let the user do** — visual style, palette, typography, layout and components are left entirely to Stitch.

Source of product facts: `docs/DESIGN-BRIEF.md`.

## How to use

1. Paste **Product context** first (once per Stitch project, or prepend it to a prompt).
2. Then paste one **screen prompt** at a time. Each asks for a mobile and a desktop version.
3. Confirm the visual direction on Screens 1–3 before generating the rest, so Stitch keeps it consistent.

---

## Product context

```text
FinanceOS is a personal finance web app for individuals and freelancers in Azerbaijan. Users track income and expenses across several accounts (bank cards, cash, foreign-currency savings), plan monthly budgets, and save toward goals. Default base currency is AZN; many users also hold USD accounts, so amounts are often shown twice — in the account's own currency and converted to the base currency. Every amount shows its currency code.

Most people use it on a phone, a few times a week, for quick expense entry and balance checks. Desktop is secondary, for reviewing history and importing bank statements. Mobile must be a first-class design, not a shrunk desktop layout.

The feel should be modern, warm and trustworthy — a friendly consumer fintech, not a formal bank. Choose the visual style, colors, typography and navigation pattern yourself.

Design every screen in both mobile and desktop versions. Use realistic sample data (Azerbaijani context: AZN/USD, Kapital Bank, Bravo Supermarket, Metro, etc.), never lorem ipsum.
```

---

## Screen 1 — Sign in / Sign up

```text
Design the Sign in and Sign up screens for FinanceOS.

Sign in: email, password, a "Forgot password?" link, a link to sign up.
Sign up: email, password (min 8 characters), base currency (default AZN), a link back to sign in.

Show inline validation errors and a loading state on submit. The screens should introduce the brand and feel welcoming.
```

## Screen 2 — Forgot / Reset password

```text
Design the Forgot password and Reset password screens for FinanceOS.

Forgot password: enter email, submit. After submitting, always show the same confirmation ("If this email exists, we've sent a reset link") regardless of whether the account exists.

Reset password (opened from an email link): enter new password and repeat it. Three states: missing/invalid link (error), the form, and success with a button back to sign in.
```

## Screen 3 — Dashboard

```text
Design the Dashboard — the first screen after sign-in.

It shows the user's total net worth in the base currency, and a list of all their accounts. Each account shows its name, type, balance in its own currency, and — for foreign-currency accounts — the equivalent in the base currency.

Give the user a fast way to add a new transaction from here. Include an empty state for a new user with no accounts yet, and a loading state.

Also design the app's main navigation. It must reach: Dashboard, Transactions, Accounts, Categories, Budget, Goals, Import, Settings, plus Sign out and the signed-in email. Propose a pattern that works well on a phone.
```

## Screen 4 — Transactions

```text
Design the Transactions screen — the most-used screen in the app.

Recording: four transaction types.
- Income and Expense: account, category (filtered by type, can be "no category"), amount, optional note.
- Transfer: from-account, to-account, amount in the source currency, optional note. Needs at least two accounts.
- Adjustment: account, signed correction amount (e.g. -12.50), note.
If the user has no account yet, prompt them to create one first.

History: a list of transactions, newest first — date, account, category, direction (credit/debit), amount, note. Filter by account. A "Recalculate balances" action that reports how many balances were corrected.

Make quick expense entry on mobile as effortless as possible. Include empty and loading states.
```

## Screen 5 — Accounts

```text
Design the Accounts screen.

The user can open a new account: name, type (bank card, cash, savings, bank, etc.), currency (default AZN). The list shows every account with name, type, balance, and converted balance for foreign currencies. Active accounts can be archived (with a confirmation). Archived accounts are shown separately and clearly distinguished.

Include empty and loading states.
```

## Screen 6 — Categories

```text
Design the Categories screen.

Categories are split into Income and Expense, and each is a hierarchy (categories can have sub-categories, several levels deep). The user can add a category: name, type, optional parent, icon. Icons are chosen from an icon picker, not typed as emoji.

Each category can be edited inline (name, icon, parent) or deleted. Deleting a category with transactions requires choosing one of four strategies:
1. Move its transactions to another category (user picks the target)
2. Keep the transactions, but uncategorize them
3. Delete the transactions too
4. Archive the category instead

Make the tree and the delete flow work well on a phone.
```

## Screen 7 — Budget

```text
Design the Budget screen.

The user creates a budget: name, template (or "Custom"), priority, start date, optional end date, and an allocation list — each row is a category plus a percentage of income. Choosing a template pre-fills the allocations; rows can be added and removed. Percentages should clearly show how much is allocated in total.

Existing budgets show name, template or custom, date range, allocations, and priority (editable). Each budget can be deactivated (with confirmation) and has a "Check" action that shows: the period, the income for that period, and for every allocation the actual spending vs. its limit and percentage, clearly marking any limit that has been exceeded.

The allocation editor and the check result need a dedicated mobile design.
```

## Screen 8 — Goals

```text
Design the Goals screen.

The user creates a savings goal: name, target amount, currency (default: base currency), optional target date, optional linked account. Goals can be filtered by status: All, Active, Completed, Abandoned.

Each goal shows its name, target, date, linked account, status, and progress toward the target (current / target and percent). Active goals can be marked Complete or Abandoned, each with a confirmation.

Include empty and loading states.
```

## Screen 9 — Import bank statement

```text
Design the Import screen — a three-step flow to import a bank statement (CSV file, currently Leobank only).

Step 1 — Upload: choose the account, the bank, and the file, then Preview.

Step 2 — Review: a summary — total rows, distinct merchants, duplicates (automatically deselected), balance mismatches — with Select all / Deselect all. Transactions are grouped by merchant/description. Each group shows: selection (can be partially selected), merchant name, total amount, a category picker (with a "+ New category" option that opens a small dialog for name and icon), flags (Duplicate, Internal transfer, Balance mismatch), and a "Remember for future imports" option. A group expands to show its individual transactions — each with selection, date, amount, editable note, and duplicate flag.

Step 3 — Result: how many rows were imported, skipped as already existing, and not imported because deselected; a "Upload new file" action.

This is the densest screen in the app. Design a dedicated mobile experience — do not just shrink a table.
```

## Screen 10 — Settings

```text
Design the Settings screen with three sections.

1. Account info (read-only): email, base currency, language, client.
2. FX rates: add a rate (base currency, quote currency, rate, optional date — default today) and a table of existing rates (currency pair, rate, date, source).
3. Danger zone: "Deactivate account" (ends all sessions) and "Delete all data" (irreversible). Each requires the user's password and a confirmation.
```

---

## Shared states to request afterwards

```text
Using the same visual language, design the shared states for FinanceOS: empty states (no accounts, no transactions, no goals), loading skeletons, inline field errors and a full-form error, and a confirmation dialog used for archive account, abandon goal, deactivate budget, and delete all data.
```
