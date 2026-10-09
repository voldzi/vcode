'use strict';
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const language = form.dataset.locale === 'en' ? 'en' : 'cs';
  const copy = {
    cs: { send: 'Odeslat zprávu', retry: 'Znovu ověřit odeslání', sending: 'Odesíláme zprávu…', ready: 'Formulář je připravený.', success: 'Děkujeme, zprávu jsme přijali. Ozveme se na uvedený e-mail.', unavailable: 'Formulář teď není dostupný. Můžete nám napsat e-mailem.', uncertain: 'Přijetí zprávy zatím není potvrzené. Text zůstává zachovaný; tlačítkem znovu ověříte odeslání stejné zprávy.', invalid: 'Zkontrolujte vyplněné údaje. Zpráva musí mít 30 až 4 000 znaků.', long: 'Zpráva je příliš dlouhá pro bezpečné odeslání. Zkraťte ji prosím.', rate: 'Příliš mnoho pokusů. Zpráva zůstává zachovaná; zkuste to za chvíli nebo nám napište e-mailem.', conflict: 'Odeslání této zprávy potřebuje ověření. Text zůstává zachovaný; kontaktujte nás prosím e-mailem.', expired: 'Ochranné ověření obnovíme a zprávu odešleme znovu.', reference: 'Číslo zprávy' },
    en: { send: 'Send message', retry: 'Check submission again', sending: 'Sending your message…', ready: 'The form is ready.', success: 'Thank you. We have received your message and will reply to the email address provided.', unavailable: 'The form is currently unavailable. You can contact us by email.', uncertain: 'Receipt is not confirmed yet. Your text is preserved; use the button to retry the same message.', invalid: 'Check the fields. Your message must contain 30 to 4,000 characters.', long: 'The message is too long to send safely. Please shorten it.', rate: 'Too many attempts. Your message is preserved; try later or contact us by email.', conflict: 'This submission needs verification. Your text is preserved; please contact us by email.', expired: 'We will renew the spam check and retry the message.', reference: 'Message reference' },
  }[language];
  const button = form.querySelector('button[type=submit]'), status = document.getElementById('contact-form-status');
  const privacyVersion = 'contact-20261009';
  let challenge, readyAt = 0, busy = false, pending = null, uncertain = false;
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  const value = name => form.elements[name].value.trim().normalize('NFC');
  const length = text => Array.from(text).length;
  // Public links may suggest existing choices, never supply contact details.
  // Apply once and leave defaults intact so a successful reset clears the choices.
  function preselect() {
    const search = location.search;
    if (!search || search.length > 512) return;
    const parameters = new URLSearchParams(search), choices = [];
    for (const [key, suggested] of parameters) {
      const name = key === 'app' ? 'application' : key === 'area' ? 'area' : null;
      if (!name || parameters.getAll(key).length !== 1 || !suggested) return;
      const field = form.elements[name];
      if (!Array.from(field.options).some(option => option.value === suggested && !option.disabled)) return;
      choices.push([field, suggested]);
    }
    for (const [field, suggested] of choices) if (!field.value) field.value = suggested;
  }
  preselect();
  function announce(text, tone = '') { status.textContent = text; status.hidden = !text; status.dataset.tone = tone; status.setAttribute('role', tone === 'error' ? 'alert' : 'status'); }
  function lock(locked) {
    for (const name of ['name', 'email', 'organization', 'message']) form.elements[name].readOnly = locked;
    for (const name of ['area', 'application']) form.elements[name].disabled = locked;
  }
  async function renew() {
    const response = await fetch('/api/contact/challenge', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('unavailable');
    const next = await response.json();
    if (next.enabled !== true || next.privacyVersion !== privacyVersion || form.dataset.privacyVersion !== privacyVersion || typeof next.token !== 'string' || !next.token || next.token.length > 4096 || !Number.isFinite(Date.parse(next.expiresAt)) || Date.parse(next.expiresAt) <= Date.now() || next.minimumDelayMs < 1500 || next.minimumDelayMs > 10000) throw new Error('unavailable');
    challenge = next; readyAt = Date.now() + next.minimumDelayMs;
  }
  async function sendPending(retried = false) {
    if (!challenge || Date.parse(challenge.expiresAt) <= Date.now()) await renew();
    const delay = readyAt - Date.now(); if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
    const serialized = JSON.stringify({ ...pending, token: challenge.token });
    if (new TextEncoder().encode(serialized).byteLength > 16 * 1024) return { kind: 'invalid', text: copy.long };
    let response;
    try { response = await fetch('/api/contact', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: serialized, signal: AbortSignal.timeout(20000) }); } catch { return { kind: 'uncertain' }; }
    let result; try { result = await response.json(); } catch { return { kind: 'uncertain' }; }
    if (response.status === 202 && result.ok === true && uuid.test(result.reference ?? '')) return { kind: 'success', reference: result.reference };
    if (response.status === 403 && !retried) { challenge = null; announce(copy.expired); await renew(); return sendPending(true); }
    if (response.status === 400 || response.status === 413) return { kind: 'invalid', text: response.status === 413 ? copy.long : copy.invalid };
    if (response.status === 429) return { kind: 'retry', text: copy.rate };
    if (response.status === 409) return { kind: 'conflict' };
    // A server or proxy failure can occur after storage. Preserve this exact request ID.
    return { kind: 'uncertain' };
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return;
    if (!pending) {
      if (!form.reportValidity()) return;
      const name = value('name'), message = value('message');
      if (length(name) < 2 || length(name) > 100 || length(message) < 30 || length(message) > 4000) { announce(copy.invalid, 'error'); form.elements[length(name) < 2 ? 'name' : 'message'].focus(); return; }
      if (typeof crypto.randomUUID !== 'function') { announce(copy.unavailable, 'error'); return; }
      pending = { requestId: crypto.randomUUID(), locale: language, name, email: value('email'), organization: value('organization'), area: value('area'), application: value('application') || null, message, website: value('website'), privacyVersion };
    }
    busy = true; button.disabled = true; lock(true); form.setAttribute('aria-busy', 'true'); announce(copy.sending);
    try {
      const result = await sendPending();
      if (result.kind === 'success') {
        form.reset(); pending = null; uncertain = false; challenge = null; lock(false); announce(`${copy.success} ${copy.reference}: ${result.reference}`, 'success'); status.focus();
        // No submitted fields or identifiers are exposed to analytics listeners.
        document.dispatchEvent(new CustomEvent('vcode:contact-sent'));
        try { await renew(); } catch { button.disabled = true; }
      } else if (result.kind === 'invalid') {
        pending = null; uncertain = false; lock(false); announce(result.text, 'error'); form.elements.message.focus();
      } else {
        uncertain = true; announce(result.kind === 'conflict' ? copy.conflict : result.text ?? copy.uncertain, 'error'); status.focus();
      }
    } catch { announce(uncertain ? copy.uncertain : copy.unavailable, 'error'); uncertain = Boolean(pending); }
    finally { busy = false; form.removeAttribute('aria-busy'); button.textContent = uncertain ? copy.retry : copy.send; button.disabled = !challenge && !pending; if (!pending) lock(false); }
  });
  // Tokens and messages remain only in memory; there is no local/session storage.
  renew().then(() => { form.hidden = false; button.disabled = false; }).catch(() => { form.hidden = true; });
})();
