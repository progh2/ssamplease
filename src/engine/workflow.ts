import { isTaskResolved } from './taskEngine';
import type { TaskStatus } from '../types';

export function purchaseStage(history: Record<string, TaskStatus>) {
  if (isTaskResolved(history.message_budget_close)) return 'closed';
  if (isTaskResolved(history.message_approval_done)) return 'approved';
  if (isTaskResolved(history.approval_revision)) return 'resubmitted';
  if (isTaskResolved(history.message_approval_return)) return 'revision';
  if (isTaskResolved(history.edugreat_purchase)) return 'submitted';
  return 'draft';
}

export const unitPrice = 15000;
export const purchaseBudget = 40000;
