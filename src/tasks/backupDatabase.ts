import { tmpdir } from 'node:os'
import { sqliteURL } from '../utilities/sqlite'
import { createSqliteSnapshot } from '../utilities/sqliteSnapshot'
import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const backupDatabaseTask = async function () {
  const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-')
  const FILE_NAME = `backup_${TIMESTAMP}.sqlite.gz`
  const temporaryDirectory = await fs.promises.mkdtemp(path.join(tmpdir(), 'xc2f-backup-'))
  const LOCAL_PATH = path.join(temporaryDirectory, FILE_NAME)
  const snapshotPath = path.join(temporaryDirectory, 'snapshot.db')

  console.log('🚀 Starting database dump...')

  try {
    await createSqliteSnapshot(sqliteURL(), snapshotPath, LOCAL_PATH)

    console.log('✅ Database dump finished.')

    // 2. 上传到 R2
    const s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.S3_ENDPOINT, // 示例: https://<account_id>.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET || '',
      },
    })

    const fileStream = fs.createReadStream(LOCAL_PATH)

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: `backups/${FILE_NAME}`,
        Body: fileStream,
        ContentType: 'application/gzip', // 明确指定文件类型
      }),
    )

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
    // 抛出错误以便 Payload Job 记录失败状态并根据策略重试
    throw error
  } finally {
    await fs.promises.rm(temporaryDirectory, { recursive: true, force: true })
  }
}
