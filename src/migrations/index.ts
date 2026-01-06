import * as migration_20260106_184630 from './20260106_184630'

export const migrations = [
  {
    up: migration_20260106_184630.up,
    down: migration_20260106_184630.down,
    name: '20260106_184630',
  },
]
