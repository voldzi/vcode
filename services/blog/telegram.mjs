import { callbackData, createReviewRequest, parseCallbackData, applyEditorialAction } from "./review.mjs";
import { timingSafeEqual } from "node:crypto";

export function telegramReady(config) {
  return Boolean(telegramNotificationReady(config) && config.telegramWebhookSecret?.length >= 32);
}

export function telegramNotificationReady(config) {
  return Boolean(config.telegramEnabled && config.telegramBotToken && config.reviewSigningSecret?.length >= 32 && config.telegramChatId && config.telegramUserId);
}

export function validWebhookSecret(supplied, expected) {
  const left = Buffer.from(String(supplied ?? ""));
  const right = Buffer.from(String(expected ?? ""));
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

const escapeTelegram = (value = "") => String(value).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

export async function telegramCall(config, method, payload, fetchImpl = fetch) {
  const response = await fetchImpl(`${config.telegramApiBaseUrl}/bot${config.telegramBotToken}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10_000)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(`Telegram ${method} failed (${response.status})`);
  return result.result;
}

const keyboard = (requestId, reviewUrl, secret) => ({ inline_keyboard: [
  [{ text: "Otevřít celý návrh", url: reviewUrl }],
  [{ text: "Schválit", callback_data: callbackData("p", requestId, secret) }, { text: "Zamítnout", callback_data: callbackData("r", requestId, secret) }]
] });

export async function notifyDraft(client, articleId, config) {
  if (!telegramNotificationReady(config)) return { skipped: true };
  const article = (await client.query(`SELECT a.id,a.sources,t.title,t.dek FROM blog_articles a JOIN blog_article_translations t ON t.article_id=a.id AND t.locale='cs' WHERE a.id=$1 AND a.status='draft'`, [articleId])).rows[0];
  if (!article) return { skipped: true };
  const review = await createReviewRequest(client, articleId, config);
  const reviewUrl = `${config.siteOrigin}/blog/review/${review.token}`;
  const text = `<b>Nový návrh článku VCode</b>\n\n<b>${escapeTelegram(article.title)}</b>\n${escapeTelegram(article.dek)}\n\nZdroje: ${article.sources.length} · platnost odkazu: ${config.reviewTtlHours} h`;
  try {
    const message = await telegramCall(config, "sendMessage", { chat_id: config.telegramChatId, text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup: keyboard(review.id, reviewUrl, config.reviewSigningSecret) });
    await client.query("UPDATE blog_review_requests SET telegram_message_id=$2 WHERE id=$1", [review.id, String(message.message_id)]);
    return { requestId: review.id, messageId: message.message_id };
  } catch (error) {
    await client.query("UPDATE blog_review_requests SET status='revoked' WHERE id=$1", [review.id]);
    throw error;
  }
}

function confirmKeyboard(parsed, message, config) {
  const reviewId = parsed.requestId;
  const token = message?.reply_markup?.inline_keyboard?.flat().find((button) => button.url)?.url;
  const confirmAction = parsed.action === "p" ? "c" : "x";
  return { inline_keyboard: [
    ...(token ? [[{ text: "Otevřít celý návrh", url: token }]] : []),
    [{ text: parsed.action === "p" ? "Potvrdit publikaci" : "Potvrdit zamítnutí", callback_data: callbackData(confirmAction, reviewId, config.reviewSigningSecret) }, { text: "Zrušit", callback_data: callbackData("z", reviewId, config.reviewSigningSecret) }]
  ] };
}

export async function handleTelegramUpdate(client, update, config) {
  const updateId = Number(update?.update_id);
  if (!Number.isSafeInteger(updateId)) return;
  const callback = update.callback_query;
  const eventType = callback ? "callback_query" : "ignored";
  const inserted = await client.query("INSERT INTO blog_telegram_updates(update_id,event_type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING update_id", [updateId, eventType]);
  if (!inserted.rowCount || !callback) return;
  const userId = String(callback.from?.id ?? "");
  const chatId = String(callback.message?.chat?.id ?? "");
  if (userId !== config.telegramUserId || chatId !== config.telegramChatId) {
    await telegramCall(config, "answerCallbackQuery", { callback_query_id: callback.id, text: "Tato akce není povolena.", show_alert: true });
    return;
  }
  const parsed = parseCallbackData(callback.data, config.reviewSigningSecret);
  if (!parsed) return telegramCall(config, "answerCallbackQuery", { callback_query_id: callback.id, text: "Neplatná nebo zastaralá akce.", show_alert: true });
  if (["p", "r"].includes(parsed.action)) {
    await telegramCall(config, "editMessageReplyMarkup", { chat_id: chatId, message_id: callback.message.message_id, reply_markup: confirmKeyboard(parsed, callback.message, config) });
    return telegramCall(config, "answerCallbackQuery", { callback_query_id: callback.id, text: "Potvrďte prosím ještě jednou." });
  }
  if (parsed.action === "z") {
    const url = callback.message?.reply_markup?.inline_keyboard?.flat().find((button) => button.url)?.url;
    if (url) await telegramCall(config, "editMessageReplyMarkup", { chat_id: chatId, message_id: callback.message.message_id, reply_markup: keyboard(parsed.requestId, url, config.reviewSigningSecret) });
    return telegramCall(config, "answerCallbackQuery", { callback_query_id: callback.id, text: "Akce zrušena." });
  }
  const action = parsed.action === "c" ? "publish" : "reject";
  const result = await applyEditorialAction(client, parsed.requestId, action, `telegram:${userId}`);
  await client.query("UPDATE blog_telegram_updates SET handled=true,article_id=$2,detail=$3 WHERE update_id=$1", [updateId, result.articleId, JSON.stringify({ action })]);
  await telegramCall(config, "editMessageReplyMarkup", { chat_id: chatId, message_id: callback.message.message_id, reply_markup: { inline_keyboard: [] } });
  await telegramCall(config, "answerCallbackQuery", { callback_query_id: callback.id, text: action === "publish" ? "Článek byl publikován." : "Návrh byl zamítnut.", show_alert: true });
}
