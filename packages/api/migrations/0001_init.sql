-- Migration: Initial schema
-- Based on Prisma schema converted for SQLite/D1

CREATE TABLE IF NOT EXISTS Author (
  id TEXT PRIMARY KEY,
  avatarUrl TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Issue (
  id TEXT PRIMARY KEY,
  authorId TEXT,
  comment TEXT,
  date TEXT NOT NULL,
  description TEXT,
  number INTEGER NOT NULL UNIQUE,
  previewImage TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  specialPerk TEXT,
  title TEXT NOT NULL,
  versionCount INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (authorId) REFERENCES Author(id)
);

CREATE INDEX IF NOT EXISTS Issue_authorId_idx ON Issue(authorId);

CREATE TABLE IF NOT EXISTS Topic (
  id TEXT PRIMARY KEY,
  issueId TEXT,
  issue_comment TEXT NOT NULL,
  position INTEGER,
  title TEXT NOT NULL,
  FOREIGN KEY (issueId) REFERENCES Issue(id)
);

CREATE INDEX IF NOT EXISTS Topic_issueId_idx ON Topic(issueId);

CREATE TABLE IF NOT EXISTS Link (
  id TEXT PRIMARY KEY,
  position INTEGER DEFAULT 0,
  text TEXT,
  title TEXT,
  topicId TEXT,
  url TEXT NOT NULL,
  FOREIGN KEY (topicId) REFERENCES Topic(id)
);

CREATE INDEX IF NOT EXISTS Link_topicId_idx ON Link(topicId);

CREATE TABLE IF NOT EXISTS Subscriber (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS LinkSubmission (
  id TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  roles TEXT
);
