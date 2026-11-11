import { beforeEach, describe, expect, it, vi } from 'vitest';

import { importContact } from './users';

const { invokeRequest, sendApiUpdate, addUserToLocalDb, ImportedContacts } = vi.hoisted(() => ({
  invokeRequest: vi.fn(),
  sendApiUpdate: vi.fn(),
  addUserToLocalDb: vi.fn(),
  ImportedContacts: class {
    constructor(public users: unknown[], public imported: unknown[]) {}
  },
}));

vi.mock('../../../lib/gramjs', () => ({ Api: { contacts: {
  ImportedContacts,
  ImportContacts: class { constructor(params: unknown) { Object.assign(this, params); } },
} } }));
vi.mock('../../../util/numbers', () => ({ toJSNumber: vi.fn() }));
vi.mock('../apiBuilders/chats', () => ({ buildApiChatFromPreview: vi.fn() }));
vi.mock('../apiBuilders/common', () => ({ buildApiPhoto: vi.fn() }));
vi.mock('../apiBuilders/media', () => ({ buildApiAudioFromDocument: vi.fn() }));
vi.mock('../apiBuilders/peers', () => ({ buildApiPeerId: String }));
vi.mock('../apiBuilders/users', () => ({
  buildApiUser: (user: { id?: number; contact?: true }) => user.id ? {
    id: String(user.id), type: 'userTypeRegular', isContact: user.contact,
  } : undefined,
  buildApiUserFullInfo: vi.fn(),
  buildApiUserStatuses: vi.fn(),
}));
vi.mock('../gramjsBuilders', () => ({
  buildInputBirthday: vi.fn(), buildInputContact: (contact: unknown) => contact,
  buildInputEmojiStatus: vi.fn(), buildInputPeer: vi.fn(), buildInputTextWithEntities: vi.fn(),
  buildInputUser: vi.fn(), buildMtpPeerId: vi.fn(), getEntityTypeById: vi.fn(),
  DEFAULT_PRIMITIVES: { STRING: '' },
}));
vi.mock('../helpers/localDb', () => ({
  addUserToLocalDb, addDocumentToLocalDb: vi.fn(), addPhotoToLocalDb: vi.fn(), addSavedMusicRepairInfo: vi.fn(),
}));
vi.mock('../localDb', () => ({ default: {} }));
vi.mock('../updates/apiUpdateEmitter', () => ({ sendApiUpdate }));
vi.mock('./client', () => ({ invokeRequest }));
vi.mock('./messages', () => ({ searchMessagesInChat: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe('contact import publication', () => {
  it('publishes authoritative users so the open profile and contact list can update', async () => {
    const users = [{ id: 10, contact: true }, { id: 11 }];
    invokeRequest.mockResolvedValue(new ImportedContacts(users, [{ userId: 10 }]));

    expect(await importContact({ phone: 'fixture', firstName: 'Name' })).toBe('10');
    expect(addUserToLocalDb.mock.calls.map(([user]) => user)).toEqual(users);
    expect(sendApiUpdate.mock.calls.map(([update]) => update)).toEqual([
      { '@type': 'updateUser', id: '10', user: { id: '10', type: 'userTypeRegular', isContact: true } },
      { '@type': 'updateUser', id: '11', user: { id: '11', type: 'userTypeRegular', isContact: undefined } },
    ]);
  });

  it('does not invent contact membership for an unsuccessful import', async () => {
    invokeRequest.mockResolvedValue(new ImportedContacts([], []));
    expect(await importContact({ phone: 'fixture' })).toBeUndefined();
    expect(sendApiUpdate).not.toHaveBeenCalled();
  });

  it('ignores empty user constructors in the response', async () => {
    invokeRequest.mockResolvedValue(new ImportedContacts([{}], []));
    await importContact({ phone: 'fixture' });
    expect(sendApiUpdate).not.toHaveBeenCalled();
  });

  it('does not publish state when the request fails', async () => {
    invokeRequest.mockRejectedValue(new Error('fixture failure'));
    await expect(importContact({ phone: 'fixture' })).rejects.toThrow('fixture failure');
    expect(addUserToLocalDb).not.toHaveBeenCalled();
    expect(sendApiUpdate).not.toHaveBeenCalled();
  });
});
