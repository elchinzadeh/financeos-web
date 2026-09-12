import { apiFetch } from './client';

export interface NetWorthAccount {
  accountId: string;
  name: string;
  currency: string;
  balance: string;
  convertedBalance: string;
}

export interface NetWorthResponse {
  asOf: string;
  baseCurrency: string;
  total: string;
  accounts: NetWorthAccount[];
}

export function getNetWorth(token: string): Promise<NetWorthResponse> {
  return apiFetch<NetWorthResponse>('/net-worth', { token });
}
