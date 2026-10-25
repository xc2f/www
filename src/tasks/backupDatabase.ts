import { tmpdir } from 'node:os'
import { sqliteURL } from '../utilities/sqlite'
import { createSqliteSnapshot } from '../utilities/sqliteSnapshot'
import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { recordBackupResult } from '../utilities/backupStatus'

export const backupDatabaseTask = async function () {
  // Bound the entire snapshot/compression/upload attempt, not just SQLite lock waits.
  const signal = AbortSignal.timeout(10 * 60 * 1000)
  const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-')
  const FILE_NAME = `backup_${TIMESTAMP}.sqlite.gz`
  const temporaryDirectory = await fs.promises.mkdtemp(path.join(tmpdir(), 'xc2f-backup-'))
  const LOCAL_PATH = path.join(temporaryDirectory, FILE_NAME)
  const snapshotPath = path.join(temporaryDirectory, 'snapshot.db')
  let s3: S3Client | undefined
  let fileStream: fs.ReadStream | undefined

  console.log('🚀 Starting database dump...')

  try {
    await createSqliteSnapshot(sqliteURL(), snapshotPath, LOCAL_PATH, signal)

    console.log('✅ Database dump finished.')

    // 2. 上传到 R2
    s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.S3_ENDPOINT, // 示例: https://<account_id>.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET || '',
      },
    })

    fileStream = fs.createReadStream(LOCAL_PATH)

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: `backups/${FILE_NAME}`,
        Body: fileStream,
        ContentType: 'application/gzip', // 明确指定文件类型
      }),
      { abortSignal: signal },
    )

    await recordBackupResult({ fileName: FILE_NAME })
    console.log(`✅ Backup uploaded to R2: ${FILE_NAME}`)

    // 重要：返回一个包含 output 的对象
    return {
      output: {
        message: `Successfully backed up to R2 as ${FILE_NAME}`,
        fileName: FILE_NAME,
      },
    }
  } catch (error) {
    console.error('❌ Backup Task Failed:', error)
    await recordBackupResult({ failed: true }).catch((statusError: unknown) => {
      console.error('Failed to persist backup failure status:', statusError)
    })
    // 抛出错误以便 Payload Job 记录失败状态并根据策略重试
    throw error
  } finally {
    fileStream?.destroy()
    s3?.destroy()
    await fs.promises.rm(temporaryDirectory, { recursive: true, force: true })
  }
}
