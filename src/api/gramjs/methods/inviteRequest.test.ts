import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApiChat } from '../../types';

import { editExportedChatInvite } from './management';

const { invokeRequest } = vi.hoisted(() => ({ invokeRequest: vi.fn() }));

vi.mock('../../../lib/gramjs', () => ({ Api: { messages: {
  EditExportedChatInvite: class {
    constructor(params: Record<string, unknown>) { Object.assign(this, params); }
  },
} } }));
vi.mock('../../../lib/gramjs/errors', () => ({ RPCError: class extends Error {} }));
vi.mock('../../../config', () => ({ ACCEPTABLE_USERNAME_ERRORS: new Set() }));
vi.mock('../apiBuilders/chats', () => ({ buildApiExportedInvite: vi.fn(), buildChatInviteImporter: vi.fn() }));
vi.mock('../gramjsBuilders', () => ({ buildInputPeer: vi.fn(), buildInputChannel: vi.fn(), buildInputUser: vi.fn() }));
vi.mock('../updates/apiUpdateEmitter', () => ({ sendApiUpdate: vi.fn() }));
vi.mock('./client', () => ({ invokeRequest, dispatchErrorUpdate: vi.fn() }));

const peer = { id: '-1', type: 'chatTypeBasicGroup', title: 'Fixture' } as ApiChat;

beforeEach(() => { invokeRequest.mockReset(); });

describe('invite edit request contract', () => {
  it('clears a stored member cap when approval is enabled', async () => {
    await editExportedChatInvite({ peer, link: 'fixture', isRequestNeeded: true, usageLimit: 4 });
    expect(invokeRequest.mock.calls[0][0]).toMatchObject({ usageLimit: 0, requestNeeded: true });
  });

  it('preserves explicit zero when clearing both expiry and the member cap', async () => {
    await editExportedChatInvite({ peer, link: 'fixture', usageLimit: 0, expireDate: 0 });
    expect(invokeRequest.mock.calls[0][0]).toMatchObject({ usageLimit: 0, expireDate: 0 });
  });

  it('preserves a cap for ordinary invitations', async () => {
    await editExportedChatInvite({ peer, link: 'fixture', isRequestNeeded: false, usageLimit: 4 });
    expect(invokeRequest.mock.calls[0][0]).toMatchObject({ usageLimit: 4, requestNeeded: false });
  });

  it('does not invent omitted settings during a title-only edit', async () => {
    await editExportedChatInvite({ peer, link: 'fixture', title: 'Renamed' });
    expect(invokeRequest.mock.calls[0][0]).toMatchObject({ usageLimit: undefined, requestNeeded: undefined });
  });
});
