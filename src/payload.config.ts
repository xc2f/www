import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { transporter } from './email/transporter'
import { s3Storage } from '@payloadcms/storage-s3'

import { Moments } from './collections/Moments'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { Notes } from './collections/Notes'
import { Feeds } from './collections/Feeds'
import { Mails } from './collections/Mails'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

import { sendEmailTask } from './tasks/sendEmail'
import { backupDatabaseTask } from './tasks/backupDatabase'

import { en } from '@payloadcms/translations/languages/en'
import { zh } from '@payloadcms/translations/languages/zh'

import { endpoints } from './endpoints'
import { sqliteFilePath, sqliteURL } from './utilities/sqlite'
import { migrations } from './migrations/sqlite'
import { recoverMailDeliveries } from './utilities/mailDelivery'
import { serializeSqliteJobs } from './utilities/serializeSqliteJobs'
import { recoverBackupJobs } from './utilities/recoverBackupJobs'
import { adminOnly } from './access/roles'
import { systemAccess } from './access/system'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseURL = sqliteURL()
mkdirSync(path.dirname(sqliteFilePath(databaseURL)), { recursive: true })

const requireEnv = (name: string): string => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const s3Config = {
  accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
  bucket: requireEnv('S3_BUCKET'),
  endpoint: requireEnv('S3_ENDPOINT'),
  region: process.env.S3_REGION || 'auto',
  secretAccessKey: requireEnv('S3_SECRET'),
}

export default buildConfig({
  onInit: async (payload) => {
    serializeSqliteJobs(payload)
    await recoverBackupJobs(payload)
    await recoverMailDeliveries(payload)
  },
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
      views: {
        system: {
          Component: './views/System',
          path: '/system',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? {
            email: 'admin@local.host',
            password: '123456',
          }
        : false,
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: sqliteAdapter({
    client: { url: databaseURL },
    autoIncrement: true,
    busyTimeout: 30000,
    wal: { synchronous: 'FULL', journalSizeLimit: 16 * 1024 * 1024 },
    transactionOptions: { behavior: 'immediate' },
    migrationDir: path.resolve(dirname, 'migrations/sqlite'),
    prodMigrations: migrations,
    // Apply explicit migrations so retired collection tables stay in existing databases.
    push: false,
  }),
  collections: [
    Media,
    Pages,
    Posts,
    Categories,
    Moments,
    Tags,
    Notes,
    Feeds,
    Mails,
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: s3Config.bucket,
      config: {
        region: s3Config.region,
        endpoint: s3Config.endpoint,
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        },
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: systemAccess,
    },
    tasks: [
      sendEmailTask,
      {
        slug: 'backupDatabase',
        handler: backupDatabaseTask,
        retries: 3,
        schedule: [
          {
            cron: '0 0 * * *',
            queue: 'default',
          },
        ],
      },
    ],
    autoRun:
      process.env.DISABLE_BACKGROUND_JOBS === 'true'
        ? []
        : [
            {
              cron: '* * * * *', // Run every minute
              limit: 100,
            },
          ],
    jobsCollectionOverrides: ({ defaultJobsCollection }) => {
      if (!defaultJobsCollection.admin) {
        defaultJobsCollection.admin = {}
      }
      defaultJobsCollection.admin.hidden = false
      defaultJobsCollection.access = {
        ...defaultJobsCollection.access,
        read: adminOnly,
      }
      return defaultJobsCollection
    },
  },
  email:
    process.env.ENABLE_EMAIL === 'true'
      ? nodemailerAdapter({
          defaultFromAddress: process.env.EMAIL_DEFAULT_FROM_NO_REPLY as string,
          defaultFromName: process.env.EMAIL_DEFAULT_FROM_NAME as string,
          transport: transporter,
        })
      : undefined,
  // admin ui
  i18n: {
    supportedLanguages: { en, zh },
    translations: {
      zh: {
        'plugin-redirects': {
          customUrl: '自定义 URL',
          documentToRedirect: '目标文档',
          fromUrl: '来源 URL',
          internalLink: '站内链接',
          redirectType: '重定向类型',
          toUrlType: '目标 URL 类型',
        },
      },
    },
  },
  // next ui
  localization: {
    locales: [
      { label: '简体中文', code: 'zh' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'zh',
    fallback: true,
  },
  endpoints,
})
