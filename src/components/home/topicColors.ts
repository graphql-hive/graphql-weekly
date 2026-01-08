export const topicColors: Record<string, string> = {
  Articles: '#F531B1',
  'Community & Events': '#009BE3',

  Conference: '#009BE3',
  Events: '#009BE3',
  'Frameworks and Libraries': '#F0950C',

  Libraries: '#F0950C',
  'Libraries and Tools': '#F0950C',
  'Open Source': '#F0950C',
  'Podcasts and Shows': '#27AE60',

  Slides: '#27AE60',
  Talks: '#27AE60',
  'Tools & Open Source': '#F0950C',
  'Tools and Open Source': '#F0950C',
  Tutorials: '#6560E2',
  Videos: '#27AE60',
}

export const getTopicColor = (topic: string): string =>
  topicColors[topic] || '#F531B1'
