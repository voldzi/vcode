'use strict';
(() => {
  const copy = {
    cs: {
      heading: 'Distribuce aplikací', subtitle: 'VCode Recall · vydání a přenos souborů',
      preparation: 'Souhrn zatím není připojený', unavailable: 'Provozní souhrn není dostupný',
      preparationText: 'Souhrn distribuce zatím není k dispozici. Chybějící údaje neznamenají nulu přenosů a neprokazují dostupnost aplikace.',
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
      chartCoverage: 'Dny se záznamem souborů', chartRecorded: 'Zaznamenané GET', singleDay: 'Zatím máme záznam pouze za jeden den. Vývoj v čase se zobrazí s dalšími zaznamenanými dny.', noFileRecords: 'Zatím bez denních záznamů souborů', noFileRecordsText: 'V tomto období nejsou zaznamenané požadavky na ZIP/DMG. Údaje o doprovodných souborech jsou níže; chybějící záznam neznamená naměřenou nulu.', dayDetail: 'Detail dne', chartKeyboard: 'Vyberte den v nabídce. Body grafu lze procházet také šipkami vlevo a vpravo. Tabulka obsahuje i dny bez záznamu.', chartMeasured: 'Zaznamenaný den', chartGap: 'Chybějící záznam', of: 'z', build: 'Sestavení',
      applications: 'Naše aplikace', platform: 'Aplikace pro macOS', available: 'Souhrn dostupný',
      appScope: 'Sledujeme distribuci souborů. Používání nativní aplikace ani instalace se neměří.',
      summaryFull: 'Celé soubory do proxy', summaryBytes: 'Objem do proxy',
      compactBoundary: 'Celý soubor do proxy ≠ potvrzení doručení do zařízení.',
      detailLink: 'Podrobnosti distribuce', summaryHelp: 'Co čísla znamenají', summaryPeriod: 'Nejvýše 30 dní · UTC · filtr webu se na distribuci nevztahuje', technical: 'Provozní čítače a jejich význam', fileDetails: 'Zobrazit čítače souborů',
    },
    en: {
      heading: 'Application distribution', subtitle: 'VCode Recall · releases and file transfers',
      preparation: 'Summary not connected yet', unavailable: 'Operational summary unavailable',
      preparationText: 'The distribution summary is not available yet. Missing data does not mean zero transfers or establish whether the app is available.',
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
      chartCoverage: 'Days with file records', chartRecorded: 'Recorded GET requests', singleDay: 'Only one day has a record so far. A trend will appear when more days are recorded.', noFileRecords: 'No daily file records yet', noFileRecordsText: 'No ZIP/DMG requests have a record for this period. Supplementary file data is below; a missing record does not mean a measured zero.', dayDetail: 'Day detail', chartKeyboard: 'Select a day from the menu. Chart points also support the left and right arrows. The table includes days without a record.', chartMeasured: 'Recorded day', chartGap: 'Missing record', of: 'of', build: 'Build',
      applications: 'Our applications', platform: 'macOS application', available: 'Summary available',
      appScope: 'We track file distribution. Native app usage and installations are not measured.',
      summaryFull: 'Complete files to proxy', summaryBytes: 'Volume to proxy',
      compactBoundary: 'A complete file to the proxy ≠ confirmed delivery to a device.',
      detailLink: 'Distribution details', summaryHelp: 'What the numbers mean', summaryPeriod: 'Up to 30 days · UTC · the website filter does not apply to distribution', technical: 'Operational counters and definitions', fileDetails: 'Show file counters',
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
    const technical = make('details', 'panel distribution-counter-details');
    technical.append(make('summary', '', c.technical));
    const values = make('dl', 'distribution-counter-list');
    for (const [key, label] of counters) {
      const row = make('div', 'distribution-counter-row');
      row.append(make('dt', '', c[label]), make('dd', '', key === 'bytesWritten' ? bytes(metrics.totals[key], language) : format(metrics.totals[key], language)), make('dd', 'small muted distribution-counter-help', c[label + 'Help']));
      if (key === 'bytesWritten') row.append(make('dd', 'small muted distribution-counter-help', `${format(metrics.totals[key], language)} B`));
      values.append(row);
    }
    technical.append(values, make('p', 'note', c.interpretation), make('p', 'note', c.boundary)); host.append(technical);
    const chart = make('section', 'panel distribution-chart');
    chart.append(make('h3', '', c.trajectory), make('p', 'small muted', c.chartHint));
    renderChart(chart, metrics, c, language); host.append(chart);
    const files = make('section', 'panel distribution-files');
    files.append(make('h3', '', c.files));
    if (!metrics.artifacts.length) files.append(make('p', 'muted', c.empty));
    else {
      const overview = make('div', 'distribution-file-overview');
      for (const artifact of metrics.artifacts) {
        const file = make('article', 'distribution-file-card'), heading = make('div', 'distribution-file-heading');
        const release = metrics.releases?.find(item => item.id === artifact.release);
        heading.append(make('span', 'distribution-file-type', artifact.artifact.endsWith('.dmg') ? 'DMG' : 'ZIP'), make('h4', '', `${c.version} ${release?.version ?? artifact.release}`));
        file.append(heading);
        if (release) file.append(make('p', 'small muted distribution-file-build', `${c.build} ${release.buildNumber}`));
        const values = make('dl', 'distribution-file-highlights');
        for (const [key, label] of [['getRequests', 'get'], ['fullResponses', 'summaryFull'], ['rangeResponses', 'range'], ['bytesWritten', 'summaryBytes']]) {
          const pair = make('div'); pair.append(make('dt', '', c[label]), make('dd', '', key === 'bytesWritten' ? bytes(artifact[key], language) : format(artifact[key], language))); values.append(pair);
        }
        file.append(values); overview.append(file);
      }
      files.append(overview);
      const details = make('details', 'distribution-file-details'); details.append(make('summary', '', c.fileDetails));
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
      details.append(list); files.append(details);
    }
    const metadata = make('details', 'distribution-metadata'), summary = make('summary', '', c.metadata);
    metadata.append(summary, make('p', 'small muted', c.metadataHelp), make('p', '', `GET: ${format(metrics.metadata.getRequests, language)} · HEAD: ${format(metrics.metadata.headRequests, language)} · ${c.bytes}: ${bytes(metrics.metadata.bytesWritten, language)}`));
    files.append(metadata, make('p', 'small muted', `${c.coverage}: ${timestamp(metrics.coverageStart, language)}`));
    host.append(files);
  }

  function renderSummary(host, metrics, language = 'cs') {
    if (!host) return;
    host.replaceChildren();
    host.hidden = metrics?.reason === 'not-authorized';
    if (host.hidden) return;
    const c = copy[language] ?? copy.cs, available = metrics?.availability === 'available', hasRecords = available && Boolean(metrics.totals);
    const preparing = !metrics || ['not-configured', 'not-ready'].includes(metrics.reason);
    const heading = make('h2', 'section-title', c.applications); heading.id = 'application-distribution-title'; host.append(heading);
    const card = make('article', 'panel application-distribution-card');
    const header = make('div', 'application-distribution-heading'), identity = make('div', 'application-distribution-identity');
    const icon = make('img'); icon.src = '/images/products/recall-icon.webp'; icon.alt = ''; icon.width = 48; icon.height = 48;
    const name = make('div'), productTitle = make('h3'), productLink = make('a', '', 'VCode Recall'); productLink.href = language === 'en' ? '/en/apps/vcode-recall/' : '/aplikace/vcode-recall/'; productTitle.append(productLink); name.append(productTitle, make('p', 'small muted', c.platform)); identity.append(icon, name);
    header.append(identity, make('span', 'badge ' + (hasRecords ? 'good' : 'warn'), hasRecords ? c.available : available ? c.empty : preparing ? c.preparation : c.unavailable)); card.append(header);
    card.append(make('p', 'small muted', c.appScope), make('p', 'small muted application-distribution-period', c.summaryPeriod));
    const grid = make('dl', 'application-distribution-values');
    for (const [key, label] of [['clickIntents', 'clicks'], ['fullResponses', 'summaryFull'], ['bytesWritten', 'summaryBytes']]) {
      const pair = make('div'); pair.append(make('dt', '', c[label]), make('dd', '', !hasRecords ? '—' : key === 'bytesWritten' ? bytes(metrics.totals[key], language) : format(metrics.totals[key], language))); grid.append(pair);
    }
    card.append(grid);
    if (available) {
      const freshness = make('div', 'freshness application-distribution-freshness');
      freshness.append(make('span', '', `${c.period}: ${day(metrics.startDate, language)} – ${day(metrics.endDate, language)}`), make('span', '', `${c.loaded}: ${timestamp(metrics.updatedAt, language)}`)); card.append(freshness);
      if (!hasRecords) card.append(make('p', 'small muted', c.emptyText));
    } else card.append(make('p', 'small muted', preparing ? c.preparationText : c.unavailableText));
    card.append(make('p', 'small application-distribution-boundary', c.compactBoundary));
    const footer = make('div', 'application-distribution-footer'), help = make('details', 'application-distribution-help');
    help.append(make('summary', '', c.summaryHelp));
    for (const label of ['clicks', 'full', 'bytes']) help.append(make('p', 'small muted', c[label + 'Help']));
    const link = make('a', 'application-distribution-link', c.detailLink); link.href = '#distribution'; footer.append(help, link); card.append(footer); host.append(card);
  }

  function renderChart(host, metrics, c, language) {
    const rows = metrics.series, observed = new Map(rows.map(row => [row.date, row])), points = [];
    for (let time = Date.parse(metrics.startDate + 'T00:00:00Z'); time <= Date.parse(metrics.endDate + 'T00:00:00Z'); time += 86400000) {
      const date = new Date(time).toISOString().slice(0, 10); points.push({ date, value: observed.get(date)?.getRequests ?? null });
    }
    const recorded = points.filter(point => point.value !== null);
    const context = make('div', 'distribution-chart-context');
    context.append(make('span', 'distribution-chart-coverage', `${c.chartCoverage}: ${format(recorded.length, language)} ${c.of} ${format(points.length, language)}`), make('span', 'small muted', `${day(metrics.startDate, language)} – ${day(metrics.endDate, language)} · UTC`));
    host.append(context);
    if (recorded.length <= 1) {
      const snapshot = make('div', 'distribution-snapshot');
      if (!recorded.length) snapshot.append(make('h4', '', c.noFileRecords), make('p', 'small muted', c.noFileRecordsText));
      else {
        const point = recorded[0], row = observed.get(point.date), identity = make('div', 'distribution-snapshot-main');
        identity.append(make('span', 'small muted', `${day(point.date, language)} · UTC`), make('strong', 'distribution-snapshot-value', format(point.value, language)), make('span', '', c.chartRecorded));
        const values = make('dl', 'distribution-snapshot-values');
        for (const [key, label] of [['fullResponses', 'summaryFull'], ['rangeResponses', 'range'], ['bytesWritten', 'summaryBytes']]) {
          const pair = make('div'); pair.append(make('dt', '', c[label]), make('dd', '', key === 'bytesWritten' ? bytes(row[key], language) : format(row[key], language))); values.append(pair);
        }
        snapshot.append(identity, values, make('p', 'small muted distribution-snapshot-hint', c.singleDay));
      }
      host.append(snapshot);
    } else {
      const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
      const part = (tag, attributes, className, text) => {
        const element = document.createElementNS(ns, tag);
        for (const [key, value] of Object.entries(attributes ?? {})) element.setAttribute(key, String(value));
        if (className) element.setAttribute('class', className);
        if (text !== undefined) element.textContent = text;
        return element;
      };
      svg.setAttribute('viewBox', '0 0 720 260'); svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', c.trajectory); svg.classList.add('distribution-sparkline');
      const rawMax = Math.max(1, ...recorded.map(point => point.value)), rawStep = rawMax / 4;
      const magnitude = 10 ** Math.floor(Math.log10(rawStep)), fraction = rawStep / magnitude;
      const step = rawMax <= 4 ? 1 : (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * magnitude;
      const max = Math.ceil(rawMax / step) * step, plotBottom = 190, x = index => 54 + index * 642 / Math.max(1, points.length - 1), y = value => plotBottom - value / max * 156;
      const axis = part('g', {}, 'distribution-chart-axis');
      for (let value = 0; value <= max; value += step) {
        axis.append(part('line', { x1: 54, x2: 696, y1: y(value), y2: y(value) }, 'chart-gridline'), part('text', { x: 42, y: y(value) + 4, 'text-anchor': 'end' }, '', format(value, language)));
      }
      const tickIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
      const shortDay = value => new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'cs-CZ', { timeZone: 'UTC', day: 'numeric', month: 'short' }).format(new Date(value + 'T12:00:00Z'));
      for (const index of tickIndexes) axis.append(part('text', { x: x(index), y: 232, 'text-anchor': index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle' }, '', shortDay(points[index].date)));
      svg.append(axis);
      let path = '';
      points.forEach((point, index) => { if (point.value !== null) path += `${index === 0 || points[index - 1].value === null ? 'M' : 'L'}${x(index)} ${y(point.value)} `; });
      svg.append(part('path', { d: path }, 'chart-line'));
      const readout = make('p', 'chart-readout distribution-chart-readout'); readout.setAttribute('aria-live', 'polite'); readout.setAttribute('aria-atomic', 'true');
      const picker = make('label', 'distribution-day-picker'), select = make('select');
      picker.append(make('span', '', c.dayDetail), select);
      for (const point of points) {
        const option = make('option', '', `${day(point.date, language)} · GET: ${point.value === null ? c.missing : format(point.value, language)}`); option.value = point.date; select.append(option);
      }
      const display = point => { select.value = point.date; readout.textContent = `${day(point.date, language)} · GET: ${point.value === null ? c.missing : format(point.value, language)}`; };
      select.addEventListener('change', () => { const point = points.find(item => item.date === select.value); if (point) display(point); });
      const markers = [];
      for (const [index, point] of points.entries()) {
        const marker = part('g', { tabindex: '0', role: 'button', 'aria-label': `${day(point.date, language)} · GET: ${point.value === null ? c.missing : format(point.value, language)}` }, 'distribution-chart-day');
        if (point.value === null) marker.append(part('line', { x1: x(index) - 4, x2: x(index) + 4, y1: 208, y2: 208 }, 'distribution-missing-mark'));
        else marker.append(part('circle', { cx: x(index), cy: y(point.value), r: 5 }, 'chart-point'));
        // A transparent hit area also makes sparse points easy to select by touch.
        marker.append(part('rect', { x: x(index) - 10, y: point.value === null ? 197 : y(point.value) - 11, width: 20, height: 22, rx: 8 }, 'distribution-chart-hit'), part('title', {}, '', marker.getAttribute('aria-label')));
        marker.addEventListener('mouseenter', () => display(point)); marker.addEventListener('focus', () => display(point)); marker.addEventListener('click', () => display(point));
        marker.addEventListener('keydown', event => {
          if (['Enter', ' '].includes(event.key)) { event.preventDefault(); display(point); return; }
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault(); const current = markers.indexOf(marker), next = event.key === 'Home' ? 0 : event.key === 'End' ? markers.length - 1 : Math.max(0, Math.min(markers.length - 1, current + (event.key === 'ArrowLeft' ? -1 : 1))); markers[next].focus();
        }); markers.push(marker); svg.append(marker);
      }
      display(recorded.at(-1));
      const legend = make('div', 'distribution-chart-legend'); legend.append(make('span', 'distribution-chart-legend-recorded', c.chartMeasured), make('span', 'distribution-chart-legend-gap', c.chartGap));
      host.append(svg, legend, picker, readout, make('p', 'small muted', c.chartKeyboard));
    }
    const table = make('table'), caption = make('caption', 'sr-only', c.trajectory), head = make('thead'), heading = make('tr');
    for (const label of [c.day, c.get, c.full, c.range, c.bytes]) { const cell = make('th', '', label); cell.scope = 'col'; heading.append(cell); }
    head.append(heading); table.append(caption, head); const body = make('tbody');
    for (const point of points) {
      const row = make('tr'), value = observed.get(point.date), dateCell = make('th', '', day(point.date, language)); dateCell.scope = 'row'; row.append(dateCell);
      for (const key of ['getRequests', 'fullResponses', 'rangeResponses', 'bytesWritten']) row.append(make('td', '', !value ? c.missing : key === 'bytesWritten' ? bytes(value[key], language) : format(value[key], language)));
      body.append(row);
    }
    table.append(body); const details = make('details', 'chart-values'), wrap = make('div', 'table-scroll'); wrap.append(table); details.append(make('summary', '', c.table), wrap);
    host.append(details);
  }
  window.VCodeDownloadMetrics = Object.freeze({ render, renderSummary, clear: host => { if (host) { host.replaceChildren(); host.hidden = true; } } });
})();
