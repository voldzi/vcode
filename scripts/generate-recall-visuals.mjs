import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Deterministic marketing illustrations; never launches the app or reads indexes.
// Supply only the approved public brand PNG, never an app bundle or runtime directory.
const sourceIcon = process.argv[2];
if (!sourceIcon || !sourceIcon.endsWith('/AppIcon-vcode-recall.png')) {
  throw new Error('Provide the approved public AppIcon-vcode-recall.png source.');
}
const output = fileURLToPath(new URL('../public/images/products/', import.meta.url));
await mkdir(output, { recursive: true });
const source = await readFile(sourceIcon);
await sharp(source).resize(512, 512).png({ compressionLevel: 9 }).toFile(`${output}recall-icon.png`);
await sharp(source).resize(512, 512).webp({ quality: 92, effort: 6 }).toFile(`${output}recall-icon.webp`);
const embeddedIcon = (await sharp(source).resize(128, 128).png().toBuffer()).toString('base64');

const content = {
  cs: {
    title: 'Ilustrace přehledu VCode Recall',
    description: 'Syntetická ukázka přehledu na Macu: místní služba, tři fiktivní projekty, profil embeddingu a stav MCP. Nejde o snímek běžící aplikace ani měření výkonu.',
    label: 'ILUSTRACE ROZHRANÍ · SYNTETICKÁ DATA',
    overview: 'Přehled', projects: 'Projekty', operations: 'Operace', settings: 'Nastavení',
    refresh: 'Obnovit', diagnostics: 'Diagnostika',
    status: 'V pořádku', statusNote: 'Ukázkový stav místní služby a připravenosti projektů.',
    local: 'Na vašem Macu', native: 'Nativní runtime',
    verified: 'Ověřené projekty', fictional: 'Fiktivní projekty', ready: 'Připraveno',
    mcp: 'Centrální MCP', mcpCaption: 'Připojení pro AI klienty',
    model: 'Embedding', modelCaption: 'Přibalený místní model', modelValue: 'Lokální',
    projectCaption: 'Připravenost vybraných projektů', indexed: 'Indexováno',
    recent: 'Poslední operace', recentCaption: 'Ilustrační průběh obnovy indexu',
    reindex: 'Obnova indexu', done: 'Hotovo', progress: 'Probíhá činnost',
    footnote: 'Náhled návrhu prezentace. Názvy, hodnoty a stavy jsou smyšlené; nejsou výsledkem provozního testu.',
  },
  en: {
    title: 'VCode Recall overview illustration',
    description: 'Synthetic Mac dashboard illustration: local service, three fictional projects, embedding profile and MCP status. This is not a running app screenshot or performance measurement.',
    label: 'INTERFACE ILLUSTRATION · SYNTHETIC DATA',
    overview: 'Overview', projects: 'Repositories', operations: 'Operations', settings: 'Settings',
    refresh: 'Refresh', diagnostics: 'Diagnostics',
    status: 'Healthy', statusNote: 'Illustrative local service and project readiness state.',
    local: 'On your Mac', native: 'Native runtime',
    verified: 'Verified repositories', fictional: 'Fictional projects', ready: 'Ready',
    mcp: 'Central MCP', mcpCaption: 'Connection for AI clients',
    model: 'Embedding', modelCaption: 'Bundled local model', modelValue: 'Local',
    projectCaption: 'Readiness of selected repositories', indexed: 'Indexed',
    recent: 'Recent operations', recentCaption: 'Illustrative index update progress',
    reindex: 'Reindex', done: 'Done', progress: 'Operation in progress',
    footnote: 'Presentation concept. Names, values and statuses are fictional; they are not operational test results.',
  },
};

const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (x, y, value, size = 24, fill = '#2b4561', weight = 500, extra = '') => `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${escape(value)}</text>`;
const rect = (x, y, width, height, fill, radius = 16, stroke = 'none') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const check = (x, y, fill = '#16845c', scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><circle r="18" fill="${fill}"/><path d="m-7 0 5 5 10-11" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const folder = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0 7V2a4 4 0 0 1 4-4h15l7 7h22a4 4 0 0 1 4 4v29a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5Z" fill="#e6f1ff" stroke="#367ec9" stroke-width="2"/><path d="M0 10h52" stroke="#367ec9" stroke-width="2"/></g>`;
const sidebarIcon = (x, y, type, active) => {
  const stroke = active ? '#2068c6' : '#74859b';
  const shapes = type === 'overview'
    ? '<path d="M1 21V3M1 21h24M5 16l7-7 6 4 6-8"/>'
    : type === 'projects'
      ? '<path d="M2 21V5h9l4 4h11v12Z"/>'
      : '<rect x="2" y="3" width="24" height="21" rx="4"/><path d="m7 9 5 5-5 5m8 0h6"/>';
  return `<g transform="translate(${x} ${y})" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${shapes}</g>`;
};

for (const [locale, c] of Object.entries(content)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="1120" viewBox="0 0 1600 1120" role="img" aria-labelledby="title description" xml:lang="${locale}">
  <title id="title">${escape(c.title)}</title><desc id="description">${escape(c.description)}</desc>
  <defs>
    <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e9f3ff"/><stop offset=".55" stop-color="#edf1ff"/><stop offset="1" stop-color="#ecfaff"/></linearGradient>
    <linearGradient id="hero" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e7f5f0"/><stop offset="1" stop-color="#f2faf8"/></linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#2864d5"/><stop offset="1" stop-color="#39afd6"/></linearGradient>
    <filter id="shadow" x="-15%" y="-15%" width="130%" height="135%"><feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#496b9b" flood-opacity=".17"/></filter>
    <clipPath id="window"><rect x="80" y="114" width="1440" height="856" rx="25"/></clipPath>
  </defs>
  ${rect(0, 0, 1600, 1120, 'url(#canvas)', 0)}
  <circle cx="1470" cy="1040" r="320" fill="#d6f2fa" opacity=".55"/><circle cx="140" cy="160" r="310" fill="#dceafe" opacity=".6"/>
  ${text(80, 65, c.label, 20, '#415b80', 700, 'letter-spacing="1.6"')}
  <g filter="url(#shadow)">${rect(80, 114, 1440, 856, '#fbfcff', 25, '#d1ddeb')}</g>
  <g clip-path="url(#window)">
    ${rect(80, 114, 1440, 64, '#f8faff', 0)}
    <path d="M80 178h1440" stroke="#dce4ee"/>
    <circle cx="112" cy="146" r="8" fill="#ed6a5e"/><circle cx="138" cy="146" r="8" fill="#f4bf4f"/><circle cx="164" cy="146" r="8" fill="#61c454"/>
    ${text(198, 155, 'VCode Recall', 22, '#1d3555', 700)}
    ${rect(1150, 128, 137, 36, '#fff', 9, '#d9e2ee')}${text(1169, 153, c.refresh, 19, '#43617e', 600)}
    ${rect(1300, 128, 188, 36, '#fff', 9, '#d9e2ee')}${text(1319, 153, c.diagnostics, 19, '#43617e', 600)}
    ${rect(80, 178, 258, 792, '#f0f4fb', 0)}
    <path d="M338 178v792" stroke="#dde5f0"/>
    <image x="111" y="215" width="62" height="62" xlink:href="data:image/png;base64,${embeddedIcon}"/>
    ${text(187, 244, 'VCode', 22, '#18344f', 700)}${text(187, 269, 'Recall', 22, '#18344f', 700)}
    ${rect(101, 310, 216, 54, '#ddeaff', 12)}
    ${sidebarIcon(119, 323, 'overview', true)}${text(161, 345, c.overview, 22, '#2068c6', 700)}
    ${sidebarIcon(119, 390, 'projects', false)}${text(161, 411, c.projects, 22, '#50657d', 600)}
    ${sidebarIcon(119, 455, 'operations', false)}${text(161, 476, c.operations, 22, '#50657d', 600)}
    ${rect(103, 833, 212, 94, '#e5ecf7', 14)}
    <circle cx="127" cy="858" r="5" fill="#44856f"/>
    ${text(143, 865, c.local, 18, '#506b7e', 600)}${text(123, 900, c.native, 18, '#52677f', 500)}
    ${text(377, 228, c.overview, 31, '#172d4c', 700)}
    ${rect(377, 251, 1103, 158, 'url(#hero)', 17, '#d9ebe2')}
    ${check(433, 308, '#258c68', 1.25)}
    ${text(479, 300, c.status, 34, '#1b634d', 700)}
    ${text(479, 338, c.statusNote, 22, '#4d7268', 500)}
    ${rect(479, 361, 199, 31, '#daeee6', 10)}${text(493, 383, c.native, 17, '#2c765d', 600)}
    ${rect(694, 361, 169, 31, '#e2edf6', 10)}${text(709, 383, c.local, 17, '#3d6080', 600)}
    ${rect(377, 433, 355, 151, '#fff', 17, '#dce6f1')}
    ${text(398, 467, c.verified, 21, '#667e99', 600)}
    ${text(398, 528, '3 / 3', 43, '#294c82', 700)}${text(398, 559, c.fictional, 19, '#536a86', 500)}
    ${rect(751, 433, 355, 151, '#fff', 17, '#dce6f1')}
    ${text(772, 467, c.mcp, 21, '#667e99', 600)}${check(786, 515, '#278c70', .7)}
    ${text(808, 526, c.ready, 33, '#276f5d', 700)}${text(772, 559, c.mcpCaption, 19, '#536a86', 500)}
    ${rect(1125, 433, 355, 151, '#fff', 17, '#dce6f1')}
    ${text(1146, 467, c.model, 21, '#667e99', 600)}
    ${text(1146, 528, c.modelValue, 38, '#674bad', 700)}${text(1146, 559, c.modelCaption, 19, '#536a86', 500)}
    ${rect(377, 609, 690, 311, '#fff', 17, '#dce6f1')}
    ${text(400, 647, c.projects, 26, '#243f60', 700)}${text(400, 677, c.projectCaption, 19, '#536a86', 500)}
    ${['Lumen', 'Atlas', 'Orion'].map((name, i) => {
      const y = 705 + i * 66;
      return `${i > 0 ? `<path d="M400 ${y-13}h644" stroke="#ebf0f7"/>` : ''}${folder(405, y + 1)}${text(477, y + 25, name, 22, '#2f4c70', 600)}${check(899, y + 16, '#268b68', .5)}${text(918, y + 24, c.indexed, 18, '#378068', 600)}`;
    }).join('')}
    ${rect(1088, 609, 392, 311, '#fff', 17, '#dce6f1')}
    ${text(1110, 647, c.recent, 24, '#243f60', 700)}${text(1110, 677, c.recentCaption, 17, '#536a86', 500)}
    ${text(1110, 728, c.reindex, 23, '#315580', 600)}${text(1110, 758, 'Orion', 21, '#5e7796', 500)}
    ${rect(1110, 780, 347, 10, '#e7edf8', 5)}${rect(1110, 780, 226, 10, 'url(#bar)', 5)}
    ${text(1110, 827, c.progress, 19, '#3370b0', 600)}
    ${text(1110, 880, `Lumen · ${c.done}`, 18, '#57758e', 500)}
  </g>
  ${text(80, 1036, c.footnote, 20, '#536b87', 500)}
</svg>`;
  await writeFile(`${output}recall-overview-${locale}.svg`, svg, 'utf8');
  await sharp(Buffer.from(svg)).webp({ quality: 93, effort: 6 }).toFile(`${output}recall-overview-${locale}.webp`);
}

console.log(JSON.stringify({
  sourceIconSha256: createHash('sha256').update(source).digest('hex'),
  output,
  illustrations: 'Synthetic only; not running application screenshots or benchmarks.',
}, null, 2));
