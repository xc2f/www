import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const backupDatabaseTask = async function () {
  const DATE = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const FILE_NAME = `backup_${DATE}.sql.gz`
  const LOCAL_PATH = path.join('/tmp', FILE_NAME)

  console.log('🚀 Starting database dump...')

  try {
    // 1. 执行 pg_dump
    await new Promise((resolve, reject) => {
      // 使用 -Z 9 直接让 pg_dump 压缩，简化管道操作
      const dumpCommand = `pg_dump -h postgres -U ${process.env.DATABASE_USER} -d ${process.env.DATABASE_NAME} -Z 9 > ${LOCAL_PATH}`

      exec(
        dumpCommand,
        { env: { ...process.env, PGPASSWORD: process.env.DATABASE_PASSWORD } },
        (err, stdout, stderr) => {
          // 即使没有 err，只要 stderr 有内容，往往也是报错了
          if (stderr) console.warn('pg_dump stderr (might be warnings):', stderr)

          if (err) {
            console.error('❌ Exec Error:', err)
            console.error('❌ Stderr:', stderr)
            return reject(new Error(`Dump failed: ${stderr || err.message}`))
          }
          resolve('Success')
        },
      )
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
  }
}
