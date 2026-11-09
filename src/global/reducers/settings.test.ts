import { describe, expect, it, vi } from 'vitest';

import type { GlobalState } from '../types';

import { addBlockedUser, removeBlockedUser } from './settings';

vi.mock('../selectors/sharedState', () => ({ selectSharedSettings: vi.fn() }));
vi.mock('./sharedState', () => ({ updateSharedState: vi.fn() }));
vi.mock('./users', () => ({
  updateUserBlockedState: (state: GlobalState, id: string, isBlocked: boolean) => ({
    ...state,
    users: {
      ...state.users,
      fullInfoById: { ...state.users.fullInfoById, [id]: { ...state.users.fullInfoById[id], isBlocked } },
    },
  }),
}));

function fixture(ids: string[] = [], totalCount = ids.length, isBlocked?: boolean) {
  return { blocked: { ids, totalCount }, users: { fullInfoById: { p: { isBlocked } } } } as GlobalState;
}

describe('blocked peer state is idempotent across response and update delivery', () => {
  it('applies an echoed block once', () => {
    const once = addBlockedUser(fixture(), 'p');
    expect(addBlockedUser(once, 'p').blocked).toEqual({ ids: ['p'], totalCount: 1 });
  });
  it('applies an echoed unblock once', () => {
    const once = removeBlockedUser(fixture(['p', 'q']), 'p');
    expect(removeBlockedUser(once, 'p').blocked).toEqual({ ids: ['q'], totalCount: 1 });
  });
  it('does not decrement an unknown unblocked peer', () => {
    expect(removeBlockedUser(fixture(['q']), 'p').blocked).toEqual({ ids: ['q'], totalCount: 1 });
  });
  it('uses known full info for a peer outside the loaded list', () => {
    expect(removeBlockedUser(fixture(['q'], 10, true), 'p').blocked.totalCount).toBe(9);
  });
  it('does not add a known blocked peer twice', () => {
    expect(addBlockedUser(fixture(['q'], 10, true), 'p').blocked).toEqual({ ids: ['p', 'q'], totalCount: 10 });
  });
  it('repairs an old negative count', () => {
    expect(removeBlockedUser(fixture([], -1), 'p').blocked.totalCount).toBe(0);
  });
  it('keeps count at least as large as the loaded set', () => {
    expect(removeBlockedUser(fixture(['p', 'q'], 0), 'p').blocked.totalCount).toBe(1);
  });
  it('preserves an empty list through repeated cycles', () => {
    let global = fixture();
    for (let i = 0; i < 3; i++) {
      global = addBlockedUser(addBlockedUser(global, 'p'), 'p');
      global = removeBlockedUser(removeBlockedUser(global, 'p'), 'p');
    }
    expect(global.blocked).toEqual({ ids: [], totalCount: 0 });
    expect(global.users.fullInfoById.p.isBlocked).toBe(false);
  });
});
