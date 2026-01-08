export type IssueLink = {
  position: number
  text: string
  title: string
  url: string
}

export type TopicType = {
  links: IssueLink[]
  title: string
}

export type TopicLinksType = {
  issueDate: string
  issueNumber: number
  links: IssueLink[]
}

export type Author = {
  avatarUrl: string
  description: string
  name: string
}

export type IssueType = {
  author?: Author
  date: string
  description?: string
  id: string
  number: number
  published: boolean
  specialPerk?: string
  title: string
  topics: TopicType[]
}
