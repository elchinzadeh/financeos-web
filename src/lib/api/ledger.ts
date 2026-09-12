import { apiFetch } from './client';

export type EntryDirection = 'debit' | 'credit';

export interface LedgerEntry {
  id: string;
  transactionGroupId: string;
  accountId: string;
  categoryId: string | null;
  amount: string;
  direction: EntryDirection;
  currency: string;
  fxRateToBase: string;
  occurredAt: string;
  note: string | null;
}

export interface ReconcileResult {
  accountId: string;
  previousBalance: string;
  newBalance: string;
  corrected: boolean;
}

export function listEntries(token: string, accountId?: string): Promise<LedgerEntry[]> {
  const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return apiFetch<LedgerEntry[]>(`/ledger/entries${query}`, { token });
}

export function recordIncome(
  token: string,
  input: { accountId: string; amount: string; categoryId?: string; note?: string },
): Promise<LedgerEntry> {
  return apiFetch<LedgerEntry>('/ledger/record-income', { method: 'POST', token, body: input });
}

export function recordExpense(
  token: string,
  input: { accountId: string; amount: string; categoryId?: string; note?: string },
): Promise<LedgerEntry> {
  return apiFetch<LedgerEntry>('/ledger/record-expense', { method: 'POST', token, body: input });
}

export function transfer(
  token: string,
  input: { fromAccountId: string; toAccountId: string; amount: string; note?: string },
): Promise<LedgerEntry[]> {
  return apiFetch<LedgerEntry[]>('/ledger/transfer', { method: 'POST', token, body: input });
}

export function adjustBalance(
  token: string,
  input: { accountId: string; delta: string; note?: string },
): Promise<LedgerEntry> {
  return apiFetch<LedgerEntry>('/ledger/adjust-balance', { method: 'POST', token, body: input });
}

export function reconcile(token: string, accountId?: string): Promise<ReconcileResult[]> {
  return apiFetch<ReconcileResult[]>('/ledger/reconcile', {
    method: 'POST',
    token,
    body: accountId ? { accountId } : {},
  });
}
