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
  id: string
  name: string
  email: string
  emailVerified: number // SQLite boolean
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface SessionRow {
  id: string
  userId: string
  token: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
}

export interface AccountRow {
  id: string
  userId: string
  accountId: string
  providerId: string
  accessToken: string | null
  refreshToken: string | null
  accessTokenExpiresAt: string | null
  refreshTokenExpiresAt: string | null
  scope: string | null
  idToken: string | null
  password: string | null
  createdAt: string
  updatedAt: string
}

export interface VerificationRow {
  id: string
  identifier: string
  value: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

// Kysely database interface
export interface Database {
  Author: AuthorRow
  Issue: IssueRow
  Link: LinkRow
  LinkSubmission: LinkSubmissionRow
  Subscriber: SubscriberRow
  Topic: TopicRow
  // Better Auth tables (lowercase to match schema)
  user: UserRow
  session: SessionRow
  account: AccountRow
  verification: VerificationRow
}
