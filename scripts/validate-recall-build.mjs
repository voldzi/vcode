import { readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../src/lib/products.ts';
import { getRecallRelease } from '../src/lib/recallRelease.ts';
import { verifyPublicReleaseBuild } from './recall-publication-gate.mjs';
import { createHash } from 'node:crypto';
import approval from '../src/data/recall-legal-approval.json' with { type: 'json' };


// Dev-only preview routes are never part of the distributable static site.
const root = new URL('../dist/', import.meta.url);
const recall = products.find(product => product.id === 'vcode-recall');
const release = getRecallRelease();
for (const [kind, file] of [['privacy', 'recall-download-privacy-review.md'], ['terms', 'recall-distribution-terms-review.md']]) {
  const bytes = await readFile(new URL(`../docs/${file}`, import.meta.url));
  if (createHash('sha256').update(bytes).digest('hex') !== approval[kind]) throw new Error('Recall approved copy changed');
}
if (recall?.publication === 'draft') {
  if (release) throw new Error('A draft cannot contain an active public Recall release');
  const assetRoot = new URL('images/products/', root);
  for (const file of await readdir(assetRoot).catch(() => [])) {
    if (/^recall-[a-z-]+\.(?:png|webp|svg)$/.test(file)) await rm(new URL(file, assetRoot));
  }
  await rm(new URL('recall-downloads.js', root), { force: true });
} else if (recall) {
  if (!release) throw new Error('Publishing Recall requires accepted public release metadata');
  await verifyPublicReleaseBuild({publicRelease:release, proofFile:process.env.VCODE_RECALL_BUILD_PROOF, keyFile:process.env.VCODE_RECALL_BUILD_TRUST, approvedPrivacySHA256:approval.privacy});
  for (const prefix of ['', 'en/']) for (const kind of ['privacy', 'terms']) {
    const page = await readFile(new URL(`${prefix}vcode-recall/${kind}/index.html`, root), 'utf8');
    if (!page.includes(`data-recall-approved-copy="${approval[kind]}"`)) throw new Error('Recall public legal page missing approved copy');
  }
}

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['_preview', 'preview-local'].includes(entry.name)) throw new Error('Private preview was emitted by the production build');
      await inspect(path);
    } else if (/\.(?:html|xml|txt)$/.test(entry.name)) {
      const content = await readFile(path, 'utf8');
      if (content.includes('/preview-local/')) throw new Error(`Private preview link in ${path}`);
      if (recall?.publication === 'draft' && /vcode-recall|VCode Recall|chromadb-status/.test(content)) {
        throw new Error(`Draft Recall content in ${path}`);
      }
    }
  }
}
await inspect(fileURLToPath(root));
console.log('Production output excludes private previews and unpublished Recall content.');
