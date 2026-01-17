-- Email allowlist for collaborator access
CREATE TABLE AllowedEmail (
  email TEXT PRIMARY KEY
);

-- Org allowlist for collaborator access
CREATE TABLE AllowedOrg (
  org TEXT PRIMARY KEY
);

-- Seed default orgs
INSERT INTO AllowedOrg (org) VALUES ('graphql-hive'), ('the-guild-org');
