import {
  generateRandomBytes,
  modExp,
  readBigIntFromBuffer,
  readBufferFromBigInt,
  sha1,
} from '../Helpers';

export const SERVER_KEYS = [
  // MVSy (BeHappy) server RSA key — DC1 (silent-friend, K8s)
  // Fingerprint computed from /opt/behappy/bh-mvsy/priv/rsa_private.pem
  {
    fingerprint: BigInt('-2463690031186951546'),
    n: BigInt(
      '2406444647177473533718412530532565171056955000799371943015212831775198794964341567090757464159725464'
      + '4570949454582164784781819746236520067864814622874059297587362232177993133013418248288406965473281306'
      + '0085468702513834239815787133736439853857849491534568371458922597677400937679979905002571476617455056'
      + '2213878744412403945894783008744873881138580546904805660755702609231669567811562302779929509706485384'
      + '1882417285917996832046044861322485251543620193743017864639695345149620505135346309762382252857474115'
      + '7398324006056261611837702521242505709658837191796335768621272291619164849653213335588471207828746080'
      + '72946305623660107',
    ),
    e: 65537,
  },
].reduce((acc, { fingerprint, ...keyInfo }) => {
  acc.set(fingerprint, keyInfo);
  return acc;
}, new Map<bigint, { n: bigint; e: number }>());

/**
 * Encrypts the given data known the fingerprint to be used
 * in the way Telegram requires us to do so (sha1(data) + data + padding)

 * @param fingerprint the fingerprint of the RSA key.
 * @param data the data to be encrypted.
 * @returns {Buffer|*|undefined} the cipher text, or undefined if no key matching this fingerprint is found.
 */
export async function encrypt(fingerprint: bigint, data: Buffer) {
  const key = SERVER_KEYS.get(fingerprint);
  if (!key) {
    return undefined;
  }

  // len(sha1.digest) is always 20, so we're left with 255 - 20 - x padding
  const rand = generateRandomBytes(235 - data.length);

  const toEncrypt = Buffer.concat([await sha1(data), data, rand]);

  // rsa module rsa.encrypt adds 11 bits for padding which we don't want
  // rsa module uses rsa.transform.bytes2int(to_encrypt), easier way:
  const payload = readBigIntFromBuffer(toEncrypt, false);
  const encrypted = modExp(payload, BigInt(key.e), key.n);
  // rsa module uses transform.int2bytes(encrypted, keylength), easier:
  return readBufferFromBigInt(encrypted, 256, false);
}
