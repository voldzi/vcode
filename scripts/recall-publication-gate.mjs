import { readRegular, exact, parseManifest, digest, readTrustedKey, verifyReceipt, publicMetadata, canonical } from '../services/downloads/release.mjs';

/** Private build proof is an input only. Never copy it to static output or log it. */
export async function verifyPublicReleaseBuild({ publicRelease, proofFile, keyFile, approvedPrivacySHA256 }) {
  if (!publicRelease || !proofFile || !keyFile) throw new Error('Accepted Recall build proof and publisher trust are required');
  const proof = JSON.parse(await readRegular(proofFile, 131_072));
  exact(proof, ['schemaVersion', 'manifestBase64', 'receipt'], 'private build proof');
  if (proof.schemaVersion !== 1 || typeof proof.manifestBase64 !== 'string') throw new Error('Invalid private build proof');
  const bytes = Buffer.from(proof.manifestBase64, 'base64');
  if (!bytes.length || bytes.toString('base64') !== proof.manifestBase64) throw new Error('Invalid manifest encoding');
  const manifest = parseManifest(bytes);
  const acceptance = verifyReceipt(proof.receipt, manifest, digest(bytes), await readTrustedKey(keyFile));
  if (!/^[a-f0-9]{64}$/.test(approvedPrivacySHA256 ?? '') || proof.receipt.payload.privacy.noticeSHA256 !== approvedPrivacySHA256) throw new Error('Published privacy copy does not match signed approval');
  const accepted = publicMetadata({ active:{ id:`${manifest.version}-${manifest.buildNumber}`, manifest, acceptance } });
  if (canonical(accepted) !== canonical(publicRelease)) throw new Error('Public metadata does not match the exact accepted release');
}
