import * as migration_20251229_delete_feeds from './20251229_delete_feeds';
import * as migration_20260106_184630 from './20260106_184630';

export const migrations = [
  {
    up: migration_20251229_delete_feeds.up,
    down: migration_20251229_delete_feeds.down,
    name: '20251229_delete_feeds',
  },
  {
    up: migration_20260106_184630.up,
    down: migration_20260106_184630.down,
    name: '20260106_184630'
  },
];
