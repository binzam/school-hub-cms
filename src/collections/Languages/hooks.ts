import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeValidateHook,
  type PayloadRequest,
} from 'payload'

import { defaultContent } from '@/lib/content/defaults'
import { pickContent, stripIds } from '@/lib/content/siteContent'
import type { Language, SiteContent } from '@/payload-types'

const rule = (message: string) => new APIError(message, 400, undefined, true)

// Rules for default and enabled
export const enforceLanguageRules: CollectionBeforeValidateHook<Language> = async ({
  data,
  originalDoc,
  operation,
  req,
  context,
}) => {
  // our own "demote the old default" update must not trip these rules
  if (!data || context.skipLanguageSync) return data

  if (operation === 'create') {
    const { totalDocs } = await req.payload.count({ collection: 'languages', req })
    if (totalDocs === 0) return { ...data, isDefault: true, enabled: true } // first language: default and live
  }

  const wasDefault = originalDoc?.isDefault === true
  if (wasDefault && data.isDefault === false) {
    throw rule('Make another language the default instead of unchecking this one.')
  }

  // choosing a new default also enables it
  const becomingDefault = data.isDefault === true && !wasDefault
  const next = becomingDefault ? { ...data, enabled: true } : data

  const isDefault = next.isDefault ?? originalDoc?.isDefault ?? false
  const enabled = next.enabled ?? originalDoc?.enabled ?? false
  if (isDefault && !enabled) throw rule('The default language must be enabled.')

  return next
}

// Copy the current default language's content (or the built-in text) for a new language
async function createContentFor(languageId: number, req: PayloadRequest) {
  const { payload } = req

  const { totalDocs } = await payload.count({
    collection: 'site-content',
    where: { language: { equals: languageId } },
    req,
  })
  if (totalDocs > 0) return

  const {
    docs: [currentDefault],
  } = await payload.find({
    collection: 'languages',
    where: { and: [{ isDefault: { equals: true } }, { id: { not_equals: languageId } }] },
    limit: 1,
    depth: 0,
    req,
  })

  const source = currentDefault
    ? (
        await payload.find({
          collection: 'site-content',
          where: { language: { equals: currentDefault.id } },
          limit: 1,
          depth: 0,
          req,
        })
      ).docs[0]
    : undefined

  const base = source ? (stripIds(pickContent(source)) as Partial<SiteContent>) : defaultContent

  await payload.create({
    collection: 'site-content',
    data: { ...base, language: languageId },
    req,
  })
}

export const afterLanguageChange: CollectionAfterChangeHook<Language> = async ({
  doc,
  previousDoc,
  operation,
  req,
  context,
}) => {
  if (context.skipLanguageSync) return doc

  // 1. New language: give it content right away (before demoting the old default,
  //    so we can still copy from it)
  if (operation === 'create') await createContentFor(doc.id, req)

  // 2. Only one default: demote the others.
  //    The flag goes on req.context so the nested update's hooks see it.
  if (doc.isDefault) {
    req.context.skipLanguageSync = true
    try {
      await req.payload.update({
        collection: 'languages',
        where: { and: [{ isDefault: { equals: true } }, { id: { not_equals: doc.id } }] },
        data: { isDefault: false },
        req,
      })
    } finally {
      delete req.context.skipLanguageSync
    }
  }

  // 3. Renamed: touch its content so the document title is recomputed
  if (operation === 'update' && previousDoc.name !== doc.name) {
    await req.payload.update({
      collection: 'site-content',
      where: { language: { equals: doc.id } },
      data: {},
      req,
    })
  }

  return doc
}

// Runs while the language still exists, which matters: afterwards the database would
// null the `language` link on its content and we could no longer find it
export const beforeLanguageDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const language = await req.payload.findByID({ collection: 'languages', id, depth: 0, req })

  if (language.isDefault) {
    throw rule('The default language cannot be deleted. Make another language the default first.')
  }
  if (language.enabled) {
    throw rule(
      'Disable this language before deleting it. Deleting also removes all of its content.',
    )
  }

  await req.payload.delete({ collection: 'site-content', where: { language: { equals: id } }, req })
  await req.payload.update({
    collection: 'users',
    where: { preferredLanguage: { equals: id } },
    data: { preferredLanguage: null },
    req,
  })
}
