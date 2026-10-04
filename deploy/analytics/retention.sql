-- Purge early so daily rotation and up to eight days of backup retention stay below the approved 180-day maximum.
BEGIN;
DELETE FROM event_data WHERE created_at < now() - interval '170 days';
DELETE FROM website_event WHERE created_at < now() - interval '170 days';
DELETE FROM session_data WHERE created_at < now() - interval '170 days';
DELETE FROM session_link WHERE created_at < now() - interval '170 days';
DELETE FROM session WHERE created_at < now() - interval '170 days';
COMMIT;
