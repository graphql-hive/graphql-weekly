export interface PageConfig {
  path: string
  name: string
}

export interface CompareConfig {
  pages: PageConfig[]
  baseUrl: string
  productionUrl: string
  screenshotsDir: string
  viewport: { width: number; height: number }
  odiffThreshold: number
  diffColor: string
}

export const config: CompareConfig = {
  pages: [
    { path: '/issues/396', name: 'issues-396' },
    { path: '/topic/Events', name: 'topic-Events' },
    { path: '/topic/Tools--Open-Source', name: 'topic-Tools--Open-Source' },
  ],
  baseUrl: 'http://localhost:4321',
  productionUrl: 'https://www.graphqlweekly.com',
  screenshotsDir: './screenshots',
  viewport: { width: 1280, height: 720 },
  odiffThreshold: 0.1,
  diffColor: '#cd2cc9',
}
