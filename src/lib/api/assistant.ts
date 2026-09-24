import { apiFetch } from './client';

export type ProposalSource = 'parser' | 'jev' | 'claude';
export type ProposalWarning = 'amount_missing' | 'multiple_amounts' | 'no_account_in_currency';

/**
 * `POST /assistant/parse-transaction` cavabı — yalnız TƏKLİFdir, backend heç nə yazmır. Yazma istifadəçi təsdiq
 * edəndən sonra mövcud `recordIncome`/`recordExpense` ilə olur (bax financeos-core/docs/decisions/0021-jev-ai-suggestions.md).
 */
export interface TransactionProposal {
  direction: 'income' | 'expense' | null;
  amount: string | null;
  currency: string | null;
  accountId: string | null;
  categoryId: string | null;
  /** 0 = bu gün, -1 = dünən, -2 = srağagün. Yerli tarixi client hesablayır. */
  dayOffset: number;
  note: string;
  confidence: { direction: number | null; account: number | null; category: number | null };
  source: ProposalSource;
  warnings: ProposalWarning[];
}

export function parseTransaction(token: string, text: string): Promise<TransactionProposal> {
  return apiFetch<TransactionProposal>('/assistant/parse-transaction', { method: 'POST', token, body: { text } });
}
