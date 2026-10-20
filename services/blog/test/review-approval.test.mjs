import test from "node:test";
import assert from "node:assert/strict";
import { callbackData, reviewFormSignature, validReviewForm } from "../review.mjs";
import { renderReviewPage } from "../render.mjs";
import { handleTelegramUpdate } from "../telegram.mjs";

const secret = "test-only-secret".repeat(4);
const token = "a".repeat(43);
const origin = "https://example.test";
const signature = reviewFormSignature(token, "publish", secret);
const validate = (headers, action = "publish", proof = signature, key = secret, bearer = token) =>
  validReviewForm(headers, bearer, action, proof, origin, key);

test("private no-referrer forms accept signed same-origin submissions, including opaque Origin", () => {
  for (const headers of [
    { origin, "sec-fetch-site": "same-origin" },
    { origin: "null", "sec-fetch-site": "same-origin" },
    { referer: `${origin}/blog/review/${token}` },
    {}, { "sec-fetch-site": "none" }
  ]) assert.equal(validate(headers), true);
});

test("form proof rejects foreign origins, malformed metadata, missing proof and action/token tampering", () => {
  for (const headers of [
    { origin: "https://foreign.test" }, { referer: "https://foreign.test/a" },
    { origin: "garbage" }, { referer: "garbage" },
    { origin, referer: "https://foreign.test" },
    { "sec-fetch-site": "cross-site" }, { "sec-fetch-site": "same-site" }
  ]) assert.equal(validate(headers), false);
  for (const proof of [null, "", "0".repeat(64), callbackData("p", "42", secret)]) assert.equal(validate({}, "publish", proof), false);
  assert.equal(validate({}, "reject"), false);
  assert.equal(validate({}, "publish", signature, secret, "b".repeat(43)), false);
  assert.equal(validate({}, "publish", signature, "short"), false);
  assert.equal(validate({}, "remove"), false);
  assert.equal(validate({}, "reject", reviewFormSignature(token, "reject", secret)), true);
});

test("rendered review keeps privacy, action-specific proofs and explicit confirmation", () => {
  const copy = { title: "Example", dek: "Summary", sections: [], key_points: [] };
  const review = { review_status: "pending", status: "draft", expires_at: "2099-01-01", sources: [], translations: { cs: copy, en: copy } };
  const html = renderReviewPage(review, token, { publish: signature, reject: reviewFormSignature(token, "reject", secret) });
  assert.ok(html.includes('name="referrer" content="no-referrer"'));
  assert.ok(html.includes('name="robots" content="noindex,nofollow,noarchive"'));
  for (const action of ["publish", "reject"]) {
    assert.ok(html.includes(`name="csrf" value="${reviewFormSignature(token, action, secret)}"`));
    assert.ok(html.includes(`name="confirm" value="${action}" required`));
  }
  assert.ok(!renderReviewPage({ ...review, review_status: "consumed" }, token).includes('<form'));
});

function fixture({ state = "pending", expires = "2099-01-01", missing = false, duplicate = false } = {}) {
  const queries = [], calls = [];
  const client = { query: async (sql, params) => {
    queries.push({ sql, params });
    if (sql.startsWith("INSERT INTO blog_telegram_updates")) return { rowCount: duplicate ? 0 : 1, rows: [] };
    if (sql.includes("FOR UPDATE")) return { rows: missing ? [] : [{ id: "42", article_id: "99", review_status: state, article_status: state === "pending" ? "draft" : "published", expires_at: expires, evidence: {} }] };
    return { rows: [], rowCount: 1 };
  } };
  const fetchImpl = async (url, options) => {
    assert.ok(url.startsWith("https://telegram.invalid/"));
    calls.push({ method: url.split("/").at(-1), payload: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ ok: true, result: true }) };
  };
  const config = { telegramUserId: "1", telegramChatId: "2", telegramApiBaseUrl: "https://telegram.invalid", telegramBotToken: "test", reviewSigningSecret: secret };
  const update = action => ({ update_id: 123, callback_query: { id: "callback-test", from: { id: 1 }, data: callbackData(action, "42", secret), message: { message_id: 12, chat: { id: 2 }, reply_markup: { inline_keyboard: [[{ url: `${origin}/blog/review/${token}` }]] } } } });
  return { queries, calls, run: action => handleTelegramUpdate(client, update(action), config, fetchImpl), unauthorized: () => handleTelegramUpdate(client, { ...update("c"), callback_query: { ...update("c").callback_query, from: { id: 3 } } }, config, fetchImpl) };
}

test("Telegram initial approval requires a second signed confirmation and cancel restores buttons", async () => {
  const f = fixture();
  await f.run("p");
  assert.equal(f.queries.some(q => q.sql.includes("UPDATE blog_articles")), false);
  assert.equal(f.calls[0].payload.reply_markup.inline_keyboard.at(-1)[0].callback_data, callbackData("c", "42", secret));
  await f.run("z");
  assert.equal(f.calls.at(-2).payload.reply_markup.inline_keyboard.at(-1)[0].callback_data, callbackData("p", "42", secret));
});

test("Telegram confirmation performs canonical audited publication", async () => {
  const f = fixture();
  await f.run("c");
  const write = f.queries.find(q => q.sql.startsWith("UPDATE blog_articles"));
  assert.deepEqual(write.params, ["99", "published", "telegram:1"]);
  assert.equal(f.queries.filter(q => q.sql.startsWith("UPDATE blog_articles")).length, 1);
  assert.ok(f.queries.some(q => q.sql.startsWith("INSERT INTO blog_editorial_events")));
  assert.ok(f.queries.some(q => q.sql === "COMMIT"));
  assert.match(f.calls.at(-1).payload.text, /publikován/);
});

for (const [name, options, message] of [
  ["already processed", { state: "consumed" }, /zpracován/],
  ["expired", { expires: "2000-01-01" }, /vypršela/],
  ["missing", { missing: true }, /najít/]
]) test(`Telegram ${name} review returns an explanation without article mutation`, async () => {
  const f = fixture(options);
  await f.run("c");
  assert.equal(f.queries.some(q => q.sql.startsWith("UPDATE blog_articles")), false);
  assert.equal(f.calls.at(-1).payload.show_alert, true);
  assert.match(f.calls.at(-1).payload.text, message);
  assert.ok(f.queries.some(q => q.sql.startsWith("UPDATE blog_telegram_updates SET handled=true")));
});

test("unauthorized and duplicate Telegram callbacks cannot publish", async () => {
  const f = fixture(); await f.unauthorized();
  assert.equal(f.queries.some(q => q.sql.includes("FOR UPDATE")), false);
  assert.match(f.calls[0].payload.text, /povolena/);
  const duplicate = fixture({ duplicate: true }); await duplicate.run("c");
  assert.equal(duplicate.calls.length, 0);
  assert.equal(duplicate.queries.length, 1);
});
