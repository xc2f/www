// Run only against a disposable copy: pnpm payload run scripts/sqlite/smoke.ts
import assert from 'node:assert/strict'
import { createLocalReq, getPayload } from 'payload'
import config from '../../src/payload.config'
import { sqliteFilePath } from '../../src/utilities/sqlite'

assert.ok(
  sqliteFilePath(process.env.DATABASE_URL || '').includes('xc2f-smoke-'),
  'Use a disposable xc2f-smoke-* database',
)
assert.equal(process.env.DISABLE_BACKGROUND_JOBS, 'true')
assert.equal(process.env.ENABLE_EMAIL, 'false')

const payload = await getPayload({ config })
try {
  for (const locale of ['zh', 'en'] as const) {
    const posts = await payload.find({ collection: 'posts', locale, depth: 2, limit: 100 })
    assert.ok(posts.totalDocs > 0)
    // An unfinished draft in the source backup has no title/slug yet.
    assert.ok(
      posts.docs
        .filter((post) => post._status === 'published')
        .every((post) => post.title && post.slug),
    )
    const versions = await payload.findVersions({ collection: 'posts', locale, limit: 1 })
    assert.ok(versions.totalDocs >= posts.totalDocs)
    await payload.find({ collection: 'search', locale, depth: 2, limit: 100 })
    await payload.findGlobal({ slug: 'header', locale, depth: 2 })
    await payload.findGlobal({ slug: 'footer', locale, depth: 2 })
  }

  // Administrative test operations on a disposable database, intentionally bypassing access.
  const account = await payload.create({
    collection: 'users',
    data: {
      email: 'sqlite-smoke@example.invalid',
      password: 'sqlite-smoke-only-password',
      roles: ['admin'],
    },
  })
  const login = await payload.login({
    collection: 'users',
    data: { email: account.email, password: 'sqlite-smoke-only-password' },
  })
  assert.ok(login.token)

  const req = await createLocalReq({}, payload)
  const transactionID = await payload.db.beginTransaction()
  assert.ok(transactionID)
  req.transactionID = transactionID
  const rolledBack = await payload.create({
    collection: 'notes',
    data: { title: 'rollback smoke', content: [{ blockType: 'text', text: 'transaction' }] },
    req,
  })
  await payload.db.rollbackTransaction(transactionID)
  const missing = await payload.find({
    collection: 'notes',
    where: { id: { equals: rolledBack.id } },
  })
  assert.equal(missing.totalDocs, 0)

  const note = await payload.create({
    collection: 'notes',
    draft: true,
    data: { title: 'SQLite draft', content: [{ blockType: 'text', text: '中文\nEnglish\t✓' }] },
  })
  assert.equal(note._status, 'draft')
  const published = await payload.update({
    collection: 'notes',
    id: note.id,
    data: { _status: 'published' },
  })
  assert.equal(published._status, 'published')
  assert.equal(published.content?.[0].blockType, 'text')

  const post = (
    await payload.find({
      collection: 'posts',
      locale: 'zh',
      where: { _status: { equals: 'published' } },
      limit: 1,
    })
  ).docs[0]
  await payload.update({
    collection: 'posts',
    id: post.id,
    locale: 'zh',
    data: { title: `${post.title} SQLite smoke` },
    context: { disableRevalidate: true },
  })
  const search = await payload.find({
    collection: 'search',
    locale: 'zh',
    where: { title: { contains: 'SQLite smoke' } },
  })
  assert.ok(search.totalDocs >= 1, 'Post updates must sync the search index within the transaction')

  console.log(
    'SQLite smoke passed: localized content, relationships, versions, globals, auth, transaction rollback, draft/publish, search sync.',
  )
} finally {
  await payload.destroy()
}
