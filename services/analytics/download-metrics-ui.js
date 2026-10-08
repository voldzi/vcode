'use strict';
(() => {
  const copy = {
    cs: {
      heading: 'Distribuce aplikací', subtitle: 'VCode Recall · vydání a přenos souborů',
      preparation: 'Distribuce se připravuje', unavailable: 'Provozní souhrn není dostupný',
      preparationText: 'Ověřený veřejný balíček a měření zatím nejsou aktivní. Nedostupné údaje neznamenají nulu stažení.',
      unavailableText: 'Agregované údaje se nepodařilo bezpečně načíst. Není možné z nich určit počet požadavků ani přenosů.',
      empty: 'Zatím bez záznamů', emptyText: 'V tomto období nejsou uložené provozní záznamy. Chybějící dny nedoplňujeme nulami.',
      interpretation: 'Jde o kliknutí a provozní požadavky, ne počet instalací nebo unikátních lidí. Roboty, opakované pokusy a obnovené přenosy nelze považovat za nové uživatele.',
      boundary: 'Objem a dokončení se měří mezi službou a webovou proxy. Neprokazují převzetí celého souboru na zařízení ani jeho instalaci.',
      retention: 'Agregace nejvýše 30 dní · UTC · bez návštěvnických identifikátorů', loaded: 'Poslední agregace',
      period: 'Dostupné období', capped: 'Pro distribuci je dostupných nejvýše 30 dní, i při výběru delšího období.',
      clicks: 'Kliknutí na stažení', clicksHelp: 'Zaznamenané klientské kliknutí se souhlasným nastavením měření. Respektuje DNT/GPC; blokování, roboti a opakovaná kliknutí ovlivňují počty. Kliknutí nepotvrzuje přenos ani instalaci.',
      get: 'Požadavky GET na soubory', getHelp: 'Všechny zaznamenané požadavky na povolený ZIP nebo DMG, včetně rozsahů, robotů, opakování a chyb. Požadavky na manifest, kontrolní součet nebo latest jsou oddělené.',
      head: 'Kontroly HEAD souborů', headHelp: 'Požadavky pouze na hlavičky souboru. Nepřenášejí obsah souboru a nejsou stažením.',
      full: 'Dokončené odpovědi 200', fullHelp: 'Služba dokončila zápis celého souboru do proxy v odpovědi HTTP 200. Nejde o potvrzení doručení do koncového zařízení ani instalace.',
      range: 'Dokončené rozsahy 206', rangeHelp: 'Dokončené HTTP 206 odpovědi s vybraným rozsahem bajtů. Jeden soubor může vyvolat více rozsahů. Nesčítají se jako kompletní stažení.',
      errors: 'Chybové odpovědi', errorsHelp: 'Zaznamenané chybové odpovědi na požadavky souborů. Patří sem například nepovolené rozsahy; příčinu je nutné ověřit provozně.',
      aborted: 'Přerušené odpovědi', abortedHelp: 'Odpovědi, které služba nedokončila. Zapsané bajty mohou být započítané v objemu, ale odpověď se nepočítá jako dokončený přenos.',
      bytes: 'Zapsaný objem', bytesHelp: 'Bajty těla souborů zapsané službou směrem k proxy. Zahrnují rozsahy a částečné přerušené přenosy. Nezahrnují hlavičky ani důkaz přijetí prohlížečem.',
      trajectory: 'Požadavky na soubory v čase', chartHint: 'Denní GET na povolené ZIP/DMG · UTC. Mezery znamenají chybějící záznam, nikoli naměřenou nulu.',
      table: 'Zobrazit denní údaje', day: 'Den (UTC)', files: 'Vydání a soubory', version: 'Vydání', file: 'Povolený soubor',
      metadata: 'Metadata a doprovodné soubory', metadataHelp: 'GET / HEAD na latest, manifest, kontrolní součty, licence nebo zdrojové archivy otevřených součástí. Počty a objem jsou oddělené od instalačních ZIP/DMG; bez rozlišení jednotlivých doprovodných souborů.',
      coverage: 'Provozní čítače od', missing: 'Bez záznamu',
    },
    en: {
      heading: 'Application distribution', subtitle: 'VCode Recall · releases and file transfers',
      preparation: 'Distribution is being prepared', unavailable: 'Operational summary unavailable',
      preparationText: 'A verified public package and measurement are not active yet. Unavailable data does not mean zero downloads.',
      unavailableText: 'The aggregates could not be read safely. Request and transfer counts cannot be established from unavailable data.',
      empty: 'No records yet', emptyText: 'No operational records are stored for this period. Missing days are not filled with zeroes.',
      interpretation: 'These are clicks and operational requests, not installations or unique people. Robots, retries and resumed transfers do not represent new users.',
      boundary: 'Volume and completion are measured from the service to the web proxy. They do not confirm receipt of a complete file on the device or installation.',
      retention: 'Up to 30 days of aggregates · UTC · no visitor identifiers', loaded: 'Last aggregation',
      period: 'Available period', capped: 'Distribution data covers up to 30 days, even when a longer period is selected.',
      clicks: 'Download clicks', clicksHelp: 'Recorded client clicks when measurement is permitted. DNT/GPC is respected; blocking, robots and repeat clicks affect counts. A click confirms neither a transfer nor installation.',
      get: 'File GET requests', getHelp: 'All recorded requests for allowed ZIP or DMG files, including ranges, robots, retries and errors. Manifest, checksum and latest requests are separate.',
      head: 'File HEAD checks', headHelp: 'Requests for file headers only. They transfer no file body and are not downloads.',
      full: 'Completed 200 responses', fullHelp: 'The service finished writing a complete file to the proxy in an HTTP 200 response. This confirms neither receipt on the end device nor installation.',
      range: 'Completed 206 ranges', rangeHelp: 'Completed HTTP 206 responses for selected byte ranges. One file can produce many ranges. These are not added together as complete downloads.',
      errors: 'Error responses', errorsHelp: 'Recorded errors for file requests, for example unsupported ranges. Their causes require operational investigation.',
      aborted: 'Aborted responses', abortedHelp: 'Responses not completed by the service. Bytes written may contribute to volume, but the response is not a completed transfer.',
      bytes: 'Bytes written', bytesHelp: 'File-body bytes written from the service towards the proxy, including ranges and partial aborted transfers. Excludes headers and does not prove browser receipt.',
      trajectory: 'File requests over time', chartHint: 'Daily GET requests for allowed ZIP/DMG files · UTC. Gaps indicate missing records, not measured zeroes.',
      table: 'Show daily values', day: 'Day (UTC)', files: 'Releases and files', version: 'Release', file: 'Allowed file',
      metadata: 'Metadata and supplementary files', metadataHelp: 'GET / HEAD for latest, a manifest, checksums, licences or open-source archives. Counts and volume are separate from installer ZIP/DMG transfers; individual supplementary files are not distinguished.',
      coverage: 'Operational counters since', missing: 'No record',
    },
  };
  const counters = [['clickIntents', 'clicks'], ['getRequests', 'get'], ['headRequests', 'head'], ['fullResponses', 'full'], ['rangeResponses', 'range'], ['errorResponses', 'errors'], ['abortedResponses', 'aborted'], ['bytesWritten', 'bytes']];
  const make = (tag, className, text) => { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; };
  const format = (number, language) => new Intl.NumberFormat(language === 'en' ? 'en-GB' : 'cs-CZ').format(number);
  const bytes = (number, language) => {
    if (number < 1024) return `${format(number, language)} B`;
    const units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    let size = number / 1024, unit = 0;
    while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++; }
    return `${new Intl.NumberFormat(language === 'en' ? 'en-GB' : 'cs-CZ', { maximumFractionDigits: 1 }).format(size)} ${units[unit]}`;
  };
  const day = (value, language) => new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'cs-CZ', { timeZone: 'UTC', dateStyle: 'medium' }).format(new Date(value + 'T12:00:00Z'));
  const timestamp = (value, language) => new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'cs-CZ', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) + ' UTC';

  function render(host, metrics, language = 'cs') {
    if (!host) return;
    host.replaceChildren();
    host.hidden = metrics?.reason === 'not-authorized';
    if (host.hidden) return;
    const c = copy[language] ?? copy.cs;
    const heading = make('div', 'section-row');
    const title = make('h2', '', c.heading); title.id = 'distribution-title';
    heading.append(title, make('span', 'small muted', c.subtitle));
    host.append(heading);
    if (metrics?.availability !== 'available') {
      const preparing = !metrics || ['not-configured', 'not-ready'].includes(metrics.reason);
      const panel = make('div', 'panel distribution-preparation');
      panel.append(make('span', 'badge warn', preparing ? c.preparation : c.unavailable), make('p', '', preparing ? c.preparationText : c.unavailableText));
      host.append(panel);
      return;
    }
    const freshness = make('div', 'freshness');
    freshness.append(make('span', '', `${c.period}: ${day(metrics.startDate, language)} – ${day(metrics.endDate, language)}`), make('span', '', `${c.loaded}: ${timestamp(metrics.updatedAt, language)}`));
    host.append(freshness, make('p', 'small muted', c.retention));
    if (metrics.requestedDays > 30) host.append(make('p', 'small muted', c.capped));
    if (!metrics.totals) {
      const empty = make('div', 'panel distribution-preparation');
      empty.append(make('h3', '', c.empty), make('p', 'muted', c.emptyText)); host.append(empty); return;
    }
    const grid = make('div', 'totals distribution-totals');
    for (const [key, label] of counters) {
      const tile = make('article', 'metric distribution-metric');
      const help = make('details', 'distribution-help'), summary = make('summary', 'metric-label');
      const question = make('span', 'distribution-question', '?'); question.setAttribute('aria-hidden', 'true');
      summary.append(make('span', '', c[label]), question);
      help.append(summary, make('p', 'small muted', c[label + 'Help']));
      tile.append(help, make('strong', '', key === 'bytesWritten' ? bytes(metrics.totals[key], language) : format(metrics.totals[key], language)));
      if (key === 'bytesWritten') tile.append(make('small', '', `${format(metrics.totals[key], language)} B`));
      grid.append(tile);
    }
    host.append(grid, make('p', 'note', c.interpretation), make('p', 'note', c.boundary));
    const chart = make('section', 'panel distribution-chart');
    chart.append(make('h3', '', c.trajectory), make('p', 'small muted', c.chartHint));
    renderChart(chart, metrics, c, language); host.append(chart);
    const files = make('section', 'panel distribution-files');
    files.append(make('h3', '', c.files));
    if (!metrics.artifacts.length) files.append(make('p', 'muted', c.empty));
    else {
      const list = make('div', 'distribution-file-list');
      for (const artifact of metrics.artifacts) {
        const file = make('article', 'distribution-file');
        file.append(make('h4', '', `${c.version} ${artifact.release}`), make('p', 'distribution-filename', artifact.artifact));
        const values = make('dl', 'distribution-file-metrics');
        for (const [key, label] of counters.filter(([key]) => key !== 'clickIntents')) {
          const pair = make('div'); pair.append(make('dt', '', c[label]), make('dd', '', key === 'bytesWritten' ? bytes(artifact[key], language) : format(artifact[key], language))); values.append(pair);
        }
        file.append(values); list.append(file);
      }
      files.append(list);
    }
    const metadata = make('details', 'distribution-metadata'), summary = make('summary', '', c.metadata);
    metadata.append(summary, make('p', 'small muted', c.metadataHelp), make('p', '', `GET: ${format(metrics.metadata.getRequests, language)} · HEAD: ${format(metrics.metadata.headRequests, language)} · ${c.bytes}: ${bytes(metrics.metadata.bytesWritten, language)}`));
    files.append(metadata, make('p', 'small muted', `${c.coverage}: ${timestamp(metrics.coverageStart, language)}`));
    host.append(files);
  }

  function renderChart(host, metrics, c, language) {
    const rows = metrics.series, observed = new Map(rows.map(row => [row.date, row])), points = [];
    for (let time = Date.parse(metrics.startDate + 'T00:00:00Z'); time <= Date.parse(metrics.endDate + 'T00:00:00Z'); time += 86400000) {
      const date = new Date(time).toISOString().slice(0, 10); points.push({ date, value: observed.get(date)?.getRequests ?? null });
    }
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 720 190'); svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', c.trajectory); svg.classList.add('distribution-sparkline');
    const max = Math.max(1, ...points.map(point => point.value ?? 0)), x = index => 22 + index * 676 / Math.max(1, points.length - 1), y = value => 157 - value / max * 130;
    let path = '';
    points.forEach((point, index) => { if (point.value !== null) path += `${index === 0 || points[index - 1].value === null ? 'M' : 'L'}${x(index)} ${y(point.value)} `; });
    const line = document.createElementNS(ns, 'path'); line.setAttribute('d', path); line.classList.add('chart-line'); svg.append(line);
    const readout = make('p', 'chart-readout');
    const display = point => { readout.textContent = `${day(point.date, language)} · GET: ${point.value === null ? c.missing : format(point.value, language)}`; };
    for (const [index, point] of points.entries()) {
      if (point.value === null) continue;
      const circle = document.createElementNS(ns, 'circle'); circle.setAttribute('cx', String(x(index))); circle.setAttribute('cy', String(y(point.value))); circle.setAttribute('r', '5'); circle.setAttribute('tabindex', '0'); circle.setAttribute('aria-label', `${day(point.date, language)}: ${format(point.value, language)} GET`); circle.classList.add('chart-point');
      circle.addEventListener('mouseenter', () => display(point)); circle.addEventListener('focus', () => display(point));
      circle.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault(); const dots = [...svg.querySelectorAll('circle')], current = dots.indexOf(circle); dots[Math.max(0, Math.min(dots.length - 1, current + (event.key === 'ArrowLeft' ? -1 : 1)))].focus();
      }); svg.append(circle);
    }
    if (rows.length) display({ date: rows.at(-1).date, value: rows.at(-1).getRequests });
    const table = make('table'), caption = make('caption', 'sr-only', c.trajectory), head = make('thead'), heading = make('tr');
    for (const label of [c.day, c.get, c.full, c.range, c.bytes]) { const cell = make('th', '', label); cell.scope = 'col'; heading.append(cell); }
    head.append(heading); table.append(caption, head); const body = make('tbody');
    for (const point of points) {
      const row = make('tr'), value = observed.get(point.date), dateCell = make('th', '', day(point.date, language)); dateCell.scope = 'row'; row.append(dateCell);
      for (const key of ['getRequests', 'fullResponses', 'rangeResponses', 'bytesWritten']) row.append(make('td', '', !value ? c.missing : key === 'bytesWritten' ? bytes(value[key], language) : format(value[key], language)));
      body.append(row);
    }
    table.append(body); const details = make('details', 'chart-values'), wrap = make('div', 'table-scroll'); wrap.append(table); details.append(make('summary', '', c.table), wrap);
    host.append(svg, readout, details);
  }
  window.VCodeDownloadMetrics = Object.freeze({ render, clear: host => { if (host) { host.replaceChildren(); host.hidden = true; } } });
})();
