CREATE TABLE IF NOT EXISTS blog_sources (
  id text PRIMARY KEY,
  name text NOT NULL,
  feed_url text UNIQUE,
  homepage_url text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  collection_mode text NOT NULL DEFAULT 'rss',
  language text NOT NULL DEFAULT 'cs',
  trust_tier text NOT NULL DEFAULT 'editorial',
  source_kind text NOT NULL DEFAULT 'publication',
  retention_policy text NOT NULL DEFAULT 'metadata-only',
  license_note text,
  allowed_hosts jsonb NOT NULL DEFAULT '[]'::jsonb,
  topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  etag text,
  last_modified text,
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error text
);

ALTER TABLE blog_sources ALTER COLUMN feed_url DROP NOT NULL;
ALTER TABLE blog_sources ADD COLUMN IF NOT EXISTS collection_mode text NOT NULL DEFAULT 'rss';
ALTER TABLE blog_sources ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'cs';
ALTER TABLE blog_sources ADD COLUMN IF NOT EXISTS trust_tier text NOT NULL DEFAULT 'editorial';
ALTER TABLE blog_sources ADD COLUMN IF NOT EXISTS source_kind text NOT NULL DEFAULT 'publication';
ALTER TABLE blog_sources ADD COLUMN IF NOT EXISTS retention_policy text NOT NULL DEFAULT 'metadata-only';
ALTER TABLE blog_sources ADD COLUMN IF NOT EXISTS license_note text;
ALTER TABLE blog_sources ADD COLUMN IF NOT EXISTS allowed_hosts jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE blog_sources ADD COLUMN IF NOT EXISTS topics jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS blog_feed_items (
  id text PRIMARY KEY,
  source_id text NOT NULL REFERENCES blog_sources(id),
  title text NOT NULL,
  url text NOT NULL UNIQUE,
  canonical_url text,
  summary text NOT NULL,
  author text,
  normalized_title text,
  title_fingerprint text,
  relevance_score numeric(5, 3),
  published_at timestamptz,
  collected_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);

ALTER TABLE blog_feed_items ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE blog_feed_items ADD COLUMN IF NOT EXISTS normalized_title text;
ALTER TABLE blog_feed_items ADD COLUMN IF NOT EXISTS title_fingerprint text;
ALTER TABLE blog_feed_items ADD COLUMN IF NOT EXISTS relevance_score numeric(5, 3);
CREATE UNIQUE INDEX IF NOT EXISTS blog_feed_items_canonical_url_idx ON blog_feed_items (canonical_url) WHERE canonical_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS blog_feed_items_fingerprint_idx ON blog_feed_items (title_fingerprint, published_at DESC);

CREATE INDEX IF NOT EXISTS blog_feed_items_fresh_idx
  ON blog_feed_items (used_at, published_at DESC, collected_at DESC);

CREATE TABLE IF NOT EXISTS blog_articles (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  topic text NOT NULL,
  sources jsonb NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  hero_variant text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'rejected')),
  model text,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(12, 6) NOT NULL DEFAULT 0,
  generation_id text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_articles ADD COLUMN IF NOT EXISTS evidence jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE blog_articles ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE blog_articles ADD COLUMN IF NOT EXISTS reviewed_by text;

CREATE INDEX IF NOT EXISTS blog_articles_published_idx
  ON blog_articles (published_at DESC) WHERE status = 'published';

CREATE TABLE IF NOT EXISTS blog_story_clusters (
  id text PRIMARY KEY,
  representative_title text NOT NULL,
  item_ids jsonb NOT NULL,
  evidence jsonb NOT NULL,
  score numeric(6, 3) NOT NULL,
  status text NOT NULL DEFAULT 'shortlisted' CHECK (status IN ('shortlisted', 'drafted', 'published', 'rejected', 'ignored')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_editorial_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id bigint REFERENCES blog_articles(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('generated', 'reviewed', 'published', 'rejected')),
  actor text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_article_translations (
  article_id bigint NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('cs', 'en')),
  title text NOT NULL,
  dek text NOT NULL,
  sections jsonb NOT NULL,
  key_points jsonb NOT NULL,
  PRIMARY KEY (article_id, locale)
);

CREATE TABLE IF NOT EXISTS blog_comments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id bigint NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  parent_id bigint REFERENCES blog_comments(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  body text NOT NULL,
  email_hash text,
  ip_hash text NOT NULL,
  user_agent text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  moderation jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz
);

CREATE INDEX IF NOT EXISTS blog_comments_article_idx
  ON blog_comments (article_id, status, created_at);
CREATE INDEX IF NOT EXISTS blog_comments_rate_idx
  ON blog_comments (ip_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS blog_ai_usage (
  usage_day date PRIMARY KEY,
  runs integer NOT NULL DEFAULT 0,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(12, 6) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_runs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL CHECK (status IN ('running', 'draft', 'published', 'skipped', 'failed')),
  feed_items_seen integer NOT NULL DEFAULT 0,
  article_id bigint REFERENCES blog_articles(id),
  message text
);
