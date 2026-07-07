import type { CollectionAfterReadHook } from 'payload'
import { User } from 'src/payload-types'

// The `user` collection has access control locked so that users are not publicly accessible
// This means that we need to populate the authors manually here to protect user privacy
// GraphQL will not return mutated user data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the user data, hidden from the admin UI
export const populateAuthors: CollectionAfterReadHook = async ({ doc, req: { payload } }) => {
  if (doc?.authors && doc?.authors?.length > 0) {
    const authorIDs = doc.authors
      .map((author: User | number) => (typeof author === 'object' ? author?.id : author))
      .filter((id: number | undefined): id is number => typeof id === 'number')

    if (authorIDs.length === 0) {
      return doc
    }

    try {
      const uniqueAuthorIDs = [...new Set(authorIDs)]
      const authorDocs = await payload.find({
        collection: 'users',
        depth: 0,
        limit: uniqueAuthorIDs.length,
        pagination: false,
        select: {
          name: true,
        },
        where: {
          id: {
            in: uniqueAuthorIDs,
          },
        },
      })
      const authorDocMap = new Map(authorDocs.docs.map((authorDoc) => [authorDoc.id, authorDoc]))

      doc.populatedAuthors = authorIDs
        .map((authorID: number) => authorDocMap.get(authorID))
        .filter(
          (
            authorDoc: (typeof authorDocs.docs)[number] | undefined,
          ): authorDoc is Pick<User, 'id' | 'name'> =>
            authorDoc !== undefined && authorDoc !== null,
        )
        .map((authorDoc: Pick<User, 'id' | 'name'>) => ({
          id: authorDoc.id,
          name: authorDoc.name,
        }))
    } catch {
      // swallow error
      return doc
    }
  }

  return doc
}
