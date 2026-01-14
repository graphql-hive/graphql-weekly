-- Migration: Add audit fields for tracking who created/updated records

-- Issue audit fields
ALTER TABLE Issue ADD COLUMN createdBy TEXT REFERENCES user(id);
ALTER TABLE Issue ADD COLUMN updatedBy TEXT REFERENCES user(id);
ALTER TABLE Issue ADD COLUMN createdAt TEXT NOT NULL DEFAULT (datetime('now'));
ALTER TABLE Issue ADD COLUMN updatedAt TEXT NOT NULL DEFAULT (datetime('now'));

-- Topic audit fields
ALTER TABLE Topic ADD COLUMN createdBy TEXT REFERENCES user(id);
ALTER TABLE Topic ADD COLUMN updatedBy TEXT REFERENCES user(id);
ALTER TABLE Topic ADD COLUMN createdAt TEXT NOT NULL DEFAULT (datetime('now'));
ALTER TABLE Topic ADD COLUMN updatedAt TEXT NOT NULL DEFAULT (datetime('now'));

-- Link audit fields
ALTER TABLE Link ADD COLUMN createdBy TEXT REFERENCES user(id);
ALTER TABLE Link ADD COLUMN updatedBy TEXT REFERENCES user(id);
ALTER TABLE Link ADD COLUMN createdAt TEXT NOT NULL DEFAULT (datetime('now'));
ALTER TABLE Link ADD COLUMN updatedAt TEXT NOT NULL DEFAULT (datetime('now'));
