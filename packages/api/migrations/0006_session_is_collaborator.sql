-- Add isCollaborator field to session table
ALTER TABLE session ADD COLUMN isCollaborator INTEGER DEFAULT 0;
