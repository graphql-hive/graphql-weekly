-- Migration: Add audit fields for tracking who created/updated records

-- Issue audit fields
ALTER TABLE Issue ADD COLUMN createdBy TEXT REFERENCES user(id);
ALTER TABLE Issue ADD COLUMN updatedBy TEXT REFERENCES user(id);
ALTER TABLE Issue ADD COLUMN createdAt TEXT DEFAULT '';
ALTER TABLE Issue ADD COLUMN updatedAt TEXT DEFAULT '';

-- Topic audit fields
ALTER TABLE Topic ADD COLUMN createdBy TEXT REFERENCES user(id);
ALTER TABLE Topic ADD COLUMN updatedBy TEXT REFERENCES user(id);
ALTER TABLE Topic ADD COLUMN createdAt TEXT DEFAULT '';
ALTER TABLE Topic ADD COLUMN updatedAt TEXT DEFAULT '';

-- Link audit fields
ALTER TABLE Link ADD COLUMN createdBy TEXT REFERENCES user(id);
ALTER TABLE Link ADD COLUMN updatedBy TEXT REFERENCES user(id);
ALTER TABLE Link ADD COLUMN createdAt TEXT DEFAULT '';
ALTER TABLE Link ADD COLUMN updatedAt TEXT DEFAULT '';

-- Backfill existing rows with current timestamp
UPDATE Issue SET createdAt = datetime('now'), updatedAt = datetime('now') WHERE createdAt = '';
UPDATE Topic SET createdAt = datetime('now'), updatedAt = datetime('now') WHERE createdAt = '';
UPDATE Link SET createdAt = datetime('now'), updatedAt = datetime('now') WHERE createdAt = '';
