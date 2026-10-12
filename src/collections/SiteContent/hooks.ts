import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeValidateHook,
} from 'payload'

import { idOf } from '@/lib/idOf'

// One document per language
export const onePerLanguage: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const languageId = idOf(data?.language ?? originalDoc?.language)
  if (!languageId) return data

  const { totalDocs } = await req.payload.count({
    collection: 'site-content',
    where: {
      and: [
        { language: { equals: languageId } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
    req,
  })
  if (totalDocs > 0)
    throw new APIError('This language already has site content.', 400, undefined, true)

  return data
}

// The document title is the language name (shown in lists and at the top of the editor)
export const setTitle: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const languageId = idOf(data.language ?? originalDoc?.language)
  if (!languageId) return data

  const language = await req.payload.findByID({
    collection: 'languages',
    id: languageId,
    depth: 0,
    req,
  })
  return { ...data, title: language.name }
}

// The default language's content is the fallback for everything else
export const protectDefaultContent: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const doc = await req.payload.findByID({ collection: 'site-content', id, depth: 0, req })
  const languageId = idOf(doc.language)
  if (!languageId) return // orphaned document, safe to remove

  const { totalDocs } = await req.payload.count({
    collection: 'languages',
    where: { and: [{ id: { equals: languageId } }, { isDefault: { equals: true } }] },
    req,
  })
  if (totalDocs > 0) {
    throw new APIError(
      'This is the default language’s content. Edit it instead of deleting it.',
      400,
      undefined,
      true,
    )
  }
}
