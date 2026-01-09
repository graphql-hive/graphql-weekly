export type IssueLink = {
  position: number
  text: string
  title: string
  url: string
}

export type TopicType = {
  title: string
  links: Array<IssueLink>
}

export type TopicLinksType = {
  issueNumber: number
  issueDate: string
  links: Array<IssueLink>
}

export type Author = {
  avatarUrl: string
  description: string
  name: string
}

export type IssueType = {
  author?: Author
  date: string
  id: string
  number: number
  published: boolean
  title: string
  description?: string
  specialPerk?: string
  topics: Array<TopicType>
}
