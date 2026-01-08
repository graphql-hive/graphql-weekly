#!/usr/bin/env bun
import React from 'react'
import meow from 'meow'
import { render } from 'ink'
import App from './app.js'

const cli = meow(
  `
    Usage
      $ visually-same <command>

    Commands
      compare              Take screenshots and compare against baseline
      update-baseline     Take screenshots and save as new baseline
      screenshot-production Take screenshots from production site

    Examples
      $ visually-same compare
      $ visually-same update-baseline
      $ visually-same screenshot-production
  `,
  {
    importMeta: import.meta,
    flags: {},
  },
)

const command = cli.input[0] as 'compare' | 'update-baseline' | 'screenshot-production'

if (!command || !['compare', 'update-baseline', 'screenshot-production'].includes(command)) {
  console.error(cli.help)
  process.exit(1)
}

render(React.createElement(App, { command: command }))
