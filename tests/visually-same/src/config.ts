export interface PageConfig {
  name: string
  path: string
}

export interface CompareConfig {
  baseUrl: string
  diffColor: string
  odiffThreshold: number
  pages: PageConfig[]
  productionUrl: string
  screenshotsDir: string
  viewport: { height: number; width: number }
}

export const config: CompareConfig = {
  baseUrl: 'http://localhost:4321',
  diffColor: '#cd2cc9',
  odiffThreshold: 0.1,
  pages: [
    { name: 'issues-396', path: '/issues/396' },
    { name: 'topic-Events', path: '/topic/Events' },
    { name: 'topic-Tools--Open-Source', path: '/topic/Tools--Open-Source' },
  ],
  productionUrl: 'https://www.graphqlweekly.com',
  screenshotsDir: new URL('screenshots', import.meta.url).pathname,
  viewport: { height: 720, width: 1280 },
}
