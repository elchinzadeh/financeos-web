import { apiFetch } from './client';

export const BANK_PROFILES = [{ id: 'leobank', label: 'Leobank' }] as const;

export type EntryDirection = 'debit' | 'credit';

/** Kateqoriya təklifinin mənbəyi (bax financeos-core/docs/decisions/0021-jev-ai-suggestions.md). */
export type SuggestionSource = 'rule' | 'internal_transfer' | 'ai';

export interface PreviewRow {
  rowIndex: number;
  occurredAt: string;
  description: string;
  amount: string;
  direction: EntryDirection;
  suggestedCategoryId: string | null;
  suggestionSource: SuggestionSource | null;
  /** Yalnız suggestionSource === 'ai' olanda: Jev-in etibar balı (0–1). */
  suggestionConfidence: number | null;
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
  /** Verilibsə sətir gəlir/xərc yox, bu hesabla (eyni valyutada) köçürmə kimi yazılır (core ADR-0022). */
  transferAccountId?: string;
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
