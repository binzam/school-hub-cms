import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeValidateHook,
  type Where,
} from 'payload'

import { revalidatePublicPages } from '@/hooks/revalidatePublicPages'
import { idOf } from '@/lib/idOf'
import type { Post } from '@/payload-types'

const rule = (message: string) => new APIError(message, 400, undefined, true)

// A slug is unique within its language (runs after the slug field's own hook)
export const uniqueSlugPerLanguage: CollectionBeforeValidateHook<Post> = async ({
  data,
  originalDoc,
  req,
}) => {
  const slug = data?.slug ?? originalDoc?.slug
  const language = idOf(data?.language ?? originalDoc?.language)
  if (!slug || !language) return data

  const { totalDocs } = await req.payload.count({
    collection: 'posts',
    where: {
      and: [
        { slug: { equals: slug } },
        { language: { equals: language } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
    req,
  })
  if (totalDocs > 0) throw rule('A post with this slug already exists in this language.')
  return data
}

// Translations form flat groups: one original, and at most one translation per language
export const validateTranslation: CollectionBeforeValidateHook<Post> = async ({
  data,
  originalDoc,
  req,
}) => {
  const rootId = idOf(data?.translationOf ?? originalDoc?.translationOf)
  const language = idOf(data?.language ?? originalDoc?.language)
  if (!rootId || !language) return data

  const selfId = originalDoc?.id
  if (selfId && rootId === selfId) throw rule('A post cannot be a translation of itself.')

  const root = await req.payload.findByID({
    collection: 'posts',
    id: rootId,
    depth: 0,
    draft: true,
    req,
  })
  if (root.translationOf) throw rule('Pick the original post, not another translation.')
  if (idOf(root.language) === language) {
    throw rule('A translation must be in a different language than the original.')
  }

  const count = async (where: Where) =>
    (await req.payload.count({ collection: 'posts', where, req })).totalDocs

  if (selfId && (await count({ translationOf: { equals: selfId } })) > 0) {
    throw rule('This post has translations of its own, so it cannot be a translation.')
  }
  const sameLanguage: Where = {
    and: [
      { translationOf: { equals: rootId } },
      { language: { equals: language } },
      ...(selfId ? [{ id: { not_equals: selfId } }] : []),
    ],
  }
  if ((await count(sameLanguage)) > 0) {
    throw rule('The original already has a translation in this language.')
  }
  return data
}

// Stamp the publish date the first time a post is published
export const setPublishedAt: CollectionBeforeChangeHook<Post> = ({ data, originalDoc }) => {
  if (data._status === 'published' && !data.publishedAt && !originalDoc?.publishedAt) {
    return { ...data, publishedAt: new Date().toISOString() }
  }
  return data
}

// Draft saves don't touch the public site, so only refresh when something published changed
export const revalidatePosts: CollectionAfterChangeHook<Post> = ({ doc, previousDoc, context }) => {
  if (doc._status === 'published' || previousDoc?._status === 'published') {
    revalidatePublicPages(context)
  }
  return doc
}

export const revalidatePostsOnDelete: CollectionAfterDeleteHook<Post> = ({ doc, context }) => {
  if (doc._status === 'published') revalidatePublicPages(context)
  return doc
}
