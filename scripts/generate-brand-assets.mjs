import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const mark = (await readFile(new URL("../public/favicon.svg", import.meta.url), "utf8"))
  .replace(/^<svg[^>]*>/, '<svg x="70" y="105" width="300" height="300" viewBox="0 0 64 64">');

const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f8fafc"/>
  <circle cx="1050" cy="80" r="260" fill="#e1f3fb"/>
  <path d="M0 630V440L250 180 470 630Z" fill="#edf5fb"/>
  ${mark}
  <text x="400" y="294" fill="#0b2d5b" font-family="Inter,Arial,sans-serif" font-size="132" font-weight="750" letter-spacing="-7">VCode</text>
  <text x="404" y="372" fill="#385471" font-family="Inter,Arial,sans-serif" font-size="36">Technologie, na které je spoleh.</text>
  <line x1="100" y1="520" x2="1100" y2="520" stroke="#d5e1eb"/>
  <text x="100" y="571" fill="#5d748c" font-family="Inter,Arial,sans-serif" font-size="27">Mobilita · bezpečnost · zdraví · řízení organizací</text>
</svg>`;

await sharp(Buffer.from(social)).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL("../public/vcode-social.png", import.meta.url)));
console.log("Generated public/vcode-social.png");
