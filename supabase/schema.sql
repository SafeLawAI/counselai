-- LexSafe AI — Supabase Schema
-- Run this in the Supabase SQL editor to set up the database.
-- No messages or conversations are ever stored in this database.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- FIRMS
-- ============================================================
CREATE TYPE subscription_tier AS ENUM ('trial', 'basic', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled');

CREATE TABLE IF NOT EXISTS firms (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subscription_tier   subscription_tier NOT NULL DEFAULT 'trial',
  subscription_status subscription_status NOT NULL DEFAULT 'active',
  max_users           INTEGER NOT NULL DEFAULT 5
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'attorney', 'paralegal');

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id    TEXT NOT NULL UNIQUE,
  firm_id     UUID REFERENCES firms(id) ON DELETE SET NULL,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'attorney',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON users(clerk_id);
CREATE INDEX IF NOT EXISTS users_firm_id_idx ON users(firm_id);

-- ============================================================
-- AUDIT LOGS
-- Never stores conversation content — only metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  firm_id     UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata    JSONB
  -- metadata examples:
  --   session_started:  { session_id, model }
  --   session_ended:    { session_id, duration_seconds, token_count }
  --   document_uploaded: { filename, size_bytes }
  --   user_invited:     { invitee_email }
  -- NEVER includes conversation content, prompts, or responses
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_firm_id_idx ON audit_logs(firm_id);
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON audit_logs(timestamp DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used in API routes via supabaseAdmin)
-- All app access uses service role on the server side.
-- These policies are a safety net for any accidental anon/user key usage.

-- Firms: no direct client access
CREATE POLICY "No direct client access to firms"
  ON firms FOR ALL
  USING (false);

-- Users: no direct client access
CREATE POLICY "No direct client access to users"
  ON users FOR ALL
  USING (false);

-- Audit logs: no direct client access
CREATE POLICY "No direct client access to audit_logs"
  ON audit_logs FOR ALL
  USING (false);
