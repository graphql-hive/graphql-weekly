// Database row types - match D1/SQLite schema
// These are the raw types returned from database queries

export interface AuthorRow {
  avatarUrl: string
  createdAt: string // ISO date string from SQLite
  description: string
  id: string
  name: string
  updatedAt: string
}

export interface IssueRow {
  authorId: string | null
  comment: string | null
  date: string // ISO date string
  description: string | null
  id: string
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
  issue_comment: string
  issueId: string | null
  position: number | null
  title: string
}

export interface SubscriberRow {
  email: string
  id: string
  name: string
}

export interface LinkSubmissionRow {
  createdAt: string
  description: string
  email: string
  id: string
  name: string
  title: string
  updatedAt: string
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
  LinkSubmission: LinkSubmissionRow
  Subscriber: SubscriberRow
  Topic: TopicRow
  User: UserRow
}
