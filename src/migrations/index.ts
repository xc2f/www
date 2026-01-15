import * as migration_20260106_184630 from './20260106_184630';
import * as migration_20260107_045216 from './20260107_045216';
import * as migration_20260111_154244 from './20260111_154244';
import * as migration_20260115_113014 from './20260115_113014';

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
    up: migration_20260115_113014.up,
    down: migration_20260115_113014.down,
    name: '20260115_113014'
  },
];
