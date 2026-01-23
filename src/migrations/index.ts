import * as migration_20260106_184630 from './20260106_184630';
import * as migration_20260107_045216 from './20260107_045216';
import * as migration_20260111_154244 from './20260111_154244';
import * as migration_20260116_160213 from './20260116_160213';
import * as migration_20260122_125238 from './20260122_125238';
import * as migration_20260123_173337 from './20260123_173337';

export const migrations = [
  {
    up: migration_20260106_184630.up,
    down: migration_20260106_184630.down,
    name: '20260106_184630',
  },
  {
    up: migration_20260107_045216.up,
    down: migration_20260107_045216.down,
    name: '20260107_045216',
  },
  {
    up: migration_20260111_154244.up,
    down: migration_20260111_154244.down,
    name: '20260111_154244',
  },
  {
    up: migration_20260116_160213.up,
    down: migration_20260116_160213.down,
    name: '20260116_160213',
  },
  {
    up: migration_20260122_125238.up,
    down: migration_20260122_125238.down,
    name: '20260122_125238',
  },
  {
    up: migration_20260123_173337.up,
    down: migration_20260123_173337.down,
    name: '20260123_173337'
  },
];
