import type { SupabaseClient } from '@supabase/supabase-js';

import { getUserBillingEntitlement } from '@/lib/billing/server';
import {
  PRO_MONTHLY_GENERATION_CREDITS,
  resolveCreditCycle,
} from '@/lib/generation/credits';
import { getGenerationAdminClient } from '@/lib/generation/server';

export interface GenerationCreditBalance {
  allowance: number;
  available: number;
  reserved: number;
  spent: number;
  periodStart: string;
  periodEnd: string;
}

function readBalance(value: unknown): GenerationCreditBalance {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== 'object') throw new Error('Credit balance is unavailable.');
  const candidate = row as Record<string, unknown>;
  const number = (name: string) => {
    const parsed = Number(candidate[name]);
    if (!Number.isInteger(parsed) || parsed < 0) throw new Error('Credit balance is invalid.');
    return parsed;
  };
  const periodStart = String(candidate.period_start || '');
  const periodEnd = String(candidate.period_end || '');
  if (!periodStart || !periodEnd) throw new Error('Credit period is invalid.');
  return {
    allowance: number('allowance'),
    available: number('available'),
    reserved: number('reserved'),
    spent: number('spent'),
    periodStart,
    periodEnd,
  };
}

async function rpc(admin: SupabaseClient, name: string, args: Record<string, unknown>) {
  const { data, error } = await admin.rpc(name, args);
  if (error) throw error;
  return data;
}

export async function ensureGenerationCreditBalance(userId: string) {
  const entitlement = await getUserBillingEntitlement(userId);
  const cycle = resolveCreditCycle(entitlement);
  if (!cycle) return { entitlement, balance: null };

  const data = await rpc(getGenerationAdminClient(), 'ensure_anisora_generation_credits', {
    p_user_id: userId,
    p_period_start: cycle.periodStart,
    p_period_end: cycle.periodEnd,
    p_allowance: PRO_MONTHLY_GENERATION_CREDITS,
  });
  return { entitlement, balance: readBalance(data) };
}

export async function reserveGenerationCredits(userId: string, taskId: string, amount: number) {
  const state = await ensureGenerationCreditBalance(userId);
  if (!state.balance) return { ...state, reserved: false };
  const data = await rpc(getGenerationAdminClient(), 'reserve_anisora_generation_credits', {
    p_user_id: userId,
    p_task_id: taskId,
    p_amount: amount,
  });
  return { ...state, reserved: data === true };
}

export async function settleGenerationCredits(userId: string, taskId: string) {
  const settled = await rpc(getGenerationAdminClient(), 'settle_anisora_generation_credits', {
    p_user_id: userId,
    p_task_id: taskId,
  });
  if (settled !== true) throw new Error('Generation credits could not be settled.');
}

export async function releaseGenerationCredits(userId: string, taskId: string) {
  const released = await rpc(getGenerationAdminClient(), 'release_anisora_generation_credits', {
    p_user_id: userId,
    p_task_id: taskId,
  });
  if (released !== true) throw new Error('Generation credits could not be released.');
}
