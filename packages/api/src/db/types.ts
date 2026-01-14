// Database row types - match D1/SQLite schema
// These are the raw types returned from database queries

export interface AuthorRow {
  id: string
  avatarUrl: string
  name: string
  description: string
  createdAt: string // ISO date string from SQLite
  updatedAt: string
}

export interface IssueRow {
  id: string
  authorId: string | null
  comment: string | null
  date: string // ISO date string
  description: string | null
  number: number
  previewImage: string | null
  published: number // SQLite boolean (0/1)
  specialPerk: string | null
  title: string
  versionCount: number
}

export interface LinkRow {
  id: string
  position: number | null
  text: string | null
  title: string | null
  topicId: string | null
  url: string
}

export interface TopicRow {
  id: string
  issueId: string | null
  issue_comment: string
  position: number | null
  title: string
}

export interface SubscriberRow {
  id: string
  email: string
  name: string
}

export interface LinkSubmissionRow {
  id: string
  createdAt: string
  updatedAt: string
  description: string
  email: string
  name: string
  title: string
  url: string
}

export interface UserRow {
  id: string
  roles: string | null
}

// Kysely database interface
export interface Database {
  Author: AuthorRow
  Issue: IssueRow
  Link: LinkRow
  Topic: TopicRow
  Subscriber: SubscriberRow
  LinkSubmission: LinkSubmissionRow
  User: UserRow
}
