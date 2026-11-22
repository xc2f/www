import * as migration_20261024_143125_sqlite_initial from './20261024_143125_sqlite_initial'
import * as migration_20261024_175711_payload_3_92 from './20261024_175711_payload_3_92'
import * as migration_20261115_preserve_retired_video_topics from './20261115_preserve_retired_video_topics'
import * as migration_20261115_remove_feed_enabled from './20261115_remove_feed_enabled'
import * as migration_20261115_subscribe_private_feeds from './20261115_subscribe_private_feeds'
import * as migration_20261120_mail_delivery_plans from './20261120_mail_delivery_plans'

import * as migration_20261120_mail_delivery_recovery from './20261120_mail_delivery_recovery'

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
    up: migration_20261115_remove_feed_enabled.up,
    down: migration_20261115_remove_feed_enabled.down,
    name: '20261115_remove_feed_enabled',
  },
  {
    up: migration_20261115_subscribe_private_feeds.up,
    down: migration_20261115_subscribe_private_feeds.down,
    name: '20261115_subscribe_private_feeds',
  },
  {
    up: migration_20261120_mail_delivery_plans.up,
    down: migration_20261120_mail_delivery_plans.down,
    name: '20261120_mail_delivery_plans',
  },
  {
    up: migration_20261120_mail_delivery_recovery.up,
    down: migration_20261120_mail_delivery_recovery.down,
    name: '20261120_mail_delivery_recovery',
  },
]
