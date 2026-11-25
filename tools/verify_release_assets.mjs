import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_KEY_B64 = 'uyZB0MwoT6t4z5Ry8XYjec6wwI4QA7ULACQdBSd4l+M=';
const SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
const publicKey = crypto.createPublicKey({
  key: Buffer.concat([SPKI_PREFIX, Buffer.from(PUBLIC_KEY_B64, 'base64')]),
  format: 'der',
  type: 'spki'
});

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortObject(value[key])]));
  }
  return value;
}

const files = fs.readdirSync(process.argv[2] ?? '.');
const manifests = files.filter(name => /^(linux|windows|android)-stable\.json$/.test(name));
if (manifests.length === 0) throw new Error('No platform stable manifests were downloaded.');

for (const manifestName of manifests) {
  const envelope = JSON.parse(fs.readFileSync(path.join(process.argv[2], manifestName), 'utf8'));
  if (!envelope || typeof envelope !== 'object' || !envelope.payload || typeof envelope.payload !== 'object') {
    throw new Error(`${manifestName}: malformed signed envelope`);
  }
  const payload = envelope.payload;
  if (typeof envelope.signature !== 'string' || typeof payload.version !== 'string' ||
      typeof payload.url !== 'string' || typeof payload.sha256 !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(payload.sha256) || !Number.isSafeInteger(payload.size) || payload.size <= 0) {
    throw new Error(`${manifestName}: malformed payload`);
  }
  const canonical = Buffer.from(JSON.stringify(sortObject(payload)), 'utf8');
  const signature = Buffer.from(envelope.signature, 'base64');
  if (!crypto.verify(null, canonical, publicKey, signature)) {
    throw new Error(`${manifestName}: Ed25519 signature invalid`);
  }
  const url = new URL(payload.url);
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' ||
      !url.pathname.includes('/grevechris-ux/NOMAD-Proof/releases/download/')) {
    throw new Error(`${manifestName}: release URL is not an approved GitHub asset URL`);
  }
  const assetName = path.basename(url.pathname);
  const artifactPath = path.join(process.argv[2] ?? '.', assetName);
  if (!fs.existsSync(artifactPath)) throw new Error(`${manifestName}: referenced asset ${assetName} is missing`);
  const bytes = fs.readFileSync(artifactPath);
  if (bytes.length !== payload.size) throw new Error(`${manifestName}: artifact size mismatch`);
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (digest !== payload.sha256.toLowerCase()) throw new Error(`${manifestName}: artifact SHA-256 mismatch`);
  console.log(`PASS ${manifestName}: v${payload.version}, ${assetName}, Ed25519 and SHA-256 verified`);
}
