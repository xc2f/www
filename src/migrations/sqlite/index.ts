import * as migration_20261024_143125_sqlite_initial from './20261024_143125_sqlite_initial'
import * as migration_20261024_175711_payload_3_92 from './20261024_175711_payload_3_92'

export const migrations = [
  {
    up: migration_20261024_143125_sqlite_initial.up,
    down: migration_20261024_143125_sqlite_initial.down,
    name: '20261024_143125_sqlite_initial',
  },
  {
    up: migration_20261024_175711_payload_3_92.up,
    down: migration_20261024_175711_payload_3_92.down,
    name: '20261024_175711_payload_3_92',
  },
]
