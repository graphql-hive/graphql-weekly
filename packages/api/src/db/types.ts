// Database row types - match D1/SQLite schema
// These are the raw types returned from database queries

export interface AuthorRow {
  avatarUrl: string
  createdAt: string // ISO date string from SQLite
  description: string
  id: string
  name: string
  updatedAt: string
  userId: string | null // Link to user account
}

export interface IssueRow {
  authorId: string | null
  comment: string | null
  createdAt: string
  createdBy: string | null
  date: string // ISO date string
  description: string | null
  id: string
  number: number
  previewImage: string | null
  published: number // SQLite boolean (0/1)
  specialPerk: string | null
  title: string
  updatedAt: string
  updatedBy: string | null
  versionCount: number
}

export interface LinkRow {
  createdAt: string
  createdBy: string | null
  id: string
  position: number | null
  text: string | null
  title: string | null
  topicId: string | null
  updatedAt: string
  updatedBy: string | null
  url: string
}

export interface TopicRow {
  createdAt: string
  createdBy: string | null
  id: string
  issue_comment: string
  issueId: string | null
  position: number | null
  title: string
  updatedAt: string
  updatedBy: string | null
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

// Better Auth tables
export interface UserRow {
  createdAt: string
  email: string
  emailVerified: number // SQLite boolean
  handle: string
  id: string
  image: string | null
  name: string
  updatedAt: string
}

export interface SessionRow {
  createdAt: string
  expiresAt: string
  id: string
  ipAddress: string | null
  token: string
  updatedAt: string
  userAgent: string | null
  userId: string
}

export interface AccountRow {
  accessToken: string | null
  accessTokenExpiresAt: string | null
  accountId: string
  createdAt: string
  id: string
  idToken: string | null
  password: string | null
  providerId: string
  refreshToken: string | null
  refreshTokenExpiresAt: string | null
  scope: string | null
  updatedAt: string
  userId: string
}

export interface VerificationRow {
  createdAt: string
  expiresAt: string
  id: string
  identifier: string
  updatedAt: string
  value: string
}

// Kysely database interface
export interface Database {
  account: AccountRow
  Author: AuthorRow
  Issue: IssueRow
  Link: LinkRow
  LinkSubmission: LinkSubmissionRow
  session: SessionRow
  Subscriber: SubscriberRow
  Topic: TopicRow
  // Better Auth tables (lowercase to match schema)
  user: UserRow
  verification: VerificationRow
}
