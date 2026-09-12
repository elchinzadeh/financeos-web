'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { abandonGoal, completeGoal, type Goal } from '@/lib/api/goals';
import type { AccountWithBalance } from '@/lib/api/accounts';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorText } from '@/components/ui/error-text';

const STATUS_LABEL: Record<Goal['status'], string> = {
  active: 'Aktiv',
  completed: 'Tamamlanıb',
  abandoned: 'İmtina edilib',
};

export function GoalCard({ goal, token, accounts }: { goal: Goal; token: string; accounts: AccountWithBalance[] }) {
  const queryClient = useQueryClient();
  const linkedAccount = accounts.find((a) => a.id === goal.linkedAccountId);

  const completeMutation = useMutation({
    mutationFn: () => completeGoal(token, goal.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
  const abandonMutation = useMutation({
    mutationFn: () => abandonGoal(token, goal.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const percent = goal.progress.percent !== null ? Math.min(100, Math.max(0, goal.progress.percent)) : null;

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">{goal.name}</p>
          <p className="text-xs text-zinc-500">
            {goal.targetAmount} {goal.targetCurrency}
            {goal.targetDate ? ` · ${goal.targetDate.slice(0, 10)}` : ''}
            {linkedAccount ? ` · ${linkedAccount.name}` : ''}
          </p>
        </div>
        <span className="text-xs text-zinc-400">{STATUS_LABEL[goal.status]}</span>
      </div>

      {percent !== null && (
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full bg-zinc-900" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {goal.progress.currentAmount} / {goal.targetAmount} {goal.targetCurrency} ({percent.toFixed(0)}%)
          </p>
        </div>
      )}

      {goal.status === 'active' && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              if (window.confirm(`"${goal.name}" hədəfini tamamlanmış kimi işarələmək istəyirsiniz?`)) {
                completeMutation.mutate();
              }
            }}
            disabled={completeMutation.isPending}
          >
            Tamamla
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm(`"${goal.name}" hədəfindən imtina etmək istədiyinizə əminsiniz?`)) {
                abandonMutation.mutate();
              }
            }}
            disabled={abandonMutation.isPending}
          >
            İmtina et
          </Button>
        </div>
      )}
      {(completeMutation.isError || abandonMutation.isError) && (
        <ErrorText>
          {[completeMutation, abandonMutation]
            .map((m) => (m.error instanceof ApiError ? m.error.message : null))
            .find(Boolean)}
        </ErrorText>
      )}
    </Card>
  );
}
