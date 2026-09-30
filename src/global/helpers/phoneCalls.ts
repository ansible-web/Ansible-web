import type { ApiPhoneCall } from '../../api/types';

// Ids of P2P calls this tab has already finished (phoneCall cleared by hangUp). A late update for
// such a call must not touch the current state: the async updater merges every update into
// `phoneCall`, so a stale discard would turn the NEXT call into "old id, discarded".
const finishedPhoneCallIds = new Set<string>();
const MAX_REMEMBERED = 50;

export function markPhoneCallFinished(callId?: string) {
  if (!callId) return;
  finishedPhoneCallIds.add(callId);
  if (finishedPhoneCallIds.size > MAX_REMEMBERED) {
    const oldest = finishedPhoneCallIds.values().next().value;
    if (oldest !== undefined) finishedPhoneCallIds.delete(oldest);
  }
}

export function isStalePhoneCallUpdate(current: ApiPhoneCall | undefined, call: ApiPhoneCall) {
  if (finishedPhoneCallIds.has(call.id)) return true;

  // An outgoing call that is still waiting for phone.requestCall has no id yet. The server answers
  // the request on the same connection before the callee even learns about the call, so a discard
  // arriving in this window can only belong to an earlier call.
  return Boolean(current && !current.id && call.state === 'discarded');
}
