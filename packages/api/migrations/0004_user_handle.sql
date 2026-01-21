-- Migration: Add handle field to user table
-- Stores GitHub username from social login

ALTER TABLE user ADD COLUMN handle TEXT NOT NULL;
CREATE INDEX IF NOT EXISTS user_handle_idx ON user(handle);
