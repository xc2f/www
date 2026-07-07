import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const backupDatabaseTask = async function () {
  const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-')
  const FILE_NAME = `backup_${TIMESTAMP}.sql.gz`
  const LOCAL_PATH = path.join('/tmp', FILE_NAME)

  console.log('🚀 Starting database dump...')

  try {
    const output = fs.createWriteStream(LOCAL_PATH, { flags: 'wx' })

    // 1. 执行 pg_dump
    await new Promise<void>((resolve, reject) => {
      const dump = spawn(
        'pg_dump',
        [
          '-h',
          process.env.DATABASE_HOST || 'postgres',
          '-U',
          process.env.DATABASE_USER || '',
          '-d',
          process.env.DATABASE_NAME || '',
          '-Z',
          '9',
        ],
        {
          env: { ...process.env, PGPASSWORD: process.env.DATABASE_PASSWORD || '' },
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      )

      let stderr = ''

      dump.stdout.pipe(output)
      dump.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
      })
      dump.on('error', reject)
      output.on('error', reject)
      dump.on('close', (code) => {
        if (stderr) console.warn('pg_dump stderr (might be warnings):', stderr)

        if (code !== 0) {
          output.end()
          return reject(new Error(`Dump failed with exit code ${code}: ${stderr}`))
        }

        output.end(() => resolve())
      })
    })

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

    // 3. 成功后删除本地临时文件
    if (fs.existsSync(LOCAL_PATH)) {
      fs.unlinkSync(LOCAL_PATH)
    }

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
    if (fs.existsSync(LOCAL_PATH)) {
      fs.unlinkSync(LOCAL_PATH)
    }
  }
}
