import * as migration_20261024_143125_sqlite_initial from './20261024_143125_sqlite_initial'
import * as migration_20261024_175711_payload_3_92 from './20261024_175711_payload_3_92'

import * as migration_20261115_preserve_retired_video_topics from './20261115_preserve_retired_video_topics'

import * as feedEnabledMigration from './20261115_remove_feed_enabled'

import * as privateFeedMigration from './20261115_subscribe_private_feeds'

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
  {
    up: migration_20261115_preserve_retired_video_topics.up,
    down: migration_20261115_preserve_retired_video_topics.down,
    name: '20261115_preserve_retired_video_topics',
  },
  {
    up: feedEnabledMigration.up,
    down: feedEnabledMigration.down,
    name: '20261115_remove_feed_enabled',
  },
  {
    up: privateFeedMigration.up,
    down: privateFeedMigration.down,
    name: '20261115_subscribe_private_feeds',
  },
]
