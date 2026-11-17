-- Enquiry storage.
--
-- Every timestamp is epoch milliseconds (UTC). Nothing is stored in local time:
-- display code formats in Australia/Perth, so there is no daylight-saving or
-- eastern-states offset to get wrong.
--
-- Safe to re-run: every statement is IF NOT EXISTS / OR IGNORE.

CREATE TABLE IF NOT EXISTS enquiries (
  id           TEXT PRIMARY KEY,   -- random
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  suburb       TEXT,               -- required by the form
  address      TEXT,               -- optional: street address, if given
  message      TEXT,
  page         TEXT,               -- the page the enquiry was sent from
  status       TEXT NOT NULL DEFAULT 'new',  -- new -> contacted -> booked
  ip           TEXT,               -- rate limiting only
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER,
  contacted_at INTEGER             -- first time it left "new": reply speed
);

CREATE INDEX IF NOT EXISTS idx_enq_status  ON enquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enq_ip_time ON enquiries (ip, created_at);

-- Devices registered for push alerts. No payload is sent with a push, so the
-- encryption keys a normal Web Push subscription carries aren't stored — only
-- where to send it.
CREATE TABLE IF NOT EXISTS push_subs (
  endpoint   TEXT PRIMARY KEY,
  label      TEXT,
  created_at INTEGER NOT NULL
);

-- Settings the operator changes from the admin page (away mode).
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO settings (key, value, updated_at)
VALUES ('away', '{"on":false,"returnText":"next week"}', 0);
