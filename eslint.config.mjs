import { theGuild } from '@hasparus/eslint-config'

export default [
  ...theGuild,
  {
    ignores: ['.localflare/**'],
  },
]
