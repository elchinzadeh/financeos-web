import { apiFetch } from './client';

export const BANK_PROFILES = [{ id: 'leobank', label: 'Leobank' }] as const;

export type EntryDirection = 'debit' | 'credit';

export interface PreviewRow {
  rowIndex: number;
  occurredAt: string;
  description: string;
  amount: string;
  direction: EntryDirection;
  suggestedCategoryId: string | null;
  isInternalTransfer: boolean;
  isDuplicate: boolean;
  balanceMismatch: boolean;
  fingerprint: string;
}

export interface PreviewResponse {
  rows: PreviewRow[];
  totalRows: number;
  duplicateCount: number;
  balanceMismatchCount: number;
}

export interface CommitRow {
  fingerprint: string;
  occurredAt: string;
  amount: string;
  direction: EntryDirection;
  categoryId?: string;
  note?: string;
  include: boolean;
  saveRuleKeyword?: string;
}

export interface CommitResponse {
  imported: number;
  skippedDuplicates: number;
  excluded: number;
}

export function previewStatement(
  token: string,
  input: { accountId: string; bankProfile: string; file: File },
): Promise<PreviewResponse> {
  const formData = new FormData();
  formData.append('accountId', input.accountId);
  formData.append('bankProfile', input.bankProfile);
  formData.append('file', input.file);
  return apiFetch<PreviewResponse>('/statement-import/preview', { method: 'POST', token, body: formData });
}

export function commitStatement(
  token: string,
  input: { accountId: string; rows: CommitRow[] },
): Promise<CommitResponse> {
  return apiFetch<CommitResponse>('/statement-import/commit', { method: 'POST', token, body: input });
}
