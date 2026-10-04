BEGIN;
DELETE FROM event_data WHERE created_at < now() - interval '180 days';
DELETE FROM website_event WHERE created_at < now() - interval '180 days';
DELETE FROM session_data WHERE created_at < now() - interval '180 days';
DELETE FROM session_link WHERE created_at < now() - interval '180 days';
DELETE FROM session WHERE created_at < now() - interval '180 days';
COMMIT;
