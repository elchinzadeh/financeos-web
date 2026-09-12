import { apiFetch } from './client';

export interface FxRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: string;
  rateDate: string;
  source: string | null;
}

export function listFxRates(token: string, base?: string, quote?: string): Promise<FxRate[]> {
  const params = new URLSearchParams();
  if (base) params.set('base', base);
  if (quote) params.set('quote', quote);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<FxRate[]>(`/fx-rates${query}`, { token });
}

export function upsertFxRate(
  token: string,
  input: { baseCurrency: string; quoteCurrency: string; rate: string; rateDate?: string; source?: string },
): Promise<FxRate> {
  return apiFetch<FxRate>('/fx-rates', { method: 'POST', token, body: input });
}
