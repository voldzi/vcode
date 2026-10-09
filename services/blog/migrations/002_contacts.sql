-- Private collaboration inbox. Exclude this schema from legacy blog backups.
CREATE SCHEMA IF NOT EXISTS vcode_contacts;
REVOKE ALL ON SCHEMA vcode_contacts FROM PUBLIC;

CREATE TABLE IF NOT EXISTS vcode_contacts.inquiries (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL UNIQUE,
  payload_hash text NOT NULL CHECK (payload_hash ~ '^[0-9a-f]{64}$'),
  locale text NOT NULL CHECK (locale IN ('cs','en')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  organization text CHECK (char_length(organization) <= 160),
  area text NOT NULL CHECK (area IN ('development','partnership','private-deployment','other')),
  application text CHECK (char_length(application) <= 100),
  message text NOT NULL CHECK (char_length(message) BETWEEN 30 AND 4000),
  privacy_version text NOT NULL CHECK (privacy_version='contact-20261009'),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CHECK (expires_at = created_at + interval '2160 hours')
);
CREATE INDEX IF NOT EXISTS contact_inquiries_created ON vcode_contacts.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_inquiries_expiry ON vcode_contacts.inquiries(expires_at);

CREATE TABLE IF NOT EXISTS vcode_contacts.outbox (
  inquiry_id uuid PRIMARY KEY REFERENCES vcode_contacts.inquiries(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 6),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  telegram_message_id text,
  last_error_code text CHECK (last_error_code IS NULL OR last_error_code='telegram-unavailable'),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS contact_outbox_due ON vcode_contacts.outbox(next_attempt_at) WHERE status='pending';
REVOKE ALL ON ALL TABLES IN SCHEMA vcode_contacts FROM PUBLIC;
