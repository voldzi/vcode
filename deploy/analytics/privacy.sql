-- The portfolio only needs aggregate visits, not IP-derived geography.
BEGIN;
CREATE OR REPLACE FUNCTION analytics_strip_location() RETURNS trigger
LANGUAGE plpgsql AS $body$
BEGIN
  NEW.country := NULL;
  NEW.region := NULL;
  NEW.city := NULL;
  RETURN NEW;
END;
$body$;
DROP TRIGGER IF EXISTS analytics_strip_location ON session;
CREATE TRIGGER analytics_strip_location BEFORE INSERT OR UPDATE ON session
FOR EACH ROW EXECUTE FUNCTION analytics_strip_location();
UPDATE session SET country = NULL, region = NULL, city = NULL
WHERE country IS NOT NULL OR region IS NOT NULL OR city IS NOT NULL;
COMMIT;
