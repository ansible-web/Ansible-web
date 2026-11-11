import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const MANIFEST_NAME = '.ansible-assets.json';
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_FILES = 30000;
const HASHED_ASSET = /[-.][\w-]{8,64}\.(?:js|css|wasm|bin|json|svg|png|jpe?g|webp|gif|woff2?|ttf|ass)$/;

await composeAssets(...process.argv.slice(2));

async function composeAssets(currentRoot, previousRoot, outputRoot) {
  if (!currentRoot || !previousRoot || !outputRoot) {
    throw new Error('Usage: node retainAssets.mjs CURRENT PREVIOUS NEW_OUTPUT');
  }
  const roots = [currentRoot, previousRoot, outputRoot].map((root) => path.resolve(root));
  if (roots.some((root, index) => roots.some((other, otherIndex) => index !== otherIndex
    && (root === other || root.startsWith(`${other}${path.sep}`))))) {
    throw new Error('Asset directories must be separate and cannot contain each other');
  }
  const now = Date.now();
  const current = await inventory(currentRoot);
  const previous = await inventory(previousRoot);
  const previousManifest = await readManifest(previousRoot);
  const entries = new Map();
  let retainedCount = 0;
  let totalBytes = 0;
  const copies = [];

  for (const [relative, file] of current) {
    totalBytes += file.size;
    copies.push([file.source, relative]);
    if (HASHED_ASSET.test(relative)) entries.set(relative, { sha256: file.sha256 });
  }
  for (const [relative, file] of previous) {
    if (!HASHED_ASSET.test(relative)) continue;
    const oldEntry = previousManifest?.[relative];
    if (previousManifest && (!oldEntry || oldEntry.sha256 !== file.sha256
      || (oldEntry.retiredAt !== undefined
        && (!Number.isSafeInteger(oldEntry.retiredAt) || oldEntry.retiredAt < 0 || oldEntry.retiredAt > now)))) {
      throw new Error(`Previous asset manifest does not match ${relative}`);
    }
    const retiredAt = oldEntry?.retiredAt ?? now;
    const replacement = current.get(relative);
    if (replacement) {
      if (replacement.sha256 !== file.sha256) throw new Error(`Immutable asset collision: ${relative}`);
      continue;
    }
    if (now - retiredAt > RETENTION_MS) continue;
    entries.set(relative, { sha256: file.sha256, retiredAt });
    totalBytes += file.size;
    retainedCount += 1;
    copies.push([file.source, relative]);
  }
  if (totalBytes > MAX_BYTES || copies.length > MAX_FILES) {
    throw new Error('Asset retention exceeds 2 GiB / 30000 files; release requires review');
  }
  // The destination is new: a failed composition cannot modify either input release
  await fs.mkdir(outputRoot);
  for (const [source, relative] of copies) {
    const destination = path.join(outputRoot, relative);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(source, destination);
  }
  await fs.writeFile(path.join(outputRoot, MANIFEST_NAME), JSON.stringify({
    version: 1,
    assets: Object.fromEntries(entries),
  }));
  process.stdout.write(`${JSON.stringify({
    currentFiles: current.size,
    retainedFiles: retainedCount,
    bytes: totalBytes,
    retentionDays: 7,
  })}\n`);
}

async function inventory(root, relativeRoot = '') {
  const result = new Map();
  for (const entry of await fs.readdir(path.join(root, relativeRoot), { withFileTypes: true })) {
    const relative = path.posix.join(relativeRoot, entry.name);
    if (relative === MANIFEST_NAME) continue;
    if (entry.name.startsWith('.') || entry.isSymbolicLink()) throw new Error(`Unexpected asset entry: ${relative}`);
    if (entry.isDirectory()) {
      for (const [name, file] of await inventory(root, relative)) result.set(name, file);
    } else if (entry.isFile()) {
      const source = path.join(root, relative);
      const data = await fs.readFile(source);
      result.set(relative, { source, size: data.length, sha256: createHash('sha256').update(data).digest('hex') });
    } else {
      throw new Error(`Unsupported asset entry: ${relative}`);
    }
  }
  return result;
}

async function readManifest(root) {
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(root, MANIFEST_NAME), 'utf8'));
    if (manifest.version !== 1 || !manifest.assets || typeof manifest.assets !== 'object') {
      throw new Error('Unsupported previous asset manifest');
    }
    return manifest.assets;
  } catch (err) {
    if (err.code === 'ENOENT') return undefined;
    throw err;
  }
}
