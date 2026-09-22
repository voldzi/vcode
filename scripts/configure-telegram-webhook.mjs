import { loadConfig } from "../services/blog/config.mjs";
import { telegramCall } from "../services/blog/telegram.mjs";

const mode = process.argv[2] ?? "status";
const config = await loadConfig();
if (!config.telegramBotToken) throw new Error("Telegram bot token is not configured");

if (mode === "discover") {
  const updates = await telegramCall(config, "getUpdates", { timeout: 0, allowed_updates: ["message"] });
  const rows = updates.slice(-10).map((update) => ({
    updateId: update.update_id,
    userId: update.message?.from?.id,
    chatId: update.message?.chat?.id,
    username: update.message?.from?.username,
    name: [update.message?.from?.first_name, update.message?.from?.last_name].filter(Boolean).join(" ")
  })).filter((row) => row.userId && row.chatId);
  console.log(JSON.stringify(rows, null, 2));
} else if (mode === "set") {
  if (!config.telegramWebhookSecret || config.telegramWebhookSecret.length < 32) throw new Error("Telegram webhook secret must contain at least 32 characters");
  const result = await telegramCall(config, "setWebhook", {
    url: `${config.siteOrigin}/api/blog/telegram/webhook`,
    secret_token: config.telegramWebhookSecret,
    allowed_updates: ["callback_query"],
    drop_pending_updates: false
  });
  console.log(JSON.stringify({ configured: result, url: `${config.siteOrigin}/api/blog/telegram/webhook` }, null, 2));
} else if (mode === "delete") {
  console.log(JSON.stringify({ deleted: await telegramCall(config, "deleteWebhook", { drop_pending_updates: false }) }, null, 2));
} else if (mode === "status") {
  const info = await telegramCall(config, "getWebhookInfo", {});
  console.log(JSON.stringify({ url: info.url, pendingUpdateCount: info.pending_update_count, lastErrorDate: info.last_error_date, lastErrorMessage: info.last_error_message }, null, 2));
} else {
  throw new Error("Usage: pnpm telegram:webhook -- status|discover|set|delete");
}
