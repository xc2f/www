import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { transporter } from './email/transporter'
import { s3Storage } from '@payloadcms/storage-s3'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
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

import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
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
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // push: true,
    // prodMigrations: migrations,
  }),
  collections: [Pages, Posts, Media, Categories, Notes, Feeds, Mails, Users],
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
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET || '',
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
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [
      sendEmailTask,
      {
        slug: 'backupDatabase',
        handler: backupDatabaseTask,
        schedule: [
          {
            cron: '0 0 * * *',
            queue: 'default',
          },
        ],
      },
    ],
    autoRun: [
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
  i18n: { supportedLanguages: { en, zh } },
  localization: {
    locales: [
      { label: 'Chinese', code: 'zh' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'zh',
  },
})
