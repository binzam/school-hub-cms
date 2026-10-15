import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

// The public pages are pre-rendered. Call this when something that appears on them changes.
export function revalidatePublicPages(context?: Record<string, unknown>) {
  if (context?.disableRevalidate) return // set in seed scripts

  try {
    revalidatePath('/') // "/" redirects to the default language, which can change
    revalidatePath('/[lang]', 'layout') // every language page, and the layout that sets lang/dir
  } catch {
    // not running inside a Next.js request (a script, for example): nothing to revalidate
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, context }) => {
  revalidatePublicPages(context)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  revalidatePublicPages(context)
  return doc
}
