import * as migration_20261024_143125_sqlite_initial from './20261024_143125_sqlite_initial'

export const migrations = [
  {
    up: migration_20261024_143125_sqlite_initial.up,
    down: migration_20261024_143125_sqlite_initial.down,
    name: '20261024_143125_sqlite_initial',
  },
]
