import { apiFetch } from './client';

export type AccountType = 'cash' | 'bank' | 'card' | 'savings' | 'loan' | 'e_wallet' | 'investment';
export type AccountGroup = 'personal' | 'freelance_business';

export const ACCOUNT_TYPES: AccountType[] = [
  'cash',
  'bank',
  'card',
  'savings',
  'loan',
  'e_wallet',
  'investment',
];

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  accountGroup: AccountGroup | null;
  isActive: boolean;
  createdAt: string;
}

export interface AccountWithBalance extends Account {
  balance: string;
}

export function listAccounts(token: string): Promise<AccountWithBalance[]> {
  return apiFetch<AccountWithBalance[]>('/accounts', { token });
}

export function openAccount(
  token: string,
  input: { name: string; type: AccountType; currency: string; accountGroup?: AccountGroup },
): Promise<Account> {
  return apiFetch<Account>('/accounts', { method: 'POST', token, body: input });
}

export function archiveAccount(token: string, accountId: string): Promise<Account> {
  return apiFetch<Account>(`/accounts/${accountId}/archive`, { method: 'POST', token });
}
