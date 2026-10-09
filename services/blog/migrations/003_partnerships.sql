-- Private partnership intake. Existing blog backup exclusions also cover these tables.
CREATE SCHEMA IF NOT EXISTS vcode_contacts;
REVOKE ALL ON SCHEMA vcode_contacts FROM PUBLIC;

CREATE TABLE IF NOT EXISTS vcode_contacts.partnership_inquiries (
  id uuid PRIMARY KEY,
  app_id text NOT NULL CHECK (app_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(app_id) <= 100),
  type text NOT NULL CHECK (type ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(type) <= 64),
  locale text NOT NULL CHECK (locale IN ('cs','en')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  organization text CHECK (char_length(organization) <= 160),
  message text NOT NULL CHECK (char_length(message) BETWEEN 30 AND 4000),
  privacy_version text NOT NULL CHECK (privacy_version='partnership-intake-20261009-1'),
  stage text NOT NULL DEFAULT 'new' CHECK (stage IN ('new','reviewing','waiting','pilot','active','closed')),
  manager_id text CHECK (char_length(manager_id) BETWEEN 1 AND 100),
  next_action text CHECK (char_length(next_action) <= 500),
  next_action_due_at timestamptz,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CHECK (expires_at=created_at+interval '2160 hours'),
  CHECK (next_action_due_at IS NULL OR next_action_due_at < expires_at),
  CHECK (updated_at >= created_at AND updated_at < expires_at)
);
CREATE INDEX IF NOT EXISTS partnership_inquiries_created ON vcode_contacts.partnership_inquiries(created_at DESC,id);
CREATE INDEX IF NOT EXISTS partnership_inquiries_expiry ON vcode_contacts.partnership_inquiries(expires_at);

-- A deleted inquiry cannot be resurrected by a retry. No contact fields here.
CREATE TABLE IF NOT EXISTS vcode_contacts.partnership_receipts (
  app_id text NOT NULL CHECK (app_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(app_id) <= 100),
  request_id uuid NOT NULL,
  reference uuid NOT NULL UNIQUE,
  inquiry_id uuid UNIQUE REFERENCES vcode_contacts.partnership_inquiries(id) ON DELETE SET NULL,
  payload_hash text NOT NULL CHECK (payload_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL CHECK (expires_at=created_at+interval '2160 hours'),
  PRIMARY KEY (app_id,request_id),
  CHECK (inquiry_id IS NULL OR inquiry_id=reference)
);
CREATE INDEX IF NOT EXISTS partnership_receipts_day ON vcode_contacts.partnership_receipts(created_at,app_id);
CREATE INDEX IF NOT EXISTS partnership_receipts_expiry ON vcode_contacts.partnership_receipts(expires_at);

CREATE TABLE IF NOT EXISTS vcode_contacts.partnership_audit (
  id uuid PRIMARY KEY,
  inquiry_id uuid NOT NULL REFERENCES vcode_contacts.partnership_inquiries(id) ON DELETE CASCADE,
  actor_id text NOT NULL CHECK (char_length(actor_id) BETWEEN 1 AND 100),
  action text NOT NULL CHECK (action IN ('workflow-updated','promoted')),
  changed_fields text[] NOT NULL CHECK (changed_fields <@ ARRAY['stage','managerId','nextAction','nextActionDueAt']::text[] AND cardinality(changed_fields) <= 4),
  from_stage text NOT NULL CHECK (from_stage IN ('new','reviewing','waiting','pilot','active','closed')),
  to_stage text NOT NULL CHECK (to_stage IN ('new','reviewing','waiting','pilot','active','closed')),
  created_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS partnership_audit_inquiry ON vcode_contacts.partnership_audit(inquiry_id,created_at,id);

CREATE TABLE IF NOT EXISTS vcode_contacts.partnership_outbox (
  inquiry_id uuid PRIMARY KEY REFERENCES vcode_contacts.partnership_inquiries(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 6),
  next_attempt_at timestamptz NOT NULL,
  lease_until timestamptz,
  lease_token uuid,
  expires_at timestamptz NOT NULL,
  CHECK ((lease_until IS NULL)=(lease_token IS NULL))
);
CREATE INDEX IF NOT EXISTS partnership_outbox_due ON vcode_contacts.partnership_outbox(next_attempt_at) WHERE status='pending';

-- Independent, bounded, approved records; never a copy of contact/message fields.
CREATE TABLE IF NOT EXISTS vcode_contacts.partners (
  id uuid PRIMARY KEY,
  app_id text NOT NULL CHECK (app_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(app_id) <= 100),
  type text NOT NULL CHECK (type ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(type) <= 64),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 160),
  policy_version text NOT NULL CHECK (char_length(policy_version) BETWEEN 1 AND 100),
  created_by text NOT NULL CHECK (char_length(created_by) BETWEEN 1 AND 100),
  source_inquiry_id uuid UNIQUE REFERENCES vcode_contacts.partnership_inquiries(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL CHECK (expires_at >= created_at+interval '24 hours' AND expires_at <= created_at+interval '8760 hours')
);
CREATE INDEX IF NOT EXISTS partners_expiry ON vcode_contacts.partners(expires_at);
CREATE INDEX IF NOT EXISTS partners_created ON vcode_contacts.partners(created_at DESC,id);
REVOKE ALL ON ALL TABLES IN SCHEMA vcode_contacts FROM PUBLIC;

-- Workflow edits cannot reset retention by moving both timestamps together.
CREATE OR REPLACE FUNCTION vcode_contacts.partnership_preserve_retention() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF NEW.created_at IS DISTINCT FROM OLD.created_at OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='partnership retention is immutable';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS partnership_inquiry_retention ON vcode_contacts.partnership_inquiries;
CREATE TRIGGER partnership_inquiry_retention BEFORE UPDATE ON vcode_contacts.partnership_inquiries
FOR EACH ROW EXECUTE FUNCTION vcode_contacts.partnership_preserve_retention();
DROP TRIGGER IF EXISTS partnership_receipt_retention ON vcode_contacts.partnership_receipts;
CREATE TRIGGER partnership_receipt_retention BEFORE UPDATE ON vcode_contacts.partnership_receipts
FOR EACH ROW EXECUTE FUNCTION vcode_contacts.partnership_preserve_retention();
DROP TRIGGER IF EXISTS partnership_partner_retention ON vcode_contacts.partners;
CREATE TRIGGER partnership_partner_retention BEFORE UPDATE ON vcode_contacts.partners
FOR EACH ROW EXECUTE FUNCTION vcode_contacts.partnership_preserve_retention();

CREATE OR REPLACE FUNCTION vcode_contacts.partnership_match_outbox_expiry() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vcode_contacts.partnership_inquiries i WHERE i.id=NEW.inquiry_id AND i.expires_at=NEW.expires_at) THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='partnership outbox expiry must match inquiry';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS partnership_outbox_expiry ON vcode_contacts.partnership_outbox;
CREATE TRIGGER partnership_outbox_expiry BEFORE INSERT OR UPDATE ON vcode_contacts.partnership_outbox
FOR EACH ROW EXECUTE FUNCTION vcode_contacts.partnership_match_outbox_expiry();
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA vcode_contacts FROM PUBLIC;
